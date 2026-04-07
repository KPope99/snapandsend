import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../components/camera/CameraCapture';
import { ImageUploader } from '../components/camera/ImageUploader';
import { ImagePreview } from '../components/camera/ImagePreview';
import { ReportForm } from '../components/reports/ReportForm';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { uploadImages, createReport, reverseGeocode, analyzeImage, ImageAnalysis } from '../services/api';
import { ReportCategory } from '../types';

type Step = 'capture' | 'form';
type LocationMode = 'gps' | 'manual';

export function ReportPage() {
  const navigate = useNavigate();
  const { location, isLoading: locationLoading, error: locationError, refreshLocation, permissionDenied } = useLocation();
  const { user, sessionId } = useAuth();

  const [step, setStep] = useState<Step>('capture');
  const [showCamera, setShowCamera] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ImageAnalysis | null>(null);
  // Cache uploaded URLs to avoid re-uploading on submit
  const uploadedUrlsCache = useRef<Map<File, string>>(new Map());

  // Location mode state - default to manual if permission already denied
  const [locationMode, setLocationMode] = useState<LocationMode>(permissionDenied ? 'manual' : 'gps');
  const [manualAddress, setManualAddress] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Auto-switch to manual mode when location permission is denied
  useEffect(() => {
    if (permissionDenied) {
      setLocationMode('manual');
    }
  }, [permissionDenied]);

  // Upload a single file and trigger AI analysis on the first image
  const uploadAndAnalyze = useCallback((file: File) => {
    const formData = new FormData();
    formData.append('images', file);

    setIsAnalyzing(true);
    setAiSuggestions(null);

    fetch('/api/images/upload', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        uploadedUrlsCache.current.set(file, data.imageUrls[0]);
        return analyzeImage(data.imageUrls[0]);
      })
      .then(analysis => setAiSuggestions(analysis))
      .catch(() => { /* analysis is optional, ignore errors */ })
      .finally(() => setIsAnalyzing(false));
  }, []);

  const handleCapture = useCallback((file: File) => {
    setShowCamera(false);
    const previewUrl = URL.createObjectURL(file);
    setImageFiles(prev => {
      if (prev.length === 0) uploadAndAnalyze(file);
      return [...prev, file];
    });
    setImagePreview(prev => [...prev, previewUrl]);
  }, [uploadAndAnalyze]);

  const handleFileSelect = useCallback((files: File[]) => {
    const previews: string[] = new Array(files.length);
    let resolved = 0;

    const trySetState = () => {
      resolved++;
      if (resolved === files.length) {
        setImagePreview(prev => [...prev, ...previews]);
        setImageFiles(prev => {
          if (prev.length === 0 && files.length > 0) uploadAndAnalyze(files[0]);
          return [...prev, ...files];
        });
      }
    };

    files.forEach((file, i) => {
      if (file.type.startsWith('video/')) {
        // Use object URL for video previews (avoids large data URLs)
        previews[i] = URL.createObjectURL(file);
        trySetState();
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          previews[i] = reader.result as string;
          trySetState();
        };
        reader.readAsDataURL(file);
      }
    });
  }, [uploadAndAnalyze]);

  const handleRemoveImage = useCallback((index: number) => {
    setImagePreview(prev => {
      // Revoke object URLs created for video previews to free memory
      const url = prev[index];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setImageFiles(prev => {
      uploadedUrlsCache.current.delete(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleContinue = () => {
    if (imagePreview.length === 0) {
      setError('Please add at least one photo or video');
      return;
    }

    // If GPS denied, switch to manual instead of blocking
    if (locationMode === 'gps' && (permissionDenied || (!location && !locationLoading))) {
      setLocationMode('manual');
      setError('Please enter your location below.');
      return;
    }

    if (locationMode === 'gps' && locationLoading) {
      setError('Still getting your location, please wait a moment.');
      return;
    }

    if (locationMode === 'manual' && !manualAddress.trim()) {
      setError('Please enter a location address.');
      return;
    }

    setError(null);
    setStep('form');
  };

  const handleSubmit = async (data: { title: string; description: string; category: ReportCategory }) => {
    let finalLat: number;
    let finalLng: number;
    let finalAddress: string | undefined;

    if (locationMode === 'gps') {
      if (!location) {
        setError('Location is required. Please enable location services or use manual location.');
        return;
      }
      finalLat = location.latitude;
      finalLng = location.longitude;

      // Get address from GPS coordinates
      try {
        const result = await reverseGeocode(location.latitude, location.longitude);
        finalAddress = result.address;
      } catch {
        // Address is optional
      }
    } else {
      // Manual location mode
      if (!manualAddress.trim()) {
        setError('Please enter a location address');
        return;
      }

      // Use provided coordinates or default to a central location
      // In production, you'd want to geocode the address to get coordinates
      if (manualLat && manualLng) {
        finalLat = parseFloat(manualLat);
        finalLng = parseFloat(manualLng);
      } else {
        // Default coordinates (can be updated based on region)
        // Using a central Nigeria location as default
        finalLat = 9.0820;
        finalLng = 8.6753;
      }
      finalAddress = manualAddress.trim();
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use cached URLs for images already uploaded during AI analysis; upload the rest in one batch
      const cachedUrls = imageFiles.map(f => uploadedUrlsCache.current.get(f));
      const filesToUpload = imageFiles.filter((_, i) => !cachedUrls[i]);
      const newUrls = filesToUpload.length > 0 ? await uploadImages(filesToUpload) : [];
      let newUrlIdx = 0;
      const imageUrls = cachedUrls.map(cached => cached ?? newUrls[newUrlIdx++]);

      // Create report
      const result = await createReport({
        ...data,
        latitude: finalLat,
        longitude: finalLng,
        address: finalAddress,
        imageUrls,
        userId: user?.id,
        sessionId: sessionId || undefined
      });

      // Navigate with merge status
      if (result.merged) {
        navigate('/', {
          state: {
            notification: {
              type: 'info',
              message: result.mergeMessage || 'Your report was merged with a similar existing incident as a verification.'
            }
          }
        });
      } else {
        navigate('/', {
          state: {
            notification: {
              type: 'success',
              message: 'Report submitted successfully!'
            }
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {step === 'capture' ? 'Add Photo / Video' : 'Report Details'}
          </h1>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          <div className={`flex-1 h-1 rounded-full ${step === 'capture' || step === 'form' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'form' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {step === 'capture' ? (
          <div className="space-y-4">
            {/* Camera button */}
            <button
              onClick={() => setShowCamera(true)}
              className="flex items-center justify-center w-full h-40 bg-gray-900 rounded-xl text-white"
            >
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="mt-2 block">Take Photo</span>
              </div>
            </button>

            {/* Or divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Upload button */}
            <ImageUploader onSelect={handleFileSelect} onError={setError} />

            {/* Preview */}
            {imagePreview.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected ({imagePreview.length}/5)
                </h3>
                <ImagePreview images={imagePreview} files={imageFiles} onRemove={handleRemoveImage} />
              </div>
            )}

            {/* Location Mode Toggle */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <div className="flex bg-gray-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setLocationMode('gps')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      locationMode === 'gps'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    GPS
                  </button>
                  <button
                    onClick={() => setLocationMode('manual')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      locationMode === 'manual'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {locationMode === 'gps' ? (
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${location ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    {locationLoading ? (
                      <span className="text-sm text-gray-500">Getting location...</span>
                    ) : locationError ? (
                      <div>
                        <span className="text-sm text-gray-500">{locationError}</span>
                        {!permissionDenied && (
                          <button onClick={refreshLocation} className="ml-2 text-sm text-emerald-600 underline">
                            Retry
                          </button>
                        )}
                      </div>
                    ) : location ? (
                      <span className="text-sm text-gray-700">
                        {location.address || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Location not available</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {permissionDenied && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-amber-700">Location access denied. Type the address where this happened.</p>
                    </div>
                  )}
                  <Input
                    placeholder="Enter address or landmark (e.g., Main Street, near GTBank)"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Describe the location where this happened. Be as specific as possible.
                  </p>

                  {/* Optional: Advanced coordinates input */}
                  <details className="text-xs">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                      Advanced: Enter coordinates (optional)
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Latitude"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        type="number"
                        step="any"
                      />
                      <Input
                        placeholder="Longitude"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        type="number"
                        step="any"
                      />
                    </div>
                  </details>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              onClick={handleContinue}
              className="w-full"
              disabled={imagePreview.length === 0}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <ImagePreview images={imagePreview} onRemove={handleRemoveImage} />
              <button
                onClick={() => setStep('capture')}
                className="mt-2 text-sm text-emerald-600"
              >
                + Add more photos
              </button>
            </div>

            {/* Location summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-700">
                  {locationMode === 'gps'
                    ? (location?.address || `${location?.latitude.toFixed(5)}, ${location?.longitude.toFixed(5)}`)
                    : manualAddress
                  }
                </span>
                <button
                  onClick={() => setStep('capture')}
                  className="ml-auto text-xs text-emerald-600"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Form */}
            <ReportForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              isAnalyzing={isAnalyzing}
              initialValues={aiSuggestions ? {
                title: aiSuggestions.title,
                description: aiSuggestions.description,
                category: aiSuggestions.category as ReportCategory,
              } : undefined}
              customCategory={aiSuggestions?.isNewCategory ? {
                value: aiSuggestions.category,
                label: aiSuggestions.categoryLabel,
              } : undefined}
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-6 mb-4">
          © Tech84
        </div>
      </main>
    </div>
  );
}
