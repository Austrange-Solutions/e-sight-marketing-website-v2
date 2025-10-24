"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { load as loadCashfree } from "@cashfreepayments/cashfree-js";

// Cashfree Types
interface CashfreeDropConfig {
  paymentSessionId: string;
  returnUrl?: string;
  notifyUrl?: string;
}

interface CashfreeResponse {
  order: {
    orderId: string;
    orderAmount: string;
  };
  transaction: {
    transactionId: string;
    transactionStatus: string;
  };
  payment?: {
    paymentMethod?: string;
  };
}

interface DonateButtonsProps {
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
  disabled?: boolean;
  onError?: (error: string) => void;
  selectedFoundation?: string; // Foundation ObjectId or code
}

type Foundation = "vsf" | "cf";

const foundationConfig = {
  vsf: {
    name: "VSF",
    fullName: "Vishnu Shakti Foundation",
    color: "#059669",
    bgColor: "bg-emerald-600",
    hoverColor: "hover:bg-emerald-700",
  },
  cf: {
    name: "CF",
    fullName: "Chetana Foundation",
    color: "#7C3AED",
    bgColor: "bg-violet-600",
    hoverColor: "hover:bg-violet-700",
  },
};

export default function MultiFoundationDonateButtons({
  amount,
  sticksEquivalent,
  donorDetails,
  disabled = false,
  onError,
  selectedFoundation,
}: DonateButtonsProps) {
  const [loadingFoundation, setLoadingFoundation] = useState<string | null>(null);
  const router = useRouter();

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      // Check if Razorpay is already available
      if (typeof (window as any).Razorpay !== 'undefined') {
        return resolve(true);
      }

      // Check if script tag exists
      const existingScript = document.getElementById("razorpay-script");
      if (existingScript) {
        // Wait for script to load
        existingScript.addEventListener('load', () => resolve(true));
        return;
      }

      // Create new script tag
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        // Double check Razorpay is available
        if (typeof (window as any).Razorpay !== 'undefined') {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleDonation = async (foundationId: string) => {
    if (disabled || loadingFoundation || amount < 1) {
      return;
    }

    setLoadingFoundation(foundationId);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway. Please check your internet connection.");
      }

      // Create donation order with foundation
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
          foundation: foundationId, // Pass foundation ObjectId or code
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
        name: createData.foundationName || "MACEAZY Foundation",
        description: `Donate ${sticksEquivalent.toFixed(1)} Maceazy Pro to blind people via ${createData.foundationName}`,
        order_id: createData.orderId,
        notes: {
          donorName: donorDetails.name,
          sticksEquivalent: sticksEquivalent.toFixed(2),
          foundation: foundationId,
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
            setLoadingFoundation(null);
          }
        },
        prefill: {
          name: donorDetails.name,
          email: donorDetails.email,
          contact: donorDetails.phone,
        },
        theme: {
          color: "#10b981", // Default green color for Razorpay checkout
        },
        modal: {
          ondismiss: () => {
            setLoadingFoundation(null);
            onError?.("Payment cancelled. Your donation was not processed.");
          },
        },
      };

      // Check if Razorpay is available
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error("Payment gateway failed to load. Please refresh the page and try again.");
      }

      // Open Razorpay checkout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Donation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process donation";
      onError?.(errorMessage);
      setLoadingFoundation(null);
    }
  };

  // If selectedFoundation is provided, show single button
  if (selectedFoundation) {
    const isDisabled = loadingFoundation !== null || disabled || amount < 1;
    
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleDonation(selectedFoundation)}
          disabled={isDisabled}
          className={`w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Heart className="w-5 h-5" />
          {loadingFoundation === selectedFoundation
            ? "Processing..."
            : `Donate ₹${amount.toLocaleString("en-IN")}`}
        </button>

        {disabled && amount >= 1 && (
          <p className="text-center text-sm text-amber-600 mt-2">
            Please fill all required fields and accept the Terms & Refund Policy to continue
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your donation is secure and will be processed through Razorpay
        </p>
      </div>
    );
  }

  // Default: Show message to select a foundation
  return (
    <div className="space-y-4">
      <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">Please select a foundation above to continue</p>
      </div>
    </div>
  );
}

