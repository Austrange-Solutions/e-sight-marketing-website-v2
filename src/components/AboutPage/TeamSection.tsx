'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// CEO data that will always be displayed first
const ceoData = {
  name: "Samad Qureshi",
  position: "CEO",
  image: "/assets/images/ceo.jpg",
  description:
    "Leading with empathy and purpose to create assistive technologies that improve independence and quality of life for the specially abled.",
};

// Other team members that will be randomly ordered
const otherTeamMembers = [
  {
    name: "Sahil Mane",
    position: "CTO",
    image: "/assets/images/cto.jpg",
    description: "Technical expert specializing in innovative solutions.",
  },
  {
    name: "Harsh Gupta",
    position: "CIO",
    image: "/assets/images/cio.jpg",
    description:
      "Leader in managing and implementing IT strategies, optimizing technology for business growth.",
  },
  {
    name: "Vishnuraj Vishwakarma",
    position: "COO",
    image: "/assets/images/coo.jpg",
    description:
      "Executive overseeing daily operations, optimizing efficiency, and ensuring business execution.",
  },
];

// Define team member interface
interface TeamMember {
  name: string;
  position: string;
  image: string;
  description: string;
}

export default function TeamSection() {
  // State to hold the randomized team members
  const [displayTeam, setDisplayTeam] = useState<TeamMember[]>([]);

  // Randomize team members on component mount
  useEffect(() => {
    // Shuffle the other team members (excluding CEO)
    const shuffled = [...otherTeamMembers].sort(() => Math.random() - 0.5);
    // Place CEO first, then the shuffled team
    setDisplayTeam([ceoData, ...shuffled]);
  }, []);

  if (displayTeam.length === 0) {
    // Return placeholder while loading
    return (
      <section className="py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Founders
            </h2>
            <p className="text-xl text-muted-foreground">
              The brilliant minds behind our success
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden border border-border animate-pulse">
                <div className="aspect-w-1 aspect-h-1 bg-muted h-64"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-accent" aria-labelledby="team-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="team-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our Founders
          </h2>
          <p className="text-xl text-muted-foreground">
            The brilliant minds behind our success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8" role="list">
          {displayTeam.map((member, index) => (
            <motion.article
              key={`${member.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl border border-border hover:border-primary transition-all duration-300"
              role="listitem"
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={member.image}
                  alt={`${member.name}, ${member.position} at Maceazy`}
                  className="w-full md:h-64 h-74 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-4" aria-label="Position">
                  {member.position}
                </p>
                <p className="text-muted-foreground">{member.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
