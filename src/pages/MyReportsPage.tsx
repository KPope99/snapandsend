import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportCard } from '../components/reports/ReportCard';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import { Report, ReportStatus, STATUSES } from '../types';

export function MyReportsPage() {
  const navigate = useNavigate();
  const { user, sessionId } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');

  const { reports, isLoading } = useReports();

  // Filter to only show user's reports
  const myReports = useMemo(() => {
    return reports.filter(report => {
      const isOwner = (user && report.userId === user.id) ||
                      (sessionId && report.sessionId === sessionId);

      if (!isOwner) return false;

      if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [reports, user, sessionId, selectedStatus]);

  const handleReportClick = (report: Report) => {
    navigate(`/report/${report.id}`);
  };

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">My Reports</h1>

        {/* Status filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === status.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          </div>
        ) : myReports.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-500">No reports yet</p>
            <p className="text-sm text-gray-400">Start reporting issues in your community!</p>
            <button
              onClick={() => navigate('/report')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Create Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => handleReportClick(report)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Stats */}
      {myReports.length > 0 && (
        <div className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-700">
          {myReports.length} report{myReports.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
