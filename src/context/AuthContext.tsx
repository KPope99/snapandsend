import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, getSession, login as apiLogin, register as apiRegister } from '../services/api';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
const LAST_ACTIVITY_KEY = 'snapandsend_last_activity';

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  resetActivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSessionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleSessionTimeout = useCallback(() => {
    console.log('Session timed out due to inactivity');
    setUser(null);
    setToken(null);
    localStorage.removeItem('snapandsend_token');
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    clearSessionTimeout();
  }, [clearSessionTimeout]);

  const resetActivityTimer = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    clearSessionTimeout();
    timeoutRef.current = setTimeout(handleSessionTimeout, SESSION_TIMEOUT_MS);
  }, [clearSessionTimeout, handleSessionTimeout]);

  // Set up activity listeners when user is logged in
  useEffect(() => {
    if (!user) {
      clearSessionTimeout();
      return;
    }

    // Check if session has already expired (e.g., after page refresh)
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed >= SESSION_TIMEOUT_MS) {
        handleSessionTimeout();
        return;
      }
    }

    // Start the timer
    resetActivityTimer();

    // Add activity listeners
    const handleActivity = () => resetActivityTimer();
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearSessionTimeout();
    };
  }, [user, resetActivityTimer, clearSessionTimeout, handleSessionTimeout]);

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
        // Check if session has expired before restoring
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivity) {
          const elapsed = Date.now() - parseInt(lastActivity, 10);
          if (elapsed >= SESSION_TIMEOUT_MS) {
            // Session expired, clear storage
            localStorage.removeItem('snapandsend_token');
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            return;
          }
        }

        const userData = await getCurrentUser(storedToken);
        setUser(userData);
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Auth init error:', error);
      localStorage.removeItem('snapandsend_token');
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { user: userData, token: newToken } = await apiLogin(email, password);
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('snapandsend_token', newToken);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  async function register(email: string, password: string, displayName?: string) {
    const { user: userData, token: newToken } = await apiRegister(email, password, displayName);
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('snapandsend_token', newToken);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('snapandsend_token');
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    clearSessionTimeout();
  }

  return (
    <AuthContext.Provider value={{ user, sessionId, token, isLoading, login, register, logout, resetActivityTimer }}>
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
