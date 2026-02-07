import { Report, ReportFilters, CreateReportData, User, ReportCategory } from '../types';

export interface ImageAnalysisResult {
  category: ReportCategory;
  confidence: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  details: string[];
}

const API_BASE = '/api';

// Session management
let sessionId: string | null = null;

export async function getSession(): Promise<string> {
  if (sessionId) return sessionId;

  const stored = localStorage.getItem('snapandsend_session');
  if (stored) {
    sessionId = stored;
    return sessionId;
  }

  const response = await fetch(`${API_BASE}/auth/session`);
  const data = await response.json();
  sessionId = data.sessionId;
  localStorage.setItem('snapandsend_session', sessionId!);
  return sessionId!;
}

// Auth
export async function register(email: string, password: string, displayName?: string) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
}

// Reports
export async function getReports(filters?: ReportFilters): Promise<Report[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.lat) params.append('lat', filters.lat.toString());
    if (filters.lng) params.append('lng', filters.lng.toString());
    if (filters.radius) params.append('radius', filters.radius.toString());
  }

  const response = await fetch(`${API_BASE}/reports?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }

  return response.json();
}

export async function getReport(id: string): Promise<Report> {
  const response = await fetch(`${API_BASE}/reports/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }

  return response.json();
}

export async function createReport(data: CreateReportData): Promise<Report> {
  const response = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create report');
  }

  return response.json();
}

export async function deleteReport(id: string, userId?: string, sessionId?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/reports/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete report');
  }
}

// Agreements
export async function agreeWithReport(
  reportId: string,
  latitude: number,
  longitude: number,
  userId?: string,
  sessionIdOverride?: string
) {
  const sid = sessionIdOverride || await getSession();

  const response = await fetch(`${API_BASE}/reports/${reportId}/agree`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId: sid, latitude, longitude })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to agree with report');
  }

  return response.json();
}

export async function removeAgreement(reportId: string, userId?: string, sessionIdOverride?: string): Promise<void> {
  const sid = sessionIdOverride || await getSession();

  const response = await fetch(`${API_BASE}/reports/${reportId}/agree`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId: sid })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove agreement');
  }
}

// Images
export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload images');
  }

  const data = await response.json();
  return data.imageUrls;
}

// Analyze images with AI
export async function analyzeImages(files: File[]): Promise<{ analysis: ImageAnalysisResult; imageUrls: string[] }> {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await fetch(`${API_BASE}/images/analyze`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze images');
  }

  return response.json();
}

// Location
export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string }> {
  const response = await fetch(`${API_BASE}/location/reverse?lat=${lat}&lng=${lng}`);

  if (!response.ok) {
    throw new Error('Failed to get address');
  }

  return response.json();
}
