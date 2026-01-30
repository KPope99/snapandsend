import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, getSession, login as apiLogin, register as apiRegister } from '../services/api';

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      // Get anonymous session
      const sid = await getSession();
      setSessionId(sid);

      // Check for existing token
      const storedToken = localStorage.getItem('snapandsend_token');
      if (storedToken) {
        const userData = await getCurrentUser(storedToken);
        setUser(userData);
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Auth init error:', error);
      localStorage.removeItem('snapandsend_token');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { user: userData, token: newToken } = await apiLogin(email, password);
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('snapandsend_token', newToken);
  }

  async function register(email: string, password: string, displayName?: string) {
    const { user: userData, token: newToken } = await apiRegister(email, password, displayName);
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('snapandsend_token', newToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('snapandsend_token');
  }

  return (
    <AuthContext.Provider value={{ user, sessionId, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
