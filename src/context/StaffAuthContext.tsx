import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Staff {
  id: string;
  name: string;
  email: string;
  category: string;
  categoryLabel: string;
}

const ADMIN_EMAIL = 'olu.oshaa@gmail.com';

interface StaffAuthContextType {
  staff: Staff | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, category: string) => Promise<boolean>;
  logout: () => void;
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

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('incident_response_staff');
    if (stored) {
      try { setStaff(JSON.parse(stored)); }
      catch { localStorage.removeItem('incident_response_staff'); }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('incident_response_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const staffData: Staff = {
        id: user.id, name: user.name, email: user.email, category: user.category,
        categoryLabel: STAFF_CATEGORIES.find(c => c.value === user.category)?.label || user.category,
      };
      setStaff(staffData);
      localStorage.setItem('incident_response_staff', JSON.stringify(staffData));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, category: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('incident_response_users') || '[]');
    if (users.some((u: any) => u.email === email)) return false;

    const newUser = { id: `staff_${Date.now()}`, name, email, password, category, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('incident_response_users', JSON.stringify(users));

    const staffData: Staff = {
      id: newUser.id, name: newUser.name, email: newUser.email, category: newUser.category,
      categoryLabel: STAFF_CATEGORIES.find(c => c.value === category)?.label || category,
    };
    setStaff(staffData);
    localStorage.setItem('incident_response_staff', JSON.stringify(staffData));
    return true;
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('incident_response_staff');
  };

  return (
    <StaffAuthContext.Provider value={{ staff, isAuthenticated: !!staff, isAdmin: staff?.email === ADMIN_EMAIL, login, register, logout }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  return context;
}
