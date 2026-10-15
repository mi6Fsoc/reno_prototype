import React, { useCallback, useState } from 'react';
import { ImageAsset } from '../types';

interface MoodboardProps {
  images: ImageAsset[];
  setImages: React.Dispatch<React.SetStateAction<ImageAsset[]>>;
}

const SAMPLE_BERLIN_PHOTOS = [
  {
    name: 'Giesebrechtstr. 12 (Altbau Stucco Facade)',
    url: '/src/assets/images/berlin_altbau_facade_1792074483636.jpg',
    tag: 'Altbau 1905',
  },
  {
    name: 'Karl-Marx-Allee (Plattenbau Retrofit)',
    url: '/src/assets/images/berlin_plattenbau_retrofit_1792074484532.jpg',
    tag: 'Plattenbau 1974',
  },
  {
    name: 'Bergmannkiez (Courtyard & Timber Loggias)',
    url: '/src/assets/images/berlin_courtyard_modern_1792074485327.jpg',
    tag: 'Hinterhof 1912',
  },
];

const Moodboard: React.FC<MoodboardProps> = ({ images, setImages }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];

        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 11),
            file,
            previewUrl: result,
            base64,
            type: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [setImages]
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const addSamplePhoto = async (sample: typeof SAMPLE_BERLIN_PHOTOS[0]) => {
    setLoadingSample(sample.name);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], `${sample.tag.replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 11),
            file,
            previewUrl: result,
            base64,
            type: 'image/jpeg',
          },
        ]);
        setLoadingSample(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Could not load sample file as blob, using preview directly', err);
      setImages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 11),
          file: new File([], sample.name, { type: 'image/jpeg' }),
          previewUrl: sample.url,
          base64: '',
          type: 'image/jpeg',
        },
      ]);
      setLoadingSample(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Area */}
      <div
        className={`
          border border-dashed rounded-[8px] p-6 text-center transition-all duration-200
          ${
            isDragging
              ? 'border-primary bg-[#231F1A]'
              : 'border-[#322A1F] bg-[#1A1C22] hover:border-primary/60 hover:bg-[#1E2027]'
          }
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#25211B] border border-[#3E3426] flex items-center justify-center text-primary">
            <i className="fas fa-camera text-lg"></i>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Drag & drop property elevation photos</h4>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              JPEG, PNG, HEIC up to 15MB · Facade, heating room, or roof photos
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
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
              className="cursor-pointer px-4 py-2 bg-[#25211B] border border-[#3E3426] hover:border-primary text-xs font-mono font-medium text-[#FFE8B8] rounded-[6px] transition-colors"
            >
              <i className="fas fa-folder-open mr-1.5"></i>
              Browse Device
            </label>
          </div>
        </div>
      </div>

      {/* Preset Berlin Samples for Quick Testing */}
      <div className="bg-[#181A20] p-3.5 rounded-[8px] border border-[#2B251D]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Quick-Add Berlin Sample Assets
          </span>
          <span className="text-[11px] font-mono text-primary">1-click attach</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_BERLIN_PHOTOS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => addSamplePhoto(sample)}
              disabled={loadingSample === sample.name}
              className="group flex items-center gap-2 p-2 rounded-[6px] bg-[#221E19] border border-[#352D21] hover:border-primary text-left transition-colors"
            >
              <img
                src={sample.url}
                alt={sample.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-[4px] object-cover shrink-0 border border-[#453A2A]"
              />
              <div className="overflow-hidden">
                <p className="text-[11px] font-medium text-white truncate group-hover:text-primary transition-colors">
                  {sample.tag}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 truncate">Attach photo</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gallery of Uploaded Photos */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Attached Photos ({images.length})</span>
            <button
              type="button"
              onClick={() => setImages([])}
              className="text-[11px] font-mono text-zinc-400 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] rounded-[8px] overflow-hidden bg-[#15171C] border border-[#322A1F] shadow-sm"
              >
                <img
                  src={img.previewUrl}
                  alt="Property"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  aria-label="Remove image"
                  className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow"
                >
                  <i className="fas fa-times text-[10px]"></i>
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 px-2">
                  <p className="text-[10px] font-mono text-zinc-300 truncate">
                    {img.file?.name || 'Berlin Property Photo'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Moodboard;