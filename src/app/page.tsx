import React from "react";
import { Metadata } from "next";
import HomeHero from "@/components/HomePage/HomeHero";
import FeatureCards from "@/components/HomePage/FeatureCards";
import VideoSection from "@/components/HomePage/VideoSection";
import HomeProductsSection from "@/components/HomePage/HomeProductsSection";
import Faqs from "@/components/HomePage/Faqs";
import IncubationCarousel from "@/components/HomePage/Incubation";
import ImageGallery from "@/components/HomePage/ImageGallery";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Maceazy - Making Life easier, For Specially Abled | Smart Blind Stick Technology",
  description: "Experience independence with Maceazy's revolutionary smart blind stick,'E-Kaathi' combining AI technology with intuitive navigation. Advanced obstacle detection, GPS integration, and long battery life.",
  keywords: "smart blind stick, AI navigation, obstacle detection, assistive technology, Maceazy, independence, GPS integration, blind assistance",
  openGraph: {
    title: "Maceazy - Making Life easier, For Specially Abled",
    description: "Revolutionary smart blind stick with AI technology for enhanced mobility and independence.",
    type: "website",
    images: [
      {
        url: "/assets/images/maceazy-logo-white.jpg",
        width: 1200,
        height: 630,
        alt: "Person using E-Kaathi smart blind stick",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maceazy - Making Life easier, For Specially Abled",
    description: "Revolutionary smart blind stick with AI technology for enhanced mobility and independence.",
    images: ["/assets/images/maceazy-logo-white.jpg"],
  },
};

const Home = () => {
 
  return (
    <div className="pt-16">
      {/* Hero Section - Client Component with animations */}
      <HomeHero />

      {/* Image Gallery - Pinterest-style masonry grid */}
      <ImageGallery />

      {/* Incubation Carousel */}
      <IncubationCarousel />

      {/* Products Section - Dynamic products from database */}
      <HomeProductsSection />

      {/* YouTube Video Section - Client Component with animations */}
      <VideoSection />

      {/* Features Section - Client Component with animations */}
      <FeatureCards />

      {/* FAQs Section */}
      <Faqs />
    </div>
  );
};

export default Home;
