"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<string>("");

  useEffect(() => {
    const payment = searchParams.get("payment");
    setPaymentType(payment || "");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          {paymentType === "completed" && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Your payment has been processed successfully.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  💳 Payment Status: <span className="font-semibold">Completed</span>
                </p>
              </div>
            </div>
          )}

          {paymentType === "cod" && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Your order has been placed successfully.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  💰 Payment Method: <span className="font-semibold">Cash on Delivery</span>
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              You will receive an email confirmation shortly with your order details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              View Order History
            </button>
            
            <button
              onClick={() => router.push("/products")}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
            >
              Continue Shopping
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition duration-200"
            >
              Back to Home
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? 
              <a href="/contact" className="text-blue-600 hover:text-blue-500 ml-1">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}