interface ImagePreviewProps {
  images: string[];
  files?: File[];
  onRemove: (index: number) => void;
}

function isVideoPreview(url: string, file?: File): boolean {
  if (file) return file.type.startsWith('video/');
  return /\.(mp4|mov|webm|avi|m4v)$/i.test(url);
}

export function ImagePreview({ images, files, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {images.map((src, index) => (
        <div key={index} className="relative flex-shrink-0 w-24 h-24">
          {isVideoPreview(src, files?.[index]) ? (
            <>
              <video
                src={src}
                className="w-24 h-24 object-cover rounded-lg bg-gray-900"
                muted
                playsInline
                preload="metadata"
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <img
              src={src}
              alt={`Preview ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
