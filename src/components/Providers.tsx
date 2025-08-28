'use client';

import { ReactNode } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
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

export default function Providers({ children, initialCart = [] }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider initialCart={initialCart}>
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  );
}
