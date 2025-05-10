import { ChangeEvent, useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onImageSelect(null);
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="meal-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Meal Photo
      </label>
      <div 
        className={`relative border-2 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'} 
        ${previewUrl ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} 
        rounded-lg p-6 text-center transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700/30`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!previewUrl ? (
          <div className="space-y-3">
            <svg className="mx-auto h-14 w-14 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <button 
                type="button" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Select Image
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">or drag and drop</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        ) : (
          <div className="relative">
            <button 
              onClick={() => {
                setPreviewUrl(null);
                onImageSelect(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="overflow-hidden rounded-md shadow-md">
              <img 
                src={previewUrl} 
                alt="Selected meal preview" 
                className="max-w-full h-auto mx-auto object-cover" 
                style={{ maxHeight: '280px' }} 
              />
            </div>
          </div>
        )}
        <input
          id="meal-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${previewUrl ? 'pointer-events-none' : ''}`}
        />
      </div>
      {previewUrl && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Click the X to remove and select a different image
        </p>
      )}
    </div>
  );
}