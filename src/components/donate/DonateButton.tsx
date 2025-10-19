"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import type { CheckoutOptions } from "@cashfreepayments/cashfree-js";

interface DonateButtonProps {
  amount: number;
  donorDetails: {
    name: string;
    email: string;
    phone: string;
    message?: string;
    isAnonymous: boolean;
    // Optional tax exemption fields
    address?: string;
    city?: string;
    state?: string;
    pan?: string;
  };
  className?: string;
  disabled?: boolean;
  onError?: (error: string) => void;
}

export default function DonateButton({
  amount,
  donorDetails,
  className = "",
  disabled = false,
  onError,
}: DonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDonation = async () => {
    if (disabled || loading || amount < 1) {
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
          // Optional tax exemption fields
          address: donorDetails.address || "",
          city: donorDetails.city || "",
          state: donorDetails.state || "",
          pan: donorDetails.pan || "",
        }),
      });

      const createData = await createResponse.json();

      console.log("📦 [DONATE BUTTON] Order response:", createData);

      if (!createResponse.ok) {
        throw new Error(createData.message || "Failed to create donation order");
      }

      if (!createData.paymentSessionId) {
        console.error("❌ [DONATE BUTTON] No payment session ID in response:", createData);
        throw new Error("Payment session ID not received from server");
      }

      console.log("✅ [DONATE BUTTON] Payment session ID received:", createData.paymentSessionId.substring(0, 20) + "...");

      // Initialize Cashfree
      const mode = process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
        ? "production" 
        : "sandbox";
      
      console.log("🔧 [DONATE BUTTON] Loading Cashfree SDK in mode:", mode);
      console.log("🔧 [DONATE BUTTON] Endpoint:", process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT);
      
      const cashfree = await load({ mode });

      if (!cashfree) {
        throw new Error("Failed to load payment gateway. Please check your internet connection.");
      }

      // Configure checkout options - prefer modal to avoid full page redirect
      const checkoutOptions: CheckoutOptions = {
        paymentSessionId: createData.paymentSessionId,
        redirectTarget: "_modal",
      };

      // Open Cashfree checkout
      const result = await cashfree.checkout(checkoutOptions);

      if (result.error) {
        throw new Error(result.error.message || "Payment failed");
      }

      if (result.paymentDetails) {
        try {
          // Verify payment
          const verifyResponse = await fetch("/api/donate/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: result.paymentDetails.orderId || createData.orderId,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.success) {
            // Redirect to success page; keep loader until navigation
            router.replace(
              `/donate/success?payment_id=${verifyData.donation.paymentId}&order_id=${createData.orderId}`
            );
          } else {
            throw new Error(verifyData.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Payment verification failed";
          onError?.(errorMessage);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Donation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process donation";
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDonation}
      disabled={loading || disabled || amount < 1}
      className={`${className} ${
        loading || disabled || amount < 1 ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Processing..." : `Donate ₹${amount.toLocaleString("en-IN")}`}
    </button>
  );
}
