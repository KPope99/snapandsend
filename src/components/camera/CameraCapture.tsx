import { useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { Button } from '../common/Button';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { videoRef, isStreaming, error, startCamera, stopCamera, capturePhoto, switchCamera, facingMode } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      stopCamera();
      onCapture(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={handleClose} className="p-2 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button onClick={switchCamera} className="p-2 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Video preview */}
      <div className="flex-1 flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-4">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={startCamera} variant="secondary">Try Again</Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}
      </div>

      {/* Capture button */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8 flex flex-col items-center gap-3 bg-gradient-to-t from-black/50 to-transparent">
        <button
          onClick={handleCapture}
          disabled={!isStreaming}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>
        <span className="text-white/60 text-xs">
          {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
        </span>
      </div>
    </div>
  );
}
