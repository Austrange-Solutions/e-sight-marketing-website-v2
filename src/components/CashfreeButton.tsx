"use client";
import React, { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

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
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Initialize Cashfree
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
          ? "production" 
          : "sandbox",
      });

      // Configure checkout options
      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        returnUrl: `${window.location.origin}/success`,
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

        // Create order in database after successful payment
        if (checkoutId) {
          const orderCreateResponse = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkoutId,
              paymentInfo: {
                method: 'cashfree',
                status: 'paid',
                cashfreeOrderId: verifyData.payment.orderId,
                cashfreePaymentId: verifyData.payment.paymentId,
              },
              customerInfo: userDetails,
            }),
          });

          if (!orderCreateResponse.ok) {
            const orderCreateData = await orderCreateResponse.json();
            console.error("Order creation failed:", orderCreateData.error);
            // Continue even if order persistence fails so user is not blocked
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
