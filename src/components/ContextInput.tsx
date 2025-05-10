import { ChangeEvent } from 'react';

interface ContextInputProps {
  value: string;
  onChange: (text: string) => void;
}

export default function ContextInput({ value, onChange }: ContextInputProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="w-full">
      <label htmlFor="meal-context" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Meal Details
      </label>
      <div className="relative">
        <textarea
          id="meal-context"
          rows={4}
          className="w-full px-4 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm transition-colors"
          placeholder="Describe your meal (e.g., '200g chicken breast, 1 cup rice, side salad with light vinaigrette')"
          value={value}
          onChange={handleChange}
        ></textarea>
        <div className="absolute bottom-2 right-2">
          <span className={`text-xs ${value.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
            {value.length} characters
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Adding details helps get more accurate calorie estimates
      </p>
    </div>
  );
}