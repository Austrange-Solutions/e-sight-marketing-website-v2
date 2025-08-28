'use client';
import React from "react";
import { motion } from "framer-motion";

const VideoSection = () => {
  return (
    <section className="py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See More Info on Youtube
          </h2>
          <p className="text-xl text-gray-600">
            Watch our informational video to learn more about e-Sight
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl shadow-xl mx-auto"
          style={{
            paddingTop: "56.25%" /* 16:9 aspect ratio */,
            maxWidth: "80%",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/uCmFiOVW0A8"
            title="e-Sight Informational Video"
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
