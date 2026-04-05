import { Link } from 'react-router-dom';
import { Incident, IncidentStatus } from '../../types/incident';

interface IncidentCardProps {
  incident: Incident;
}

const statusColors: Record<IncidentStatus, string> = {
  pending: 'bg-red-100 text-red-800',
  investigating: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
};

const statusLabels: Record<IncidentStatus, string> = {
  pending: 'Pending',
  investigating: 'Investigating',
  resolved: 'Resolved',
};

const categoryLabels: Record<string, string> = {
  road_damage: 'Road Damage', traffic_light: 'Traffic Light', flooding: 'Flooding',
  illegal_dumping: 'Illegal Dumping', vandalism: 'Vandalism', other: 'Other',
};

export function IncidentCard({ incident }: IncidentCardProps) {
  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Link
      to={`/admin/incident/${incident.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{incident.title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[incident.status]}`}>
          {statusLabels[incident.status]}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {categoryLabels[incident.category] || incident.category}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate max-w-32">{incident.location.address}</span>
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formattedDate}
        </span>
      </div>
      {incident.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {incident.images.slice(0, 3).map((img, idx) => (
            <div key={img.id} className="w-16 h-16 rounded bg-gray-100 overflow-hidden">
              <img src={img.url} alt={`Incident ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {incident.images.length > 3 && (
            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              +{incident.images.length - 3}
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
