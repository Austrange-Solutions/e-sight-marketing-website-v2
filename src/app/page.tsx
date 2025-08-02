'use client';
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Navigation2, Battery, Wifi } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


const Home = () => {
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
    <div className="pt-16">
      {/* Hero Section */}
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

      {/* Features Section */}
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

      {/* YouTube Video Section */}
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

      {/* Pricing Section */}
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
                className={`rounded-2xl p-8 ${index === 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-gray-200"
                  }`}
              >
                <h3
                  className={`text-2xl font-bold mb-2 ${index === 1 ? "text-white" : "text-gray-900"
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
                        className={`w-5 h-5 mr-2 ${index === 1 ? "text-white" : "text-indigo-600"
                          }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${index === 1
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
    </div>
  );
};

export default Home;
