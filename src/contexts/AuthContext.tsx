'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated and fetch user data
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh user data after successful login
        await checkAuth();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user data even if API call fails
      setUser(null);
      router.push('/login');
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await checkAuth();
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
