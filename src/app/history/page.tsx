'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserHistory, deleteHistoryItem } from '@/services/historyService';
import { CalorieBreakdownResponse } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface HistoryItem {
  id: string;
  timestamp: { toDate: () => Date };
  mealContext: string;
  result: CalorieBreakdownResponse;
  imageBase64?: string;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!loading && user) {
        try {
          const userHistory = await getUserHistory(user.uid);
          setHistory(userHistory as HistoryItem[]);
        } catch (error) {
          console.error('Error fetching history:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (!loading && !user) {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [user, loading]);

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  if (loading || isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">History</h1>
        <p className="mb-4">Please sign in to view your meal analysis history.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Meal Analysis History</h1>
      
      {history.length === 0 ? (
        <p>You haven&apos;t analyzed any meals yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {item.imageBase64 && (
                    <div className="flex-shrink-0">
                      <img 
                        src={`data:image/jpeg;base64,${item.imageBase64}`} 
                        alt="Meal thumbnail" 
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{item.result.mealDescription}</h2>
                    <p className="text-gray-500 text-sm">
                      {formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })}
                    </p>
                    <p className="text-gray-700 mt-1">Context: {item.mealContext}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              
              <div className="mt-3">
                <p className="font-medium">Total Calories: {item.result.totalEstimatedCalories}</p>
                
                {item.result.items && item.result.items.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Items:</p>
                    <ul className="list-disc list-inside ml-2">
                      {item.result.items.map((foodItem, index) => (
                        <li key={index}>
                          {foodItem.itemName} ({foodItem.quantity}) - {foodItem.calories} cal
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}