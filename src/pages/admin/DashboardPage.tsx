import { useEffect, useState, useCallback } from 'react';
import { Incident, IncidentStats, IncidentStatus } from '../../types/incident';
import { getIncidents, getStats } from '../../services/incidentApi';
import { IncidentCard } from '../../components/admin/IncidentCard';
import { StatsPanel } from '../../components/admin/StatsPanel';
import { NotificationBanner } from '../../components/admin/NotificationBanner';
import { ManageStaffModal } from '../../components/admin/ManageStaffModal';
import { useStaffAuth } from '../../context/StaffAuthContext';

export function DashboardPage() {
  const { staff, logout, isAdmin } = useStaffAuth();
  const [showManageStaff, setShowManageStaff] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [notification, setNotification] = useState<Incident | null>(null);

  const handleLogout = () => {
    logout();
  };

  const fetchData = useCallback(async () => {
    try {
      const [incidentsData, statsData] = await Promise.all([
        getIncidents(statusFilter ? { status: statusFilter } : undefined),
        getStats(),
      ]);
      setIncidents(incidentsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/sse/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'incident.created') {
          setNotification(data.incident);
          fetchData();
        } else if (data.event === 'incident.updated') {
          fetchData();
        } else if (data.event === 'analysis.completed') {
          // Dispatch custom event for AIAnalysisPanel to pick up
          window.dispatchEvent(new CustomEvent('analysis.completed', {
            detail: { incidentId: data.incidentId, analysis: data.analysis },
          }));
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', e);
      }
    };

    eventSource.onerror = () => {
      console.log('SSE connection error, will retry...');
    };

    return () => {
      eventSource.close();
    };
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incidents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md w-full text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            {error}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchData();
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider metallic-grey">Incident Response</h1>
                <p className="text-sm text-gray-500">Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Staff Info */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{staff?.name}</p>
                  <p className="text-xs text-gray-500">{staff?.categoryLabel}</p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowManageStaff(true)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Manage Staff</span>
                </button>
              )}
              <button
                onClick={fetchData}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Stats */}
          <div className="lg:col-span-1">
            <StatsPanel stats={stats} />
          </div>

          {/* Main - Incident List */}
          <div className="lg:col-span-3">
            {/* Filter Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">All Incidents</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="status-filter" className="text-sm text-gray-600">
                    Filter by status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | '')}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Incident List */}
            {incidents.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                <p className="text-gray-500">
                  {statusFilter
                    ? `No ${statusFilter} incidents at this time.`
                    : 'No incidents have been reported yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showManageStaff && <ManageStaffModal onClose={() => setShowManageStaff(false)} />}

      {/* Notification Banner */}
      <NotificationBanner
        incident={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © Tech84
        </div>
      </footer>
    </div>
  );
}
