import React from "react";
import { Metadata } from "next";
import AboutHero from "@/components/AboutPage/AboutHero";
import MissionVision from "@/components/AboutPage/MissionVision";
import TeamSection from "@/components/AboutPage/TeamSection";

export const metadata: Metadata = {
  title: "About Us - Maceazy | E-Kaathi Smart Blind Stick",
  description: "Learn about Maceazy mission to revolutionize mobility for the visually impaired through intelligent, affordable, and user-friendly assistive technology. Meet our innovative team.",
  keywords: "about maceazy, e-kaathi, smart blind stick, visually impaired technology, assistive devices, founders, mission, vision",
};

const About = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maceazy",
    alternateName: "E-Kaathi",
    url: "https://www.maceazy.com",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <div className="pt-16">
        <AboutHero />
        <MissionVision />
        <TeamSection />
      </div>
    </>
  );
};

export default About;
