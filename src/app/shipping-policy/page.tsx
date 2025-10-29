import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy - Maceazy",
  description: "Shipping charges, delivery timelines, serviceable areas and tracking information for Maceazy orders.",
};

export default function ShippingPolicy() {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Shipping & Delivery Policy</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Shipping Charges</h2>
          <p className="text-muted-foreground mb-2">We aim to be transparent about delivery fees. Our current standard charges are:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Flat rate: ₹50 per order (where applicable).</li>
            <li>Free shipping on orders above ₹999.</li>
            <li>Some remote pincodes may incur additional charges; these will be shown during checkout.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Delivery Timelines</h2>
          <p className="text-muted-foreground">Estimated delivery times (business days):</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Metro and major cities: 3–5 business days.</li>
            <li>Other locations: 5–9 business days.</li>
            <li>Remote areas: may take up to 12 business days.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Shipping Coverage</h2>
          <p className="text-muted-foreground">We currently deliver across India. If your pincode is outside our delivery network, you will be notified during checkout and may be offered alternate options.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Order Tracking</h2>
          <p className="text-muted-foreground">Once your order is shipped, you will receive tracking details via email and/or SMS. You can also track orders from your account dashboard.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Contact for Shipping Queries</h2>
          <p className="text-muted-foreground">If you have questions about shipping or delivery, please contact us at <a href="mailto:austrange.india@gmail.com" className="text-primary">austrange.india@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}

