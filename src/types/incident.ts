export type IncidentStatus = 'pending' | 'investigating' | 'resolved';

export type IncidentCategory =
  | 'road_damage'
  | 'traffic_light'
  | 'flooding'
  | 'illegal_dumping'
  | 'vandalism'
  | 'robbery'
  | 'assault'
  | 'other';

export interface IncidentImage {
  id: string;
  url: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IncidentStatus;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  images: IncidentImage[];
  createdAt: string;
  updatedAt: string;
  investigatingAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  resolutionEvidence?: string;
  verificationCount?: number;
  locationVerification?: 'yes' | 'no' | 'uncertain' | null;
  locationVerificationReason?: string | null;
}

export interface IncidentStats {
  total: number;
  last24Hours?: number;
  byStatus: {
    pending?: number;
    investigating?: number;
    resolved?: number;
  };
  byCategory: Record<string, number>;
}

export interface AIAnalysis {
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  assessmentDetails: string[];
  suggestedActions: string[];
  estimatedScope: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  analyzedAt: string;
}
