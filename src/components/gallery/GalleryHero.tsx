"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GalleryHero() {
  return (
    <section 
          className="py-24 bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.35_0.08_230)] text-white" aria-labelledby="about-hero-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 id="about-hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
                Gallery & Events
              </h1>
              <p className="text-xl max-w-3xl mx-auto">
                Explore the vibrant moments captured at Maceazy&apos;s events, showcasing our commitment to empowering the specially-abled community through innovation and inclusivity.
              </p>
            </motion.div>
          </div>
        </section>
  );
}
