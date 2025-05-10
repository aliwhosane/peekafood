"use server";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { CalorieBreakdownResponse } from "@/types";

/**
 * Server action to get calorie breakdown from a meal image using Gemini API
 * 
 * @param imageDataBase64 - Base64 encoded image data
 * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @param mealContext - Additional context about the meal
 * @returns CalorieBreakdownResponse object with meal analysis or error
 */
export async function getCalorieBreakdown(
  imageDataBase64: string,
  mimeType: string,
  mealContext: string
): Promise<CalorieBreakdownResponse> {
  try {
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the gemini-pro-vision model for multimodal capabilities
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Construct the prompt for Gemini with stronger emphasis on JSON format
    const prompt = `
Your task is to analyze the provided image of a meal and the additional context and provide a detailed calorie breakdown in the form of a single, valid JSON object.
The meal context is: "${mealContext}".
ABSOLUTELY NO TEXT, EXPLANATIONS, OR ANY CHARACTERS SHOULD PRECEDE OR FOLLOW THE JSON OBJECT.

The JSON object you return MUST conform EXACTLY to the following structure, using the specified key names:

{
  "mealDescription": "string - A brief description of the analyzed meal",
  "totalEstimatedCalories": "integer - Total estimated calories for the entire meal",
  "items": [
    {
      "itemName": "string - Name of the food item",
      "quantity": "string - Quantity of the item (e.g., '100g', '1 cup')",
      "calories": "string - Calories for this item",
      "protein_g": "string - Grams of protein for this item",
      "carbs_g": "string - Grams of carbohydrates for this item",
      "fat_g": "string - Grams of fat for this item"
    }
  ],
  "confidenceScore": "number - A float between 0.0 and 1.0",
  "assumptionsMade": "string - Any assumptions made"
}

Below is an example of the expected output format with placeholder values. Ensure your output does not omit any keys or values and strictly follows this format, including all quotes around keys and string values:

{
  "mealDescription": "Example meal description",
  "totalEstimatedCalories": 500,
  "items": [
    {
      "itemName": "Sample Item 1",
      "quantity": "100g",
      "calories": "165",
      "protein_g": "31",
      "carbs_g": "0",
      "fat_g": "3.6"
    },
    {
      "itemName": "Sample Item 2",
      "quantity": "1 cup",
      "calories": "100",
      "protein_g": "5",
      "carbs_g": "20",
      "fat_g": "1.0"
    }
  ],
  "confidenceScore": 0.8,
  "assumptionsMade": "Standard serving sizes assumed."
}

Now, provide the JSON output for the meal description you were given.
`;

    // Prepare the image part for the Gemini API
    const imagePart = {
      inlineData: {
        data: imageDataBase64,
        mimeType: mimeType,
      },
    };

    // Run the analysis multiple times and collect results
    const NUM_ANALYSES = 5;
    const analysisResults: CalorieBreakdownResponse[] = [];
    
    console.log(`Running ${NUM_ANALYSES} analyses to find consensus...`);
    
    for (let i = 0; i < NUM_ANALYSES; i++) {
      try {
        console.log(`Analysis attempt ${i + 1}/${NUM_ANALYSES}`);
        
        // Call the Gemini API
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                imagePart,
              ],
            },
          ],
        });

        const response = result.response;
        const responseText = response.text();
        
        // Process and validate the response
        const processedResponse = await processGeminiResponse(responseText, model);
        if (processedResponse) {
          analysisResults.push(processedResponse);
          console.log(`Analysis ${i + 1} successful`);
        }
      } catch (analysisError) {
        console.error(`Error in analysis attempt ${i + 1}:`, analysisError);
      }
    }
    
    // If we couldn't get any valid results, return an error
    if (analysisResults.length === 0) {
      return {
        error: "Failed to get any valid calorie breakdown from AI after multiple attempts.",
        totalEstimatedCalories: 0,
        items: [],
      };
    }
    
    // Find the most common result (consensus)
    const consensusResult = findConsensusResult(analysisResults);
    console.log("Consensus result found");
    
    return consensusResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      error: "Failed to get calorie breakdown from AI. Please try again later.",
      totalEstimatedCalories: 0,
      items: [],
    };
  }
}

/**
 * Processes a raw response from Gemini API and returns a validated CalorieBreakdownResponse
 * 
 * @param responseText - Raw text response from Gemini API
 * @param model - The Gemini model instance to use for validation
 * @returns A validated CalorieBreakdownResponse or null if processing failed
 */
async function processGeminiResponse(
  responseText: string,
  model: any
): Promise<CalorieBreakdownResponse | null> {
  try {
    // Clean the response text by removing any markdown code block formatting
    let cleanedResponse = responseText;
    
    // Remove markdown code block markers if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*$/g, '');
    
    // Try to extract just the JSON part using regex
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    // Remove any text that appears between JSON properties (like Gemini's thought process)
    // This regex looks for text between a property value and the next property delimiter
    cleanedResponse = cleanedResponse.replace(/("[^"]*")\s*[^,:{\[\]\}]+([:,\{\[\]\}])/g, '$1$2');
    
    // Fix missing values after property names (e.g., "totalEstimatedCalories", -> "totalEstimatedCalories": 0,)
    cleanedResponse = cleanedResponse.replace(/"([^"]+)",(\s*[\},\]])/g, '"$1": 0,$2');
    cleanedResponse = cleanedResponse.replace(/"([^"]+)",(\s*")/g, '"$1": 0,$2');
    
    // Fix trailing commas in arrays and objects
    cleanedResponse = cleanedResponse.replace(/,(\s*[\}\]])/g, '$1');
    
    console.log("Cleaned response:", cleanedResponse);
    
    try {
      // Validate the parsed response by sending it back to Gemini for verification
      const validationResult = await validateJsonFormat(cleanedResponse, model);
      return validationResult;
    } catch (parseError) {
      console.error("Failed to process Gemini API response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error processing Gemini response:", error);
    return null;
  }
}

/**
 * Validates and potentially corrects a JSON response by sending it back to Gemini
 * 
 * @param response - The parsed response to validate
 * @param model - The Gemini model instance to use for validation
 * @returns A corrected response if validation found issues, or null if no issues found
 */
async function validateJsonFormat(
  response: string, 
  model: any
): Promise<CalorieBreakdownResponse> {
  try {
    // Create a validation prompt
    const validationPrompt = `
I have received the following JSON response from an AI analysis of a meal image:

${response}

Please verify if this JSON strictly follows the expected format for a meal calorie breakdown:
1. It should have mealDescription (string), totalEstimatedCalories (number), items (array), confidenceScore (number), and assumptionsMade (string)
2. Each item should have itemName (string), quantity (string), calories (number), protein_g (number), carbs_g (number), and fat_g (number)

If the JSON is valid and follows the format, respond with EXACTLY the same JSON.
If there are any issues, fix them and respond with ONLY the corrected JSON.
Do not include any explanations, markdown formatting, or text before or after the JSON.
`;

    // Call the Gemini API for validation using the passed model instance
    const validationResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: validationPrompt }] }],
    });

    const validationResponse = validationResult.response.text();
    
    // Clean the validation response
    let cleanedValidation = validationResponse;
    cleanedValidation = cleanedValidation.replace(/```json\s*/g, '');
    cleanedValidation = cleanedValidation.replace(/```\s*$/g, '');
    
    // Extract just the JSON part
    const jsonMatch = cleanedValidation.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedValidation = jsonMatch[0];
    }
    
    // Parse the validation response
    try {
      const validatedResponse: CalorieBreakdownResponse = JSON.parse(cleanedValidation);
      return validatedResponse;
    } catch (error) {
      console.error("Failed to parse validation response:", error);
      return JSON.parse(response); // Return the original response in case of an error in parsing
    }
  } catch (error) {
    console.error("Error during JSON validation:", error);
    return JSON.parse(response); // Return the original response in case of an error in validation process
  }
}

/**
 * Finds the most common result (consensus) from multiple analysis results
 * 
 * @param results - Array of CalorieBreakdownResponse objects
 * @returns The most common CalorieBreakdownResponse
 */
function findConsensusResult(results: CalorieBreakdownResponse[]): CalorieBreakdownResponse {
  if (results.length === 1) {
    return results[0];
  }
  
  // Create a map to count occurrences of each result
  const resultCounts = new Map<string, { count: number, result: CalorieBreakdownResponse }>();
  
  // Count occurrences of each result based on its JSON string representation
  for (const result of results) {
    // Create a simplified version of the result for comparison
    // This focuses on the most important aspects like meal description and items
    const simplifiedResult = {
      mealDescription: result.mealDescription,
      totalEstimatedCalories: result.totalEstimatedCalories,
      items: result.items?.map(item => ({
        itemName: item.itemName,
        calories: item.calories
      }))
    };
    
    const resultKey = JSON.stringify(simplifiedResult);
    
    if (resultCounts.has(resultKey)) {
      resultCounts.get(resultKey)!.count++;
    } else {
      resultCounts.set(resultKey, { count: 1, result });
    }
  }
  
  // Find the result with the highest count
  let maxCount = 0;
  let consensusResult = results[0];
  
  for (const [_, { count, result }] of resultCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      consensusResult = result;
    }
  }
  
  // If there's a tie, use the result with the highest confidence score
  if (maxCount === 1) {
    let highestConfidence = 0;
    
    for (const result of results) {
      const confidence = result.confidenceScore || 0;
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        consensusResult = result;
      }
    }
  }
  
  // Add information about the consensus process
  consensusResult.assumptionsMade = `${consensusResult.assumptionsMade || ''} (Based on consensus from ${maxCount}/${results.length} analyses)`.trim();
  
  return consensusResult;
}