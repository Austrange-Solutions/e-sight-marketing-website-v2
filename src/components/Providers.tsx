'use client';

import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
  initialCart?: CartItem[];
}

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export default function Providers({ children, initialCart }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider initialCart={initialCart}>
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </SessionProvider>
  );
}

