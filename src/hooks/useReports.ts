import { useState, useEffect, useCallback } from 'react';
import { Report, ReportFilters } from '../types';
import { getReports, getReport } from '../services/api';

interface UseReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReports(filters?: ReportFilters): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReports(filters);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, isLoading, error, refetch: fetchReports };
}

interface UseReportReturn {
  report: Report | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReport(id: string): UseReportReturn {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReport(id);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, isLoading, error, refetch: fetchReport };
}
