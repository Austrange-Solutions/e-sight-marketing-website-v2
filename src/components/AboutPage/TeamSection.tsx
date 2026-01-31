"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

import type { TeamMember } from "@/lib/team";
import { TEAM_MEMBERS } from "@/lib/team";
import { slugify } from "@/lib/team";

export default function TeamSection() {
  const [displayTeam, setDisplayTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Keep CEO first, randomize the rest
    const [ceo, ...others] = TEAM_MEMBERS;
    // const shuffled = [...others].sort(() => Math.random() - 0.5);
    setDisplayTeam([ceo, ...others]);
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
              <div
                key={i}
                className="bg-card rounded-xl shadow-lg overflow-hidden border border-border animate-pulse"
              >
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
          <h2
            id="team-heading"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Meet Our Founders
          </h2>
          <p className="text-xl text-muted-foreground">
            The brilliant minds behind our success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8" role="list">
          {displayTeam.map((member, index) => {
            const slug = slugify(member.name);
            return (
              <motion.article
                key={`${member.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl border border-border hover:border-primary transition-all duration-300"
                role="listitem"
              >
                <Link
                  href={`/about/team/${slug}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative aspect-square md:h-64 h-74">
                    <Image
                      src={member.image}
                      alt={`${member.name}, ${member.position} at Maceazy`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <p
                      className="text-primary font-medium mb-4"
                      aria-label="Position"
                    >
                      {member.position}
                    </p>
                    <p className="text-muted-foreground">
                      {member.description}
                    </p>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
