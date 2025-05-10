export interface FoodItem {
  itemName: string;
  quantity: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export interface CalorieBreakdownResponse {
  mealDescription?: string;
  totalEstimatedCalories?: number;
  items?: FoodItem[];
  confidenceScore?: number;
  assumptionsMade?: string;
  error?: string;
}