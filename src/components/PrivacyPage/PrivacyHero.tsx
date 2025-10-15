'use client';
import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyHero() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white" aria-labelledby="privacy-hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-6" aria-hidden="true">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 id="privacy-hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-6">
            Your privacy and safety are our top priorities. Learn how we protect your data.
          </p>
          <div className="text-sm opacity-90">
            <p><strong>Effective Date:</strong> January 2025</p>
            <p><strong>Last Updated:</strong> January 2025</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
