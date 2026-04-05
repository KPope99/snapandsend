import { useState, useRef } from 'react';
import { Incident, IncidentStatus } from '../../types/incident';
import { updateIncidentStatus, uploadEvidence, deleteIncident } from '../../services/incidentApi';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { LocationMap } from './LocationMap';
import { useStaffAuth } from '../../context/StaffAuthContext';

interface IncidentDetailProps {
  incident: Incident;
  onStatusChange: (updated: Incident) => void;
  onDelete?: () => void;
}

const statusColors: Record<IncidentStatus, string> = {
  pending: 'bg-red-100 text-red-800 border-red-200',
  investigating: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels: Record<IncidentStatus, string> = {
  pending: 'Pending',
  investigating: 'Investigating',
  resolved: 'Resolved',
};

const categoryLabels: Record<string, string> = {
  road_damage: 'Road Damage',
  traffic_light: 'Traffic Light',
  flooding: 'Flooding',
  illegal_dumping: 'Illegal Dumping',
  vandalism: 'Vandalism',
  other: 'Other',
};

export function IncidentDetail({ incident, onStatusChange, onDelete }: IncidentDetailProps) {
  const { isAdmin } = useStaffAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [remediationNotes, setRemediationNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceError, setEvidenceError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (newStatus === incident.status) return;

    // If resolving, show the remediation modal instead
    if (newStatus === 'resolved') {
      setShowResolveModal(true);
      setRemediationNotes('');
      setNotesError('');
      setEvidenceFile(null);
      setEvidencePreview(null);
      setEvidenceError('');
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateIncidentStatus(incident.id, newStatus);
      onStatusChange(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      setEvidenceError('');
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setEvidencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEvidence = () => {
    setEvidenceFile(null);
    setEvidencePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResolveSubmit = async () => {
    let hasError = false;

    // Validate remediation notes
    if (!remediationNotes.trim()) {
      setNotesError('Please enter a description of the remediation action taken.');
      hasError = true;
    } else if (remediationNotes.trim().length < 20) {
      setNotesError('Please provide more detail (at least 20 characters).');
      hasError = true;
    } else {
      setNotesError('');
    }

    // Validate evidence
    if (!evidenceFile) {
      setEvidenceError('Please upload evidence of the completed remediation.');
      hasError = true;
    } else {
      setEvidenceError('');
    }

    if (hasError) return;

    setIsUpdating(true);
    try {
      // Upload evidence first
      const evidenceUrl = await uploadEvidence(evidenceFile!);

      // Then update status with notes and evidence URL
      const updated = await updateIncidentStatus(
        incident.id,
        'resolved',
        remediationNotes.trim(),
        evidenceUrl
      );
      onStatusChange(updated);
      setShowResolveModal(false);
      setRemediationNotes('');
      setEvidenceFile(null);
      setEvidencePreview(null);
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      alert('Failed to resolve incident. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteIncident(incident.id);
      setShowDeleteConfirm(false);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete incident:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statuses: IncidentStatus[] = ['pending', 'investigating', 'resolved'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{incident.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                {categoryLabels[incident.category] || incident.category}
              </span>
              <span>Reported: {formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 text-sm font-medium rounded-full border ${statusColors[incident.status]}`}
            >
              {statusLabels[incident.status]}
            </span>
            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete incident"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Update Status:</span>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating || status === incident.status}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  status === incident.status
                    ? 'bg-gray-800 text-white cursor-default'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {statusLabels[status]}
            </button>
          ))}
          {isUpdating && (
            <span className="text-sm text-gray-500 ml-2">Updating...</span>
          )}
        </div>
      </div>

      {/* Description & Photos */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column — Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
          </div>

          {/* Right Column — Photos */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 self-start">
              Photos{incident.images.length > 0 && ` (${incident.images.length})`}
            </h2>
            {incident.images.length > 0 ? (
              <div className="w-full flex justify-center">
                <div className={`grid gap-3 ${incident.images.length === 1 ? 'grid-cols-1 max-w-[280px]' : 'grid-cols-2'}`}>
                  {incident.images.map((img, idx) => {
                    const imageUrl = img.url.startsWith('/') ? `${img.url}` : img.url;
                    return (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(imageUrl)}
                        className="aspect-square rounded-lg bg-gray-100 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        <img
                          src={imageUrl}
                          alt={`Incident photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No photos attached</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <AIAnalysisPanel incidentId={incident.id} hasImages={incident.images.length > 0} />

      {/* Incident Location */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Incident Location
        </h2>
        <p className="text-gray-700 font-medium mb-1">{incident.location.address}</p>
        <p className="text-sm text-gray-500 mb-3">
          {incident.location.latitude.toFixed(6)}, {incident.location.longitude.toFixed(6)}
        </p>
        <LocationMap
          latitude={incident.location.latitude}
          longitude={incident.location.longitude}
          address={incident.location.address}
        />
        <a
          href={`https://www.google.com/maps?q=${incident.location.latitude},${incident.location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline mt-3 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Google Maps
        </a>
      </div>

      {/* Timeline */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {/* Reported */}
            <div className="flex items-start gap-4">
              <div className="relative z-10 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Incident Reported</p>
                <p className="text-sm text-gray-500">
                  {new Date(incident.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Investigating */}
            <div className="flex items-start gap-4">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                incident.investigatingAt ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${incident.investigatingAt ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${incident.investigatingAt ? 'text-gray-900' : 'text-gray-400'}`}>
                  Investigation Started
                </p>
                {incident.investigatingAt ? (
                  <p className="text-sm text-gray-500">
                    {new Date(incident.investigatingAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Pending</p>
                )}
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-start gap-4">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                incident.resolvedAt ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${incident.resolvedAt ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${incident.resolvedAt ? 'text-gray-900' : 'text-gray-400'}`}>
                  Resolved
                </p>
                {incident.resolvedAt ? (
                  <>
                    <p className="text-sm text-gray-500">
                      {new Date(incident.resolvedAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {(incident.resolutionNotes || incident.resolutionEvidence) && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100">
                        {incident.resolutionNotes && (
                          <>
                            <p className="text-xs font-medium text-green-800 mb-1">Resolution Notes:</p>
                            <p className="text-sm text-green-700 mb-2">{incident.resolutionNotes}</p>
                          </>
                        )}
                        {incident.resolutionEvidence && (
                          <>
                            <p className="text-xs font-medium text-green-800 mb-1">Evidence:</p>
                            <button
                              onClick={() => {
                                const imgUrl = incident.resolutionEvidence!.startsWith('/')
                                  ? `${incident.resolutionEvidence}`
                                  : incident.resolutionEvidence!;
                                setSelectedImage(imgUrl);
                              }}
                              className="block w-full"
                            >
                              <img
                                src={incident.resolutionEvidence.startsWith('/')
                                  ? `${incident.resolutionEvidence}`
                                  : incident.resolutionEvidence}
                                alt="Resolution evidence"
                                className="w-full h-32 object-cover rounded border border-green-200 hover:opacity-90 transition-opacity"
                              />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">Pending</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Incident photo full size"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Incident</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to permanently delete <span className="font-medium">"{incident.title}"</span>? All associated images, verifications, and history will be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Incident'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal - Requires Remediation Description */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resolve Incident</h3>
                <p className="text-sm text-gray-500">Describe the remediation action taken</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remediation Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={remediationNotes}
                onChange={(e) => {
                  setRemediationNotes(e.target.value);
                  if (notesError) setNotesError('');
                }}
                placeholder="Describe what actions were taken to resolve this incident (e.g., pothole filled, debris removed, repairs completed)..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  notesError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {notesError && (
                <p className="mt-1 text-sm text-red-500">{notesError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {remediationNotes.length}/20 minimum characters
              </p>
            </div>

            {/* Evidence Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Photo <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEvidenceChange}
                className="hidden"
              />
              {evidencePreview ? (
                <div className="relative">
                  <img
                    src={evidencePreview}
                    alt="Evidence preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeEvidence}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                    evidenceError
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <svg className={`w-8 h-8 ${evidenceError ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm ${evidenceError ? 'text-red-500' : 'text-gray-500'}`}>
                    Click to upload evidence photo
                  </span>
                </button>
              )}
              {evidenceError && (
                <p className="mt-1 text-sm text-red-500">{evidenceError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Upload a photo showing the completed remediation work
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setRemediationNotes('');
                  setNotesError('');
                  setEvidenceFile(null);
                  setEvidencePreview(null);
                  setEvidenceError('');
                }}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={isUpdating || !remediationNotes.trim() || !evidenceFile}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resolving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as Resolved
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
