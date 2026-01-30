export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Image {
  id: string;
  reportId: string;
  imageUrl: string;
  createdAt: string;
}

export interface Agreement {
  id: string;
  reportId: string;
  userId?: string;
  user?: User;
  sessionId?: string;
  latitude: number;
  longitude: number;
  distance: number;
  createdAt: string;
}

export interface Report {
  id: string;
  userId?: string;
  user?: User;
  sessionId?: string;
  title: string;
  description: string;
  category: ReportCategory;
  images: Image[];
  latitude: number;
  longitude: number;
  address?: string;
  status: ReportStatus;
  agreements?: Agreement[];
  agreementCount: number;
  _count?: {
    agreements: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ReportCategory =
  | 'pothole'
  | 'garbage'
  | 'vandalism'
  | 'streetlight'
  | 'drainage'
  | 'signage'
  | 'robbery'
  | 'other';

export type ReportStatus = 'pending' | 'verified' | 'resolved';

export interface ReportFilters {
  category?: ReportCategory | 'all';
  status?: ReportStatus | 'all';
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface CreateReportData {
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrls: string[];
  userId?: string;
  sessionId?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export const CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'vandalism', label: 'Vandalism', icon: '🎨' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'drainage', label: 'Drainage', icon: '🌊' },
  { value: 'signage', label: 'Signage', icon: '🚧' },
  { value: 'robbery', label: 'Robbery', icon: '🚨' },
  { value: 'other', label: 'Other', icon: '📌' }
];

export const STATUSES: { value: ReportStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'verified', label: 'Verified', color: 'emerald' },
  { value: 'resolved', label: 'Resolved', color: 'blue' }
];
