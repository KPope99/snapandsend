import { useState } from 'react';
import { Button } from '../common/Button';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { agreeWithReport, removeAgreement } from '../../services/api';
import { Report } from '../../types';
import { getDistance, formatDistance } from '../../utils/distance';

interface AgreementButtonProps {
  report: Report;
  hasAgreed: boolean;
  onUpdate: () => void;
}

const MAX_AGREEMENT_DISTANCE = 500; // meters

export function AgreementButton({ report, hasAgreed, onUpdate }: AgreementButtonProps) {
  const { location, isLoading: locationLoading, permissionDenied } = useLocation();
  const { user, sessionId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distance = location
    ? getDistance(location.latitude, location.longitude, report.latitude, report.longitude)
    : null;

  const isWithinRange = distance !== null && distance <= MAX_AGREEMENT_DISTANCE;

  const handleAgree = async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      await agreeWithReport(
        report.id,
        location.latitude,
        location.longitude,
        user?.id,
        sessionId || undefined
      );
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await removeAgreement(report.id, user?.id, sessionId || undefined);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove verification');
    } finally {
      setIsLoading(false);
    }
  };

  if (permissionDenied) {
    return (
      <div className="text-center text-sm text-gray-500">
        <p>Enable location to verify this report</p>
      </div>
    );
  }

  if (locationLoading) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Getting your location...
      </Button>
    );
  }

  if (hasAgreed) {
    return (
      <div className="space-y-2">
        <Button
          variant="secondary"
          onClick={handleRemove}
          isLoading={isLoading}
          className="w-full"
        >
          Remove Verification
        </Button>
        <p className="text-xs text-center text-emerald-600">
          You've verified this report
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="primary"
        onClick={handleAgree}
        isLoading={isLoading}
        disabled={!isWithinRange || locationLoading}
        className="w-full"
      >
        {isWithinRange ? 'Verify This Report' : 'Get Closer to Verify'}
      </Button>

      {distance !== null && (
        <p className={`text-xs text-center ${isWithinRange ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isWithinRange
            ? `You're ${formatDistance(distance)} away - within range!`
            : `You're ${formatDistance(distance)} away - must be within 500m`
          }
        </p>
      )}

      {error && <p className="text-xs text-center text-red-500">{error}</p>}
    </div>
  );
}
