'use client';
import React from "react";
import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary to-secondary text-white" aria-labelledby="about-hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 id="about-hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
            About E-Kaathi
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Empowering independence through innovative assistive technology for the visually impaired.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
