import React from "react";
import { Metadata } from "next";
import HomeHero from "@/components/HomePage/HomeHero";
import FeatureCards from "@/components/HomePage/FeatureCards";
import VideoSection from "@/components/HomePage/VideoSection";
import HomeProductsSection from "@/components/HomePage/HomeProductsSection";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "E-Kaathi - Your Path, Your Freedom | Smart Blind Stick Technology",
  description: "Experience independence with E-Kaathi's revolutionary smart blind stick, combining AI technology with intuitive navigation. Advanced obstacle detection, GPS navigation, and long battery life.",
  keywords: "smart blind stick, AI navigation, obstacle detection, assistive technology, E-Kaathi, independence, GPS navigation, blind assistance",
  openGraph: {
    title: "E-Kaathi - Your Path, Your Freedom",
    description: "Revolutionary smart blind stick with AI technology for enhanced mobility and independence.",
    type: "website",
    images: [
      {
        url: "/assets/images/blind-person.png",
        width: 1200,
        height: 630,
        alt: "Person using E-Kaathi smart blind stick",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Kaathi - Your Path, Your Freedom",
    description: "Revolutionary smart blind stick with AI technology for enhanced mobility and independence.",
    images: ["/assets/images/blind-person.png"],
  },
};

const Home = () => {
  return (
    <div className="pt-16">
      {/* Hero Section - Client Component with animations */}
      <HomeHero />

      {/* Features Section - Client Component with animations */}
      <FeatureCards />

      {/* YouTube Video Section - Client Component with animations */}
      <VideoSection />

      {/* Products Section - Dynamic products from database */}
      <HomeProductsSection />
    </div>  
  );
};

export default Home;
