"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { load as loadCashfree } from "@cashfreepayments/cashfree-js";

interface DonateButtonProps {
  amount: number;
  sticksEquivalent: number;
  donorDetails: {
    name: string;
    email: string;
    phone: string;
    message?: string;
    isAnonymous: boolean;
    address?: string;
    city?: string;
    state?: string;
    pan?: string;
  };
  disabled?: boolean;
  onError?: (error: string) => void;
  selectedFoundation?: string;
}

export default function CashfreeDonateButton({
  amount,
  sticksEquivalent,
  donorDetails,
  disabled = false,
  onError,
  selectedFoundation,
}: DonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDonation = async () => {
    if (disabled || loading || amount < 1 || !selectedFoundation) {
      return;
    }

    setLoading(true);

    try {
      // Create donation order
      const createResponse = await fetch("/api/donate/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorDetails.name,
          email: donorDetails.email,
          phone: donorDetails.phone,
          amount: amount,
          message: donorDetails.message || "",
          isAnonymous: donorDetails.isAnonymous,
          foundation: selectedFoundation,
          address: donorDetails.address || "",
          city: donorDetails.city || "",
          state: donorDetails.state || "",
          pan: donorDetails.pan || "",
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.message || "Failed to create donation order");
      }

      // Load Cashfree SDK
      const cashfree = await loadCashfree({ 
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox"
      });
      
      if (!cashfree) {
        throw new Error("Failed to load Cashfree SDK");
      }

      // Configure Cashfree checkout
      const checkoutOptions = {
        paymentSessionId: createData.paymentSessionId,
        returnUrl: `${window.location.origin}/donate/success?order_id=${createData.orderId}`,
      };

      console.log("🚀 Opening Cashfree checkout with options:", checkoutOptions);

      // Open Cashfree checkout
      const result = await cashfree.checkout(checkoutOptions);
      
      console.log("✅ Cashfree checkout result:", result);
      
      // After checkout closes (whether success or cancel), redirect to success page
      // The success page will verify the payment
      window.location.href = `/donate/success?order_id=${createData.orderId}`;
      
    } catch (error: any) {
      console.error("Payment Error:", error);
      const errorMessage = error?.message || "Payment failed. Please try again.";
      if (onError) {
        onError(errorMessage);
      }
      alert(`Payment Error\n${errorMessage}`);
      setLoading(false);
    }
  };

  if (!selectedFoundation) {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">Please select a foundation above to continue</p>
        </div>
      </div>
    );
  }

  const isDisabled = loading || disabled || amount < 1;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleDonation}
        disabled={isDisabled}
        className={`w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
          isDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Heart className="w-5 h-5" />
        {loading
          ? "Processing..."
          : `Donate ₹${amount.toLocaleString("en-IN")}`}
      </button>

      {disabled && amount >= 1 && (
        <p className="text-center text-sm text-amber-600 mt-2">
          Please fill all required fields and accept the Terms & Refund Policy to continue
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground mt-4">
        Your donation is secure and will be processed through Cashfree
      </p>
    </div>
  );
}
