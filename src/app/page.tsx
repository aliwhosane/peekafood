'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ContextInput from '@/components/ContextInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import { getCalorieBreakdown } from './actions';
import { CalorieBreakdownResponse } from '@/types';
import { fileToBase64 } from '@/utils/imageUtils';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth(); // Use the useAuth hook to get the current user
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [mealContext, setMealContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calorieData, setCalorieData] = useState<CalorieBreakdownResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedImage) {
      return;
    }
    
    // Reset states
    setIsLoading(true);
    setError(null);
    setCalorieData(null);
    
    try {
      // Convert image to base64
      const base64Content = await fileToBase64(selectedImage);
      
      // Call the server action with user ID if available
      const result = await getCalorieBreakdown(
        base64Content,
        selectedImage.type,
        mealContext,
        user?.uid // Pass the user ID if the user is logged in
      );
      
      if (result.error) {
        setError(result.error);
      } else {
        setCalorieData(result);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-4xl mb-8 flex justify-between items-center">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">PeekAFood</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Get a calorie breakdown of your meal with AI!</p>
        </div>
        <AuthButton /> {/* Add the AuthButton component here */}
      </header>
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Upload Meal & Add Context</h2>
          
          <div className="space-y-8">
            <ImageUploader onImageSelect={setSelectedImage} />
            
            <ContextInput 
              value={mealContext}
              onChange={setMealContext}
            />
            
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedImage || isLoading}
                className={`px-6 py-3 rounded-md text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  !selectedImage || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
                aria-label="Analyze meal image"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Analyze Meal'}
              </button>
            </div>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Calorie Breakdown</h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-600 dark:text-gray-300">Analyzing your meal...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments</p>
            </div>
          ) : error ? (
            <div className="text-red-500 p-5 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <p className="font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Error
              </p>
              <p className="mt-1">{error}</p>
            </div>
          ) : (
            <ResultsDisplay data={calorieData} />
          )}
        </section>
      </div>
      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} PeekAFood - AI Calorie Counter</p>
      </footer>
    </main>
  );
}