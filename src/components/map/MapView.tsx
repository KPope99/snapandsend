import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Report, CATEGORIES } from '../../types';
import { formatRelativeTime } from '../../utils/distance';

// Fix default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

interface MapViewProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (report: Report) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function getCategoryIcon(category: string) {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.icon || '📌';
}

function createCustomIcon(category: string, status: string) {
  const emoji = getCategoryIcon(category);
  const bgColor = status === 'verified' ? '#10b981' : status === 'resolved' ? '#3b82f6' : '#f59e0b';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      background: #3b82f6;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export function MapView({
  reports,
  center = [9.0820, 8.6753], // Nigeria center
  zoom = 13,
  onMarkerClick,
  userLocation
}: MapViewProps) {
  const mapCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : center;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="w-full h-full rounded-xl"
      style={{ minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={mapCenter} />

      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Report markers */}
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createCustomIcon(report.category, report.status)}
          eventHandlers={{
            click: () => onMarkerClick?.(report)
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-gray-900">{report.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{report.description.slice(0, 100)}...</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{getCategoryIcon(report.category)} {report.category}</span>
                <span>•</span>
                <span>{formatRelativeTime(report.createdAt)}</span>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-emerald-600">{report.agreementCount} verifications</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
