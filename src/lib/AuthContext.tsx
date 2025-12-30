import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from './api';
import { storage } from './storage';

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        // Verify token and get user data
        const response = await apiRequest<{ user: User }>('/auth/me');
        setUser(response.user);
        await storage.setItem('user', JSON.stringify(response.user));
      } else {
        // Try loading cached user
        const userData = await storage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // Token might be expired, clear it
      await clearAuthToken();
      await storage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      await setAuthToken(response.token);
      await storage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });

      await setAuthToken(response.token);
      await storage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await clearAuthToken();
    await storage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await apiRequest<{ user: User }>('/auth/me');
      setUser(response.user);
      await storage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser }}>
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
