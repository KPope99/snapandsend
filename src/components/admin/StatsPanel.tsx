import { IncidentStats } from '../../types/incident';

interface StatsPanelProps {
  stats: IncidentStats | null;
  isLoading?: boolean;
}

const categoryLabels: Record<string, string> = {
  road_damage: 'Road Damage',
  traffic_light: 'Traffic Light',
  flooding: 'Flooding',
  illegal_dumping: 'Illegal Dumping',
  vandalism: 'Vandalism',
  other: 'Other',
};

export function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Statistics</h2>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
          <p className="text-3xl font-bold text-red-600">{stats.byStatus.pending || 0}</p>
          <p className="text-sm text-red-700 mt-1">Pending</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-100">
          <p className="text-3xl font-bold text-amber-600">{stats.byStatus.investigating || 0}</p>
          <p className="text-sm text-amber-700 mt-1">Investigating</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
          <p className="text-3xl font-bold text-green-600">{stats.byStatus.resolved || 0}</p>
          <p className="text-sm text-green-700 mt-1">Resolved</p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Incidents</span>
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">By Category</h3>
        <div className="space-y-2">
          {Object.entries(stats.byCategory)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {categoryLabels[category] || category}
                </span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          {Object.values(stats.byCategory).every((count) => count === 0) && (
            <p className="text-sm text-gray-500">No incidents reported yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
