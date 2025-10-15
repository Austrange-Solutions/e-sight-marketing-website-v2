'use client';
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Navigation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HomeHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.35_0.08_230)] text-white min-h-[92vh] flex items-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-white/30 transition-colors">
                ✨ Revolutionary Assistive Technology
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Making Life easier,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                For the Disabled
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl mb-8 text-white/90 max-w-2xl mx-auto lg:mx-0"
            >
              Experience independence with <span className="font-semibold">MACEAZY</span>&apos;s revolutionary smart blind stick, combining AI technology with intuitive navigation.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Navigation className="w-5 h-5" />
                <span className="text-sm font-medium">GPS Navigation</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Safe & Reliable</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a
                href={process.env.NODE_ENV === 'development' ? 'http://donate.localhost:3000' : 'https://donate.' + process.env.NEXT_PUBLIC_HOSTNAME}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
                >
                  Donate Now ❤️
                </Button>
              </a>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300"
                >
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* Decorative circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-white/5 rounded-full animate-pulse" />
              <div className="absolute w-80 h-80 bg-white/10 rounded-full animate-pulse delay-500" />
              <div className="absolute w-64 h-64 bg-white/15 rounded-full animate-pulse delay-1000" />
            </div>

            {/* 3D-style illustration or icon */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
                <svg
                  className="w-64 h-64 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Accessibility icon with modern styling */}
                  <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path
                    d="M12 10C9.79086 10 8 11.7909 8 14V17C8 18.1046 8.89543 19 10 19C11.1046 19 12 18.1046 12 17V14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 14C12 11.7909 13.7909 10 16 10C16.5523 10 17 10.4477 17 11V17C17 18.1046 16.1046 19 15 19C13.8954 19 13 18.1046 13 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 13L4 20M18 13L20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/20 pt-12"
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-white/70 text-sm">Users Worldwide</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">99%</div>
            <div className="text-white/70 text-sm">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-white/70 text-sm">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">5+</div>
            <div className="text-white/70 text-sm">Years Innovation</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </section>
  );
};

export default HomeHero;
