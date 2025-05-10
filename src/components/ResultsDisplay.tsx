import { CalorieBreakdownResponse } from '@/types';

interface ResultsDisplayProps {
  data: CalorieBreakdownResponse | null;
}

export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">Your meal&apos;s calorie details will appear here...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Upload a photo and click &quot;Analyze Meal&quot;</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="text-red-500 p-5 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Error</span>
        </div>
        <p>{data.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-auto max-h-[600px] pr-2 custom-scrollbar">
      {data.mealDescription && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Meal Description
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{data.mealDescription}</p>
        </div>
      )}
      
      {data.totalEstimatedCalories !== undefined && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">Total Estimated Calories</h3>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.totalEstimatedCalories}</span>
            <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">kcal</span>
          </div>
        </div>
      )}
      
      {data.items && data.items.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Items Breakdown</h3>
          <ul className="space-y-3">
            {data.items.map((item, index) => (
              <li key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.itemName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 dark:text-blue-400 font-medium">{item.calories} kcal</p>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 text-sm">
                  {item.protein_g !== undefined && (
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Protein:</span> {item.protein_g}g
                    </div>
                  )}
                  {item.carbs_g !== undefined && (
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Carbs:</span> {item.carbs_g}g
                    </div>
                  )}
                  {item.fat_g !== undefined && (
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Fat:</span> {item.fat_g}g
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.confidenceScore !== undefined && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Confidence</h3>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                <div 
                  style={{ width: `${(data.confidenceScore * 100).toFixed(0)}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <p className="mt-1 text-right font-medium text-gray-700 dark:text-gray-300">{(data.confidenceScore * 100).toFixed(0)}%</p>
            </div>
          </div>
        )}
        
        {data.assumptionsMade && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assumptions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{data.assumptionsMade}</p>
          </div>
        )}
      </div>
    </div>
  );
}