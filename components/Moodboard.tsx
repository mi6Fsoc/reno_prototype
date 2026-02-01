import React, { useCallback, useState } from 'react';
import { ImageAsset } from '../types';

interface MoodboardProps {
  images: ImageAsset[];
  setImages: React.Dispatch<React.SetStateAction<ImageAsset[]>>;
}

const Moodboard: React.FC<MoodboardProps> = ({ images, setImages }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Extract base64 content strictly
        const base64 = result.split(',')[1];
        
        setImages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: result,
          base64,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [setImages]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="w-full">
      <div 
        className={`
          border border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging ? 'border-primary bg-accent' : 'border-input bg-card'}
          hover:border-primary/50 hover:bg-accent/50
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-muted p-4 rounded-full">
            <i className="fas fa-cloud-upload-alt text-3xl text-muted-foreground"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Drag & Drop Renovation Photos</h3>
            <p className="text-sm text-muted-foreground mt-1">or click to browse (Max 10MB)</p>
          </div>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="hidden" 
            id="file-upload"
            onChange={(e) => processFiles(e.target.files)}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer px-4 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Select Files
          </label>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm border border-border">
              <img src={img.previewUrl} alt="Upload" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate px-2">
                {img.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Moodboard;