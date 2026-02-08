import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { MapView } from '../components/map/MapView';
import { ReportCard } from '../components/reports/ReportCard';
import { useReports } from '../hooks/useReports';
import { useLocation } from '../context/LocationContext';
import { Report } from '../types';

interface NotificationState {
  notification?: {
    type: 'success' | 'info' | 'error';
    message: string;
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { location } = useLocation();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  // Handle notification from navigation state
  useEffect(() => {
    const state = routerLocation.state as NotificationState | null;
    if (state?.notification) {
      setNotification(state.notification);
      // Clear the state so notification doesn't reappear on refresh
      window.history.replaceState({}, document.title);
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [routerLocation.state]);

  const filters = useMemo(() => ({
    lat: location?.latitude,
    lng: location?.longitude,
    radius: 5000 // 5km radius
  }), [location]);

  const { reports, isLoading } = useReports(filters);

  const handleMarkerClick = (report: Report) => {
    navigate(`/report/${report.id}`);
  };

  const handleReportClick = (report: Report) => {
    navigate(`/report/${report.id}`);
  };

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-down ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200'
              : notification.type === 'info'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex-shrink-0">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : notification.type === 'info' ? (
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <p className={`text-sm flex-1 ${
            notification.type === 'success'
              ? 'text-emerald-700'
              : notification.type === 'info'
              ? 'text-blue-700'
              : 'text-red-700'
          }`}>
            {notification.message}
          </p>
          <button
            onClick={() => setNotification(null)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">SnapAndSend</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Prominent Create Incident Button */}
        <button
          onClick={() => navigate('/report')}
          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-[0.98]"
        >
          Report New Incident
        </button>
      </header>

      {/* How It Works - 3 Step Process */}
      <div className="bg-gray-50 px-4 py-4">
        <h2 className="text-gray-900 text-center text-lg font-bold mb-4">
          How Snap Send Solve Works
        </h2>
        <div className="flex gap-2">
          {/* Step 1: Snap - Clickable to Report Page */}
          <button
            onClick={() => navigate('/report')}
            className="flex-1 flex flex-col group"
          >
            <div className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-br from-sky-400 to-sky-600 shadow-md group-hover:shadow-lg group-hover:scale-[1.02] transition-all">
              {/* Background illustration */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                  <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Hand with phone icon */}
              <div className="absolute bottom-2 left-2">
                <div className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {/* Tap indicator */}
              <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5">
                <span className="text-[10px] font-medium text-sky-700">Tap to start</span>
              </div>
            </div>
            <p className="text-gray-900 text-center text-sm font-semibold mt-2">Snap</p>
          </button>

          {/* Step 2: Send */}
          <div className="flex-1 flex flex-col">
            <div className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md">
              {/* Background illustration */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Pointing hand icon */}
              <div className="absolute bottom-2 left-2">
                <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-gray-900 text-center text-sm font-semibold mt-2">Send</p>
          </div>

          {/* Step 3: Solve */}
          <div className="flex-1 flex flex-col">
            <div className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
              {/* Background illustration */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Thumbs up icon */}
              <div className="absolute bottom-2 left-2">
                <div className="w-10 h-10 bg-amber-300 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-gray-900 text-center text-sm font-semibold mt-2">Solve</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-2 text-gray-500">Loading reports...</p>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-full">
            <MapView
              reports={reports}
              onMarkerClick={handleMarkerClick}
              userLocation={location}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-gray-500">No reports found nearby</p>
                <p className="text-sm text-gray-400">Be the first to report an issue!</p>
              </div>
            ) : (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => handleReportClick(report)}
                />
              ))
            )}
          </div>
        )}
      </main>

    </div>
  );
}
