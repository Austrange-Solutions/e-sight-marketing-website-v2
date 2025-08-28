'use client';
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PricingCards = () => {
  const pricingPlans = [
    {
      name: "Basic",
      price: "999",
      features: [
        "Basic obstacle detection",
        "Affordable Pricing",
        "24-hour battery life",
        "Durable",
        "Lightweight",
        "18-months warranty",
      ],
    },
    {
      name: "Pro",
      price: "2499",
      features: [
        "Obstacle detection",
        "35+ hour battery life",
        "e-Sight App Connectivity",
        "App based navigation",
        "App based Emergency Alert System",
        "18-months warranty",
        "24/7 support",
      ],
    },
    {
      name: "Max",
      price: "3499",
      features: [
        "Obstacle detection",
        "35+ hour battery life",
        "Built-in Connectivity with Caretaker app",
        "Built-in GPS navigation",
        "Built-in Emergency Alert System",
        "18-months warranty",
        "24/7 support",
      ],
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Device
          </h2>
          <p className="text-xl text-gray-600">
            Select the perfect package for your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 ${
                index === 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-2 ${
                  index === 1 ? "text-white" : "text-gray-900"
                }`}
              >
                {plan.name}
              </h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="ml-2 opacity-75">/device</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <ArrowRight
                      className={`w-5 h-5 mr-2 ${
                        index === 1 ? "text-white" : "text-indigo-600"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
                  index === 1
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;
