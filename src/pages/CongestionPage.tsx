import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function CongestionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);

  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError('Google Maps API key not configured');
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeMap();
    };
    script.onerror = () => {
      setError('Failed to load Google Maps');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default to Lagos, Nigeria
    const defaultCenter = { lat: 6.5244, lng: 3.3792 };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Add traffic layer
    trafficLayerRef.current = new window.google.maps.TrafficLayer();
    trafficLayerRef.current.setMap(mapInstanceRef.current);

    setMapLoaded(true);
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!window.google || !mapInstanceRef.current) {
      setError('Map not loaded yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: address }, (results: any, status: any) => {
      setIsLoading(false);

      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(14);

        // Add a marker
        new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position: location,
          title: address,
        });
      } else {
        setError('Location not found. Please try a different address.');
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Traffic Congestion</h1>
        <p className="text-sm text-gray-500 mt-1">Live traffic conditions</p>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter address to check traffic..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !mapLoaded}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Search
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>

      {/* Traffic Legend */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-green-500 rounded"></div>
            <span className="text-gray-600">Fast</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-orange-500 rounded"></div>
            <span className="text-gray-600">Slow</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-red-600 rounded"></div>
            <span className="text-gray-600">Heavy</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <main className="flex-1 relative">
        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-2 text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {error && !mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <svg className="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-2 text-gray-700 font-medium">Map Error</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="absolute inset-0" />
      </main>

      {/* Copyright */}
      <div className="bg-gray-100 px-4 py-2 text-center text-xs text-gray-500">
        © Tech84
      </div>
    </div>
  );
}
