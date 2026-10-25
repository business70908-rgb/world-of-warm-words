import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { serverKeyStorage } from '@/lib/serverKeyStorage';

// The stored key must be matched against the database at least once a day
const DAY_MS = 24 * 60 * 60 * 1000;
// How often we wake up to check whether the daily revalidation is due
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (phoneNumber: string, pin: string) => Promise<AuthResult>;
  validateServerKey: (key: string, persist?: boolean) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const authStateRef = useRef<boolean>(false);

  useEffect(() => {
    authStateRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const validateServerKey = useCallback(async (key: string, persist = true): Promise<AuthResult> => {
    const apply = (matched: boolean | null): AuthResult => {
      if (!mountedRef.current) return { success: false };

      if (matched === true) {
        if (persist) serverKeyStorage.save(key);
        serverKeyStorage.touchValidatedAt();
        setIsAuthenticated(true);
        return { success: true };
      }

      if (matched === false) {
        // Key changed on the server (or wrong key): revoke access
        const wasAuthed = authStateRef.current;
        serverKeyStorage.clear();
        setIsAuthenticated(false);
        if (wasAuthed) {
          toast.error('Server key has changed. Please log in again.');
        }
        return { success: false, message: 'Invalid server key. Contact admin to get the current key.' };
      }

      // Network / server error: never log the user out for a
      // transient failure, they can retry.
      return { success: false, message: 'Could not reach the server. Please try again.' };
    };

    try {
      const { data, error } = await supabase.rpc('validate_server_key', { entered_key: key });
      if (error) return apply(null);
      return apply(data === true);
    } catch {
      return apply(null);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Remove the legacy client-only bypass flag from older versions
    try {
      localStorage.removeItem('isAuthenticated');
    } catch {
      // no-op
    }

    const revalidateIfDue = async () => {
      const stored = serverKeyStorage.get();
      if (!stored) return;

      const lastValidated = serverKeyStorage.getLastValidated();
      if (Date.now() - lastValidated < DAY_MS) {
        // Validated within the last 24h: allow the app to start,
        // the daily check below will re-verify when due.
        if (mountedRef.current) setIsAuthenticated(true);
        return;
      }

      // Stale (>24h): must match the database before entering the app
      await validateServerKey(stored, false);
    };

    revalidateIfDue();

    const interval = setInterval(() => {
      const stored = serverKeyStorage.get();
      if (!stored) return;
      if (Date.now() - serverKeyStorage.getLastValidated() >= DAY_MS) {
        validateServerKey(stored, false);
      }
    }, RECHECK_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [validateServerKey]);

  const login = async (phoneNumber: string, pin: string): Promise<AuthResult> => {
    if (phoneNumber.length !== 10 || pin.length !== 4) {
      return { success: false, message: 'Invalid phone number or PIN' };
    }

    const now = new Date();
    let hours = now.getHours();
    hours = hours % 12 || 12;
    const minutes = now.getMinutes();
    const expectedPin = String(hours).padStart(2, '0') + String(minutes).padStart(2, '0');

    if (pin !== expectedPin) {
      return { success: false, message: 'Wrong password. Contact admin to get password.' };
    }

    // Not authenticated yet: the server-key validation step decides that
    return { success: true };
  };

  const logout = () => {
    serverKeyStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, validateServerKey, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
