import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../components/map/MapView';
import { ReportCard } from '../components/reports/ReportCard';
import { useReports } from '../hooks/useReports';
import { useLocation } from '../context/LocationContext';
import { Report, ReportCategory, CATEGORIES } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const filters = useMemo(() => ({
    category: selectedCategory,
    lat: location?.latitude,
    lng: location?.longitude,
    radius: 5000 // 5km radius
  }), [selectedCategory, location]);

  const { reports, isLoading } = useReports(filters);

  const handleMarkerClick = (report: Report) => {
    navigate(`/report/${report.id}`);
  };

  const handleReportClick = (report: Report) => {
    navigate(`/report/${report.id}`);
  };

  return (
    <div className="flex flex-col h-full pb-20">
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

        {/* Category filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </header>

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

      {/* Stats bar */}
      <div className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-700">
        {reports.length} reports in your area
      </div>
    </div>
  );
}
