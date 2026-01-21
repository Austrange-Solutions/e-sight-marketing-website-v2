"use client";

import { motion } from "framer-motion";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function ProductHero({
}: Props) {
   return (
      <section className="bg-linear-to-br from-primary via-primary/90 to-[oklch(0.35_0.08_230)] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Our Products
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-white/90">
              Explore innovative assistive technology designed to empower independence.
            </p>
          </motion.div>
        </div>
      </section>
    );
}
