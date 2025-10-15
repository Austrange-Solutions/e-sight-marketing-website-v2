import React from "react";
import { Metadata } from "next";
import PrivacyHero from "@/components/PrivacyPage/PrivacyHero";
import PrivacyContent from "@/components/PrivacyPage/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy - E-Kaathi | Maceazy",
  description: "Learn how E-Kaathi protects your privacy and data. Your safety and privacy are our top priorities.",
  keywords: "privacy policy, data protection, e-kaathi, smart blind stick, data security",
};

const PrivacyPolicy = () => {
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    description: "Privacy policy for E-Kaathi smart blind stick application",
    publisher: {
      "@type": "Organization",
      name: "Maceazy",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }} />
      <div className="pt-16">
        <PrivacyHero />
        <PrivacyContent />
      </div>
    </>
  );
};

export default PrivacyPolicy;