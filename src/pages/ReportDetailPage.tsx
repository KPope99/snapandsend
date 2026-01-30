import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReport } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { AgreementButton } from '../components/reports/AgreementButton';
import { ShareButtons } from '../components/reports/ShareButtons';
import { ProximityIndicator } from '../components/reports/ProximityIndicator';
import { MapView } from '../components/map/MapView';
import { CATEGORIES, STATUSES } from '../types';
import { formatRelativeTime } from '../utils/distance';
import { deleteReport } from '../services/api';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, sessionId } = useAuth();
  const { report, isLoading, error, refetch } = useReport(id!);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const category = useMemo(() =>
    CATEGORIES.find(c => c.value === report?.category),
    [report?.category]
  );

  const status = useMemo(() =>
    STATUSES.find(s => s.value === report?.status),
    [report?.status]
  );

  const isOwner = useMemo(() => {
    if (!report) return false;
    return (user && report.userId === user.id) ||
           (sessionId && report.sessionId === sessionId);
  }, [report, user, sessionId]);

  const hasAgreed = useMemo(() => {
    if (!report?.agreements) return false;
    return report.agreements.some(
      a => (user && a.userId === user.id) || (sessionId && a.sessionId === sessionId)
    );
  }, [report?.agreements, user, sessionId]);

  const handleDelete = async () => {
    if (!report) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteReport(report.id, user?.id, sessionId || undefined);
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">{error || 'Report not found'}</p>
          <Button onClick={() => navigate('/')} variant="secondary" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusVariant = report.status === 'verified'
    ? 'success'
    : report.status === 'resolved'
    ? 'info'
    : 'warning';

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Report Details</h1>
        <div className="w-6" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Image gallery */}
        {report.images.length > 0 && (
          <div className="relative">
            <img
              src={report.images[selectedImageIndex].imageUrl}
              alt={report.title}
              className="w-full h-64 object-cover"
            />

            {report.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {report.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title and status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {category?.icon} {category?.label}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(report.createdAt)}
                </span>
              </div>
            </div>
            <Badge variant={statusVariant}>{status?.label}</Badge>
          </div>

          {/* Description */}
          <p className="text-gray-700">{report.description}</p>

          {/* Location */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Location</h3>
                <ProximityIndicator
                  latitude={report.latitude}
                  longitude={report.longitude}
                />
              </div>

              {report.address && (
                <p className="text-sm text-gray-600">{report.address}</p>
              )}

              <div className="h-40 rounded-lg overflow-hidden">
                <MapView
                  reports={[report]}
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verifications */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Verifications</h3>
                <span className="text-emerald-600 font-medium">
                  {report.agreementCount} neighbours
                </span>
              </div>

              {!isOwner && (
                <AgreementButton
                  report={report}
                  hasAgreed={hasAgreed}
                  onUpdate={refetch}
                />
              )}

              {isOwner && (
                <p className="text-sm text-gray-500 text-center">
                  This is your report
                </p>
              )}
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardContent>
              <h3 className="font-medium text-gray-900 mb-3">Share</h3>
              <ShareButtons report={report} />
            </CardContent>
          </Card>

          {/* Delete button for owner */}
          {isOwner && (
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="w-full"
            >
              Delete Report
            </Button>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Report"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this report? This action cannot be undone.
          </p>

          {deleteError && (
            <p className="text-sm text-red-500">{deleteError}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
