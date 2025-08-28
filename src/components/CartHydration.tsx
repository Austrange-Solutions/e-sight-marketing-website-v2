'use client';

import { ReactNode } from 'react';

interface CartHydrationProps {
  children: ReactNode;
}

export default function CartHydration({ children }: CartHydrationProps) {
  // This component just manages cart hydration
  // The actual hydration logic is already handled in CartContext
  
  return <>{children}</>;
}
