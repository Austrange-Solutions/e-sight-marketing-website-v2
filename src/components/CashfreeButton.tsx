"use client";
import React, { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import type { CheckoutOptions } from "@cashfreepayments/cashfree-js";

interface PaymentResponse {
  payment: {
    orderId: string;
    paymentId: string;
    paymentAmount: number;
    paymentCurrency: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentTime: string;
  };
}

type Props = {
  product: { name: string; price: number };
  userDetails: { name: string; email: string; phone: string };
  checkoutId?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onStart?: () => void;
  onSuccess: (paymentResponse: PaymentResponse) => void;
  onFailure: (err: Error) => void;
};

const CashfreeButton: React.FC<Props> = ({
  product,
  userDetails,
  checkoutId,
  buttonText = "Pay Now",
  className = "",
  disabled = false,
  onStart,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // Prevent payment if disabled or already loading
    if (disabled || loading) return;
    
    setLoading(true);
    onStart?.(); // Notify parent that payment processing started
    
    try {
      // Create order
      const orderResponse = await fetch("/api/cashfree/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: product.price,
          currency: "INR",
          userDetails,
        }),
      });

      const orderData = await orderResponse.json();
      
      console.log("📦 [CASHFREE BUTTON] Order response:", orderData);
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      if (!orderData.paymentSessionId) {
        console.error("❌ [CASHFREE BUTTON] No payment session ID in response:", orderData);
        throw new Error("Payment session ID not received from server");
      }

      console.log("✅ [CASHFREE BUTTON] Payment session ID received:", orderData.paymentSessionId.substring(0, 20) + "...");

      // Initialize Cashfree
      const mode = process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
        ? "production" 
        : "sandbox";
      
      console.log("🔧 [CASHFREE BUTTON] Loading Cashfree SDK in mode:", mode);
      console.log("🔧 [CASHFREE BUTTON] Endpoint:", process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT);
      
      const cashfree = await load({ mode });

      // Configure checkout options - prefer modal to avoid full page redirect
      const checkoutOptions: CheckoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_modal",
      };

      // Open Cashfree checkout and wait for result
      const result = await cashfree.checkout(checkoutOptions);

      if (result.error) {
        throw new Error(result.error.message || "Payment failed");
      }

  const verifiedOrderId = result.paymentDetails?.orderId || orderData.order_id;

      if (!verifiedOrderId) {
        throw new Error("Could not determine Cashfree order ID after payment");
      }

      try {
        // Verify payment
        const verifyResponse = await fetch("/api/cashfree/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: verifiedOrderId,
          }),
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyResponse.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Payment verification failed");
        }
        // Prefer the passed checkoutId, else fallback to sessionStorage
        const effectiveCheckoutId = checkoutId || (typeof window !== 'undefined' ? sessionStorage.getItem('checkoutId') || '' : '');
        console.log("checkoutId (effective):", effectiveCheckoutId);
        // Create order in database after successful payment
        if (effectiveCheckoutId) {
          const orderCreateResponse = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkoutId: effectiveCheckoutId,
              paymentInfo: {
                method: 'cashfree',
                status: 'paid',
                cashfreeOrderId: verifyData.payment.orderId,
                cashfreePaymentId: verifyData.payment.paymentId,
              },
              customerInfo: userDetails,
            }),
            credentials: 'include',
          });

          if (!orderCreateResponse.ok) {
            const orderCreateData = await orderCreateResponse.json();
            console.error("Order creation failed:", orderCreateData.error);
            // Continue even if order persistence fails so user is not blocked
          }
        } else {
          // No checkoutId found - server will try to fallback to latest pending checkout for this user
          const orderCreateResponse = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentInfo: {
                method: 'cashfree',
                status: 'paid',
                cashfreeOrderId: verifyData.payment.orderId,
                cashfreePaymentId: verifyData.payment.paymentId,
              },
              customerInfo: userDetails,
            }),
            credentials: 'include',
          });

          if (!orderCreateResponse.ok) {
            const orderCreateData = await orderCreateResponse.json();
            console.error("Order creation (no checkoutId) failed:", orderCreateData.error);
          }
        }

        onSuccess({ payment: verifyData.payment });
      } catch (error) {
        console.error("Payment verification error:", error);
        onFailure(error instanceof Error ? error : new Error("Payment verification failed"));
      }
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      onFailure(error instanceof Error ? error : new Error("Payment initiation failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`${className} ${(loading || disabled) ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Processing..." : buttonText}
    </button>
  );
};

export default CashfreeButton;
