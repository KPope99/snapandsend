import { useState, useEffect } from 'react';
import { AIAnalysis } from '../../types/incident';
import { analyzeIncident, getIncidentAnalysis } from '../../services/incidentApi';

interface AIAnalysisPanelProps {
  incidentId: string;
  hasImages: boolean;
}

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export function AIAnalysisPanel({ incidentId, hasImages }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let triggered = false;
    setAnalysis(null);
    setError(null);
    setIsChecking(true);

    async function checkAndAnalyze() {
      try {
        const result = await getIncidentAnalysis(incidentId);
        if (!cancelled && result) { setAnalysis(result.analysis); setIsChecking(false); return; }
      } catch { /* No cached analysis */ }

      if (cancelled) return;
      setIsChecking(false);

      if (hasImages && !triggered) {
        triggered = true;
        setIsLoading(true);
        try {
          const result = await analyzeIncident(incidentId);
          if (!cancelled) setAnalysis(result.analysis);
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Auto-analysis failed');
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }
    }

    checkAndAnalyze();
    return () => { cancelled = true; };
  }, [incidentId, hasImages]);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeIncident(incidentId);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Assessment</h2>
        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-medium text-indigo-900">
            {isChecking ? 'Checking for AI analysis...' : 'AI is analyzing the incident...'}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Assessment</h2>
        {!hasImages ? (
          <p className="text-sm text-gray-500">No images available for AI analysis.</p>
        ) : error ? (
          <div>
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button onClick={handleRetry} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Retry Analysis
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Analysis unavailable.</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Assessment</h2>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${severityColors[analysis.severity]}`}>
          {analysis.severity.toUpperCase()}
        </span>
      </div>
      <div className="bg-indigo-50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-indigo-800 mb-1">Detailed Description</h3>
        <p className="text-sm text-indigo-900">{analysis.summary}</p>
      </div>
      {(analysis.assessmentDetails ?? []).length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Assessment Details</h3>
          <ul className="space-y-1">
            {(analysis.assessmentDetails ?? []).map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-indigo-500 mt-0.5">&#8226;</span>{detail}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(analysis.suggestedActions ?? []).length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution Recommendations</h3>
          <ol className="space-y-1 list-decimal list-inside">
            {(analysis.suggestedActions ?? []).map((action, idx) => (
              <li key={idx} className="text-sm text-gray-600">{action}</li>
            ))}
          </ol>
        </div>
      )}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Estimated Scope</h3>
        <p className="text-sm text-gray-600">{analysis.estimatedScope}</p>
      </div>
      <p className="text-xs text-gray-400">Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}</p>
    </div>
  );
}
