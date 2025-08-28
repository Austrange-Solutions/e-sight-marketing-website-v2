"use client";
import React, { useState } from "react";

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open: () => void;
      };
    };
  }
}

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
  notes: {
    address: string;
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

interface PaymentResponse {
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    created_at: number;
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
  onSuccess: (paymentResponse: RazorpayResponse & PaymentResponse) => void;
  onFailure: (err: Error) => void;
};

const RazorpayButton: React.FC<Props> = ({
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

  const handlePayment = async () => {
    // Prevent payment if disabled or already loading
    if (disabled || loading) return;
    
    setLoading(true);
    onStart?.(); // Notify parent that payment processing started
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create order
      const orderResponse = await fetch("/api/razorpay/order", {
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

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "E-Sight",
        description: product.name,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
              // Create order in database after successful payment
              if (checkoutId) {
                const orderCreateResponse = await fetch("/api/orders/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    checkoutId,
                    paymentInfo: {
                      method: 'razorpay',
                      status: 'paid',
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpaySignature: response.razorpay_signature,
                    },
                    customerInfo: userDetails,
                  }),
                });

                const orderData = await orderCreateResponse.json();
                
                if (!orderCreateResponse.ok) {
                  console.error("Order creation failed:", orderData.error);
                  // Still consider payment successful even if order creation fails
                }
              }

              onSuccess({
                ...response,
                payment: verifyData.payment,
              });
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            onFailure(error instanceof Error ? error : new Error("Payment verification failed"));
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        notes: {
          address: "E-Sight Office",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure(new Error("Payment cancelled by user"));
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
      
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

export default RazorpayButton;