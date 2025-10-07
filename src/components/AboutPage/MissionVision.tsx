'use client';
import React from "react";
import { motion } from "framer-motion";

export default function MissionVision() {
  return (
    <section className="py-24 bg-background" aria-labelledby="mission-vision-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 id="mission-vision-heading" className="text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              To revolutionize mobility for the visually impaired by developing
              intelligent, affordable, and user-friendly assistive technology that
              enhances independence and quality of life.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
            <p className="text-lg text-muted-foreground">
              To be the global leader in creating transformative technology
              solutions that shape the way of living of blind individuals.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
