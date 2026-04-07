import { useEffect, useState } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { Button } from '../common/Button';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type CaptureMode = 'photo' | 'video';

const MAX_SECS = 10;

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const {
    videoRef, isStreaming, isRecording, recordingSeconds,
    error, startCamera, stopCamera, capturePhoto,
    startRecording, stopRecording, switchCamera, facingMode,
  } = useCamera();

  const [mode, setMode] = useState<CaptureMode>('photo');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handlePhoto = async () => {
    const file = await capturePhoto();
    if (file) {
      stopCamera();
      onCapture(file);
    }
  };

  const handleStartVideo = () => {
    startRecording((file) => {
      if (file) {
        stopCamera();
        onCapture(file);
      }
    });
  };

  const handleStopVideo = () => {
    stopRecording();
    // onCapture will be called via the startRecording callback once onstop fires
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Remaining seconds bar width
  const progressPct = isRecording
    ? ((MAX_SECS - recordingSeconds) / MAX_SECS) * 100
    : 100;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={handleClose} className="p-2 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Recording timer */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-mono">
              {recordingSeconds}s / {MAX_SECS}s
            </span>
          </div>
        )}

        <button onClick={switchCamera} className="p-2 text-white" disabled={isRecording}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Recording progress bar */}
      {isRecording && (
        <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-gray-700">
          <div
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Camera preview */}
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

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 pt-4 flex flex-col items-center gap-5 bg-gradient-to-t from-black/60 to-transparent">

        {/* Capture / Record button */}
        {mode === 'photo' ? (
          <button
            onClick={handlePhoto}
            disabled={!isStreaming}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>
        ) : (
          <button
            onClick={isRecording ? handleStopVideo : handleStartVideo}
            disabled={!isStreaming}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all ${
              isRecording ? 'border-red-500' : 'border-white'
            }`}
          >
            {isRecording ? (
              /* Stop square */
              <div className="w-8 h-8 rounded-md bg-red-500" />
            ) : (
              /* Red record circle */
              <div className="w-16 h-16 rounded-full bg-red-500" />
            )}
          </button>
        )}

        {/* Photo / Video mode toggle */}
        <div className="flex bg-black/40 rounded-full p-1 gap-1">
          <button
            onClick={() => setMode('photo')}
            disabled={isRecording}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'photo' ? 'bg-white text-black' : 'text-white'
            }`}
          >
            Photo
          </button>
          <button
            onClick={() => setMode('video')}
            disabled={isRecording}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'video' ? 'bg-white text-black' : 'text-white'
            }`}
          >
            Video
          </button>
        </div>

        {/* Hint */}
        <p className="text-white/60 text-xs">
          {mode === 'video'
            ? isRecording
              ? 'Tap stop or auto-stops at 10s'
              : 'Tap to start recording (max 10s)'
            : facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
        </p>
      </div>
    </div>
  );
}
