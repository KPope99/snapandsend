import { useRef, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onSelect: (files: File[]) => void;
  onError?: (message: string) => void;
  multiple?: boolean;
}

const MAX_VIDEO_DURATION_SECS = 10;

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

export function ImageUploader({ onSelect, onError, multiple = true }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Reset input so the same file can be re-selected if needed
    if (inputRef.current) inputRef.current.value = '';

    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('video/')) {
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_DURATION_SECS) {
          onError?.(
            `Video must be ${MAX_VIDEO_DURATION_SECS} seconds or less (yours is ${Math.round(duration)}s). Please trim it and try again.`
          );
          continue;
        }
      }
      valid.push(file);
    }

    if (valid.length > 0) onSelect(valid);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
      >
        <div className="flex gap-3 text-gray-400">
          {/* Photo icon */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {/* Video icon */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0121 8.632v6.736a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
        <span className="mt-2 text-sm text-gray-600">Upload photo or video</span>
        <span className="text-xs text-gray-400">Video max 10 seconds</span>
      </button>
    </>
  );
}
