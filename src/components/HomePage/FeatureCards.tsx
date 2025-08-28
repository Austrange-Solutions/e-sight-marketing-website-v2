'use client';
import React from "react";
import { motion } from "framer-motion";
import { Eye, Navigation2, Battery, Wifi } from "lucide-react";

const FeatureCards = () => {
  const features = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Object Detection",
      description:
        "Advanced AI-powered detection system for identifying obstacles",
    },
    {
      icon: <Navigation2 className="w-8 h-8" />,
      title: "GPS Navigation",
      description: "Turn-by-turn navigation with voice guidance",
    },
    {
      icon: <Battery className="w-8 h-8" />,
      title: "Long Battery Life",
      description: "Up to 30+ hours of continuous usage",
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Smart Connectivity",
      description: "Seamless smartphone integration via Bluetooth",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Features for Enhanced Mobility
          </h2>
          <p className="text-xl text-gray-600">
            Advanced technology designed for independence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-indigo-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
