import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Incident } from '../../types/incident';

interface NotificationBannerProps {
  incident: Incident | null;
  onDismiss: () => void;
}

export function NotificationBanner({ incident, onDismiss }: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (incident) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [incident, onDismiss]);

  if (!incident) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
        <div className="bg-red-500 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-white font-medium">New Incident Reported</span>
          </div>
          <button onClick={() => { setIsVisible(false); setTimeout(onDismiss, 300); }} className="text-white hover:text-red-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-1">{incident.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{incident.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{incident.location.address}</span>
            <Link
              to={`/admin/incident/${incident.id}`}
              onClick={() => { setIsVisible(false); setTimeout(onDismiss, 300); }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
