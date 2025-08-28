'use client';
import React from "react";
import { motion } from "framer-motion";

const ContactHero = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Get in Touch
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and
            we&apos;ll respond as soon as possible.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHero;
