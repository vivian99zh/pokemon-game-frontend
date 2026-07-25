import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  useEffect(() => {
    if (!isAuthenticated) {
      setUserId(null);
      localStorage.removeItem('userId');
    }
  }, [isAuthenticated]);

  const login = (newToken: string, newUserId: string) => {
    localStorage.setItem('token', newToken);
    setIsAuthenticated(true);
    if (newUserId) {
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    } else {
      // If no userId provided, generate one from token or use default
      const generatedId = `user_${newToken.slice(-10)}`;
      localStorage.setItem('userId', generatedId);
      setUserId(generatedId);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserId(null);
  };

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
