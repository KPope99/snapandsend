import { useLocation } from '../../context/LocationContext';
import { getDistance, formatDistance } from '../../utils/distance';

interface ProximityIndicatorProps {
  latitude: number;
  longitude: number;
}

export function ProximityIndicator({ latitude, longitude }: ProximityIndicatorProps) {
  const { location, isLoading, error } = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Getting location...</span>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span>Location unavailable</span>
      </div>
    );
  }

  const distance = getDistance(location.latitude, location.longitude, latitude, longitude);
  const isNearby = distance <= 500;

  return (
    <div className={`flex items-center gap-2 text-sm ${isNearby ? 'text-emerald-600' : 'text-gray-600'}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{formatDistance(distance)} away</span>
      {isNearby && <span className="text-emerald-600 font-medium">(Nearby)</span>}
    </div>
  );
}
