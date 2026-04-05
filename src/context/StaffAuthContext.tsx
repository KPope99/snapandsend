import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Staff {
  id: string;
  name: string;
  email: string;
  category: string;
  categoryLabel: string;
  isAdmin: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  category: string;
  isAdmin: boolean;
  createdAt: string;
}

interface StaffAuthContextType {
  staff: Staff | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createStaff: (name: string, email: string, password: string, category: string) => Promise<{ success: boolean; error?: string }>;
  listStaff: () => Promise<StaffMember[]>;
  deleteStaff: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const STAFF_CATEGORIES = [
  { value: 'road_damage', label: 'Road & Infrastructure' },
  { value: 'traffic_light', label: 'Traffic Systems' },
  { value: 'flooding', label: 'Drainage & Flooding' },
  { value: 'illegal_dumping', label: 'Waste Management' },
  { value: 'vandalism', label: 'Vandalism & Property' },
  { value: 'robbery', label: 'Crime & Security' },
  { value: 'assault', label: 'Public Safety' },
  { value: 'streetlight', label: 'Street Lighting' },
  { value: 'signage', label: 'Signage & Markings' },
  { value: 'all', label: 'All Categories (Admin)' },
];

function getCategoryLabel(category: string): string {
  return STAFF_CATEGORIES.find(c => c.value === category)?.label || category;
}

function getToken(): string | null {
  return localStorage.getItem('staff_jwt');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setChecked(true); return; }

    fetch('/api/staff/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setStaff({ ...data, categoryLabel: getCategoryLabel(data.category) });
        } else {
          localStorage.removeItem('staff_jwt');
        }
      })
      .catch(() => localStorage.removeItem('staff_jwt'))
      .finally(() => setChecked(true));
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };

      localStorage.setItem('staff_jwt', data.token);
      setStaff({ ...data.staff, categoryLabel: getCategoryLabel(data.staff.category) });
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('staff_jwt');
  };

  const createStaff = async (name: string, email: string, password: string, category: string) => {
    try {
      const res = await fetch('/api/staff/members', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, email, password, category }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to create staff' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const listStaff = async (): Promise<StaffMember[]> => {
    const res = await fetch('/api/staff/members', { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  };

  const deleteStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/members/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to delete' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  if (!checked) return null;

  return (
    <StaffAuthContext.Provider value={{
      staff,
      isAuthenticated: !!staff,
      isAdmin: !!staff?.isAdmin,
      login,
      logout,
      createStaff,
      listStaff,
      deleteStaff,
    }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  return context;
}
