"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();

  // Redirect to store subdomain checkout
  useEffect(() => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const mainHostname = window.location.hostname.replace(/^www\./, '');
    
    // Check if already on store subdomain
    if (window.location.hostname.startsWith('store.')) {
      return; // Already on store subdomain, do nothing
    }
    
    // Redirect to store subdomain
    window.location.href = `${protocol}//store.${mainHostname}${port}/store/checkout`;
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Redirecting to store checkout...</p>
      </div>
    </div>
  );
};

export default CheckoutPage;

