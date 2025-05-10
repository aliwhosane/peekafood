import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CalorieBreakdownResponse } from '@/types';

interface HistoryItem {
  id?: string;
  userId: string;
  timestamp: Timestamp;
  imageBase64?: string; // Changed from imageUrl to imageBase64
  mealContext: string;
  result: CalorieBreakdownResponse;
}

/**
 * Save a meal analysis to user history
 */
export async function saveToHistory(
  userId: string, 
  mealContext: string, 
  result: CalorieBreakdownResponse,
  imageBase64?: string // Changed parameter name from imageUrl to imageBase64
): Promise<string> {
  try {
    console.log("Attempting to save to history with userId:", userId);
    console.log("Firebase app initialized:", !!db);
    
    const historyRef = collection(db, 'history');
    
    // Create the base document data
    const docData: Record<string, unknown> = {
      userId,
      timestamp: Timestamp.now(),
      mealContext,
      result
    };
    
    // Only add imageBase64 if it's defined, otherwise set to null
    if (imageBase64 !== undefined) {
      docData.imageBase64 = imageBase64;
    } else {
      docData.imageBase64 = null; // Use null instead of undefined
    }
    
    console.log("Document data prepared:", docData);
    
    const docRef = await addDoc(historyRef, docData);
    console.log("Successfully added document with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}

/**
 * Get user's meal analysis history
 */
export async function getUserHistory(userId: string): Promise<HistoryItem[]> {
  try {
    const historyRef = collection(db, 'history');
    const q = query(
      historyRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history: HistoryItem[] = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      } as HistoryItem);
    });
    
    return history;
  } catch (error) {
    console.error('Error getting user history:', error);
    throw error;
  }
}

/**
 * Delete a history item
 */
export async function deleteHistoryItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'history', itemId));
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw error;
  }
}