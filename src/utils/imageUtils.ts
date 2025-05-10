/**
 * Converts a File object to a Base64 encoded string
 * @param file - The file to convert
 * @returns Promise that resolves with the Base64 string (without the data URL prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Get only the base64 part
    reader.onerror = (error) => reject(error);
  });
};