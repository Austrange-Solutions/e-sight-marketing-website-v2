"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface DonateButtonProps {
  amount: number;
  sticksEquivalent: number;
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
  sticksEquivalent,
  donorDetails,
  className = "",
  disabled = false,
  onError,
}: DonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleDonation = async () => {
    if (disabled || loading || amount < 1) {
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway. Please check your internet connection.");
      }

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

      if (!createResponse.ok) {
        throw new Error(createData.message || "Failed to create donation order");
      }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: createData.key,
        amount: createData.amount,
        currency: createData.currency,
        name: "MACEAZY - E-Kaathi Pro Donation",
        description: `Donate ${sticksEquivalent.toFixed(1)} E-Kaathi Pro to blind people`,
        order_id: createData.orderId,
        notes: {
          donorName: donorDetails.name,
          sticksEquivalent: sticksEquivalent.toFixed(2),
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/donate/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                donationId: createData.donationId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              // Redirect to success page
              router.push(
                `/donate/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`
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
        },
        prefill: {
          name: donorDetails.name,
          email: donorDetails.email,
          contact: donorDetails.phone,
        },
        theme: {
          color: "#1B9BD8", // MACEAZY primary color
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onError?.("Payment cancelled. Your donation was not processed.");
          },
        },
      };

      // Open Razorpay checkout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
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
