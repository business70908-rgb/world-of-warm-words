import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (phoneNumber: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phoneNumber: string, pin: string): Promise<{ success: boolean; message?: string }> => {
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

    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
