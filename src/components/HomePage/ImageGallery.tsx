"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Gallery images data
const galleryImages = [
  {
    id: 1,
    src: "/assets/images/blindpersons/IMG_001.jpg",
    alt: "Person using smart blind stick",
  },
  {
    id: 2,
    src: "/assets/images/blindpersons/IMG_002.jpg",
    alt: "Smart blind stick in action",
  },
  {
    id: 3,
    src: "/assets/images/blindpersons/IMG_003.jpg",
    alt: "Independence with assistive technology",
  },
  // {
  //   id: 5,
  //   src: "/assets/images/blindpersons/IMG_005.jpg",
  //   alt: "Technology for accessibility",
  // },
  {
    id: 6,
    src: "/assets/images/blindpersons/IMG_006.jpg",
    alt: "Smart navigation assistance",
  },
  {
    id: 7,
    src: "/assets/images/blindpersons/IMG_007.jpg",
    alt: "Empowering independence",
  },
];

const ImageGallery = () => {
  // Duplicate images for seamless infinite scroll
  const duplicatedImages = [...galleryImages, ...galleryImages];

  return (
    <section className="py-16 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Impact in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how our technology is empowering individuals and creating
            independence through innovative assistive solutions
          </p> */}
        </motion.div>
      </div>

      {/* Horizontal Scrolling Gallery */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Container */}
        <motion.div
          className="flex gap-6 group"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          whileHover={{
            animationPlayState: "paused",
          }}
          style={{
            width: "fit-content",
          }}
        >
          {duplicatedImages.map((image, index) => (
            <motion.div
              key={`${image.id}-${index}`}
              className="relative flex-shrink-0 w-85 h-120 rounded-xl overflow-hidden shadow-lg"
              whileHover={{
                scale: 1.05,
                zIndex: 20,
                transition: { duration: 0.3 },
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="320px"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ImageGallery;
