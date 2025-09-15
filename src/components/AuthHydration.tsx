'use client';


import { ReactNode } from 'react';


interface AuthHydrationProps {
  children: ReactNode;
}

// This component is now a passthrough since session hydration is handled by NextAuth's SessionProvider
export default function AuthHydration({ children }: AuthHydrationProps) {
  return <>{children}</>;
}
