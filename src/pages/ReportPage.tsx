import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../components/camera/CameraCapture';
import { ImageUploader } from '../components/camera/ImageUploader';
import { ImagePreview } from '../components/camera/ImagePreview';
import { ReportForm } from '../components/reports/ReportForm';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { uploadImages, createReport, reverseGeocode, analyzeImages, ImageAnalysisResult } from '../services/api';
import { ReportCategory } from '../types';

type Step = 'capture' | 'form';
type LocationMode = 'gps' | 'manual';

export function ReportPage() {
  const navigate = useNavigate();
  const { location, isLoading: locationLoading, error: locationError, refreshLocation } = useLocation();
  const { user, sessionId } = useAuth();

  const [step, setStep] = useState<Step>('capture');
  const [showCamera, setShowCamera] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // Location mode state
  const [locationMode, setLocationMode] = useState<LocationMode>('gps');
  const [manualAddress, setManualAddress] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleCapture = useCallback((dataUrl: string) => {
    setShowCamera(false);

    // Convert data URL to File
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFiles(prev => [...prev, file]);
        setImagePreview(prev => [...prev, dataUrl]);
      });
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    const newPreviews: string[] = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagePreview(prev => [...prev, ...newPreviews]);
          setImageFiles(prev => [...prev, ...files]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleContinue = async () => {
    if (imagePreview.length === 0) {
      setError('Please add at least one image');
      return;
    }

    // Validate location based on mode
    if (locationMode === 'gps' && !location) {
      setError('GPS location not available. Please enable location services or use manual location.');
      return;
    }

    if (locationMode === 'manual' && !manualAddress.trim()) {
      setError('Please enter a location address');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Analyze images with AI
      const result = await analyzeImages(imageFiles);
      setAiAnalysis(result.analysis);
      setUploadedImageUrls(result.imageUrls);
      setStep('form');
    } catch (err) {
      console.error('Error analyzing images:', err);
      // Continue to form even if analysis fails
      setAiAnalysis(null);
      setStep('form');
    } finally {
      setIsAnalyzing(false);
    }
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
      // Use already uploaded URLs from analysis, or upload now
      let imageUrls = uploadedImageUrls;
      if (imageUrls.length === 0) {
        imageUrls = await uploadImages(imageFiles);
      }

      // Create report
      await createReport({
        ...data,
        latitude: finalLat,
        longitude: finalLng,
        address: finalAddress,
        imageUrls,
        userId: user?.id,
        sessionId: sessionId || undefined
      });

      navigate('/');
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
            {step === 'capture' ? 'Add Photo' : 'Report Details'}
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
            <ImageUploader onSelect={handleFileSelect} />

            {/* Preview */}
            {imagePreview.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected Images ({imagePreview.length}/5)
                </h3>
                <ImagePreview images={imagePreview} onRemove={handleRemoveImage} />
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
                        <span className="text-sm text-red-500">{locationError}</span>
                        <button onClick={refreshLocation} className="ml-2 text-sm text-emerald-600 underline">
                          Retry
                        </button>
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
              disabled={imagePreview.length === 0 || isAnalyzing}
              isLoading={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing with AI...' : 'Continue'}
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

            {/* AI Analysis indicator */}
            {aiAnalysis && aiAnalysis.confidence > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-700">AI-Detected Details</span>
                  <span className="text-xs text-emerald-600 ml-auto">
                    {Math.round(aiAnalysis.confidence * 100)}% confidence
                  </span>
                </div>
                {aiAnalysis.details.length > 0 && (
                  <ul className="text-xs text-gray-600 space-y-1">
                    {aiAnalysis.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-emerald-500">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Review and adjust the details below as needed.
                </p>
              </div>
            )}

            {/* Form */}
            <ReportForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              initialValues={aiAnalysis ? {
                title: aiAnalysis.title,
                description: aiAnalysis.description,
                category: aiAnalysis.category
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
