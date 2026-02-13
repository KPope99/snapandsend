import { Report, CATEGORIES, STATUSES } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatRelativeTime, formatDistance, getDistance } from '../../utils/distance';
import { useLocation } from '../../context/LocationContext';

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const { location } = useLocation();
  const category = CATEGORIES.find(c => c.value === report.category);
  const status = STATUSES.find(s => s.value === report.status);

  const distance = location
    ? getDistance(location.latitude, location.longitude, report.latitude, report.longitude)
    : null;

  const statusVariant = report.status === 'verified'
    ? 'success'
    : report.status === 'resolved'
    ? 'info'
    : 'warning';

  return (
    <Card onClick={onClick} className="hover:shadow-md transition-shadow">
      <div>
        {/* Content */}
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
            <Badge variant={statusVariant}>{status?.label}</Badge>
          </div>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              {category?.icon} {category?.label}
            </span>
            {distance !== null && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {formatDistance(distance)}
              </span>
            )}
            <span>{formatRelativeTime(report.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-emerald-600 font-medium">
              {report.agreementCount || report._count?.agreements || 0} verifications
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
