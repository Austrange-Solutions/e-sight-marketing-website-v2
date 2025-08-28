'use client';
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const HomeHero = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white min-h-[90vh] flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1 pb-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Empowering Vision Through Innovation
            </h1>
            <p className="text-xl mb-8">
              Experience independence with e-Sight&apos;s revolutionary smart blind
              stick, combining AI technology with intuitive navigation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-white text-indigo-600 px-8 py-3 rounded-full font-medium hover:bg-indigo-50 transition-colors duration-200"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="order-1 md:order-2 relative flex justify-center max-md:pt-4"
          >
            <img
              src="/assets/images/blind-person.png"
              alt="Person using e-Sight smart blind stick"
              className="rounded-lg max-md:w-[100px]"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HomeHero;
