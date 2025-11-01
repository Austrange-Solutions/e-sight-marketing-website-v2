import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy - E-Kaathi",
  description: "Refund and cancellation policy for E-Kaathi orders.",
};

export default function RefundPolicy() {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Refund & Cancellation Policy</h1>

        <section className="mb-4">
          <h2 className="text-xl font-semibold">Cancellation</h2>
          <p className="text-muted-foreground">Orders can be cancelled within 24 hours of placing the order provided the order has not been shipped. To cancel, please contact our support team at <a href="mailto:austrange.india@gmail.com" className="text-primary">austrange.india@gmail.com</a>.</p>
        </section>

        <section className="mb-4">
          <h2 className="text-xl font-semibold">Refund Eligibility</h2>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Refunds are provided for defective or damaged items.</li>
            <li>Refunds for other reasons are considered on a case-by-case basis.</li>
            <li>Refunds will not be provided if the item is missing original packaging or has been used beyond reasonable inspection.</li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="text-xl font-semibold">Refund Process & Timeline</h2>
          <p className="text-muted-foreground">Once a refund is approved, we will process it within 5–7 working days. The amount will be refunded to the original payment method. The time for funds to reflect depends on your payment provider.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">For any refund or cancellation queries, email <a href="mailto:austrange.india@gmail.com" className="text-primary">austrange.india@gmail.com</a> with your order ID and details.</p>
        </section>
      </div>
    </div>
  );
}
