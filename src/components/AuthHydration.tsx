'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthHydrationProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function AuthHydration({ children, isAuthenticated }: AuthHydrationProps) {
  const { refreshUser, user } = useAuth();

  useEffect(() => {
    // If server says user is authenticated but client doesn't know yet, refresh
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser, user]);

  return <>{children}</>;
}
