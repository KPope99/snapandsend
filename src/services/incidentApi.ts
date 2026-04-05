import { Incident, IncidentStats, IncidentStatus, AIAnalysis } from '../types/incident';

const API_BASE_URL = '/api/external';
const API_KEY = 'sns_8c82fbaa0e2782ce79034b83b16bf5c4e7a32900113e7b1c6760b2627911951b';

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getIncidents(params?: {
  status?: IncidentStatus;
  category?: string;
}): Promise<Incident[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.category) searchParams.append('category', params.category);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/incidents${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Failed to fetch incidents: ${response.statusText}`);
  const result: ApiResponse<Incident[]> = await response.json();
  return result.data;
}

export async function getIncident(id: string): Promise<Incident> {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch incident: ${response.statusText}`);
  const result: ApiResponse<Incident> = await response.json();
  return result.data;
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
  notes?: string,
  evidenceUrl?: string
): Promise<Incident> {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, notes, evidenceUrl }),
  });
  if (!response.ok) throw new Error(`Failed to update incident status: ${response.statusText}`);
  return getIncident(id);
}

export async function uploadEvidence(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('images', file);

  const response = await fetch('/api/images/upload', { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Failed to upload evidence image');

  const data = await response.json();
  return data.imageUrls[0];
}

export async function getStats(): Promise<IncidentStats> {
  const response = await fetch(`${API_BASE_URL}/stats`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch stats: ${response.statusText}`);
  const result: ApiResponse<IncidentStats> = await response.json();
  return result.data;
}

export async function deleteIncident(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, { method: 'DELETE', headers });
  if (!response.ok) {
    const text = await response.text();
    let msg = 'Failed to delete incident';
    try { msg = JSON.parse(text)?.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
}

export async function analyzeIncident(id: string): Promise<{ analysis: AIAnalysis; cached: boolean }> {
  const response = await fetch(`/api/analysis/incidents/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    let errorMsg = 'Failed to analyze incident';
    try { errorMsg = JSON.parse(text)?.error || errorMsg; } catch { /* ignore */ }
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function getIncidentAnalysis(id: string): Promise<{ analysis: AIAnalysis; cached: boolean } | null> {
  const response = await fetch(`/api/analysis/incidents/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch analysis');
  return response.json();
}
