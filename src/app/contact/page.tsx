import React from "react";
import { Metadata } from "next";
import ContactHero from "@/components/ContactHero";
import ContactInfo from "@/components/ContactInfo";
import ContactForm from "@/components/ContactForm";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Contact Us - E-Kaathi",
  description: "Get in touch with E-Kaathi. Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  keywords: "contact, e-Kaathi, support, inquiry, business partnership",
  openGraph: {
    title: "Contact Us - E-Kaathi",
    description: "Get in touch with E-Kaathi. Have questions? We'd love to hear from you.",
    type: "website",
  },
};

const Contact = () => {
  return (
    <div className="pt-16">
      {/* Contact Hero - Client Component with animations */}
      <ContactHero />

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information - Client Component with animations */}
            <ContactInfo />

            {/* Contact Form - Client Component with form state */}
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
