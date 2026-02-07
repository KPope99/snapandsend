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

// Base categories that are always available
export type BaseCategory =
  | 'pothole'
  | 'garbage'
  | 'vandalism'
  | 'drainage'
  | 'signage'
  | 'robbery'
  | 'other';

// ReportCategory can be a base category or any AI-detected category
export type ReportCategory = BaseCategory | string;

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

export interface CategoryInfo {
  value: ReportCategory;
  label: string;
  icon: string;
  isCustom?: boolean;
}

export const BASE_CATEGORIES: CategoryInfo[] = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'vandalism', label: 'Vandalism', icon: '🎨' },
  { value: 'drainage', label: 'Drainage', icon: '🌊' },
  { value: 'signage', label: 'Signage', icon: '🚧' },
  { value: 'robbery', label: 'Robbery', icon: '🚨' },
  { value: 'other', label: 'Other', icon: '📌' }
];

// For backwards compatibility
export const CATEGORIES = BASE_CATEGORIES;

// Storage key for custom categories
const CUSTOM_CATEGORIES_KEY = 'snapandsend_custom_categories';

// Get custom categories from localStorage
export function getCustomCategories(): CategoryInfo[] {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save a new custom category
export function addCustomCategory(category: CategoryInfo): void {
  const custom = getCustomCategories();
  // Check if already exists
  if (!custom.find(c => c.value === category.value) &&
      !BASE_CATEGORIES.find(c => c.value === category.value)) {
    custom.push({ ...category, isCustom: true });
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(custom));
  }
}

// Get all categories (base + custom)
export function getAllCategories(): CategoryInfo[] {
  return [...BASE_CATEGORIES, ...getCustomCategories()];
}

// Check if a category exists
export function categoryExists(value: string): boolean {
  return getAllCategories().some(c => c.value === value);
}

// Generate icon for AI-detected category
export function generateCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    fire: '🔥',
    flood: '🌊',
    accident: '🚗',
    crime: '🚨',
    pollution: '☁️',
    noise: '🔊',
    parking: '🅿️',
    construction: '🏗️',
    power: '⚡',
    water: '💧',
    traffic: '🚦',
    animal: '🐕',
    tree: '🌳',
    graffiti: '🎨',
    broken: '💔',
    dangerous: '⚠️',
    abandoned: '🏚️',
    illegal: '🚫',
  };

  // Check if any keyword matches
  const lowerCategory = category.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerCategory.includes(key)) {
      return icon;
    }
  }

  return '🔍'; // Default icon for new categories
}

export const STATUSES: { value: ReportStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'verified', label: 'Verified', color: 'emerald' },
  { value: 'resolved', label: 'Resolved', color: 'blue' }
];
