'use client';
import React from "react";
import { motion } from "framer-motion";

interface PrivacySectionProps {
  title: string;
  content: React.ReactNode;
  id: string;
}

function PrivacySection({ title, content, id }: PrivacySectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12 scroll-mt-20"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} className="text-2xl md:text-3xl font-bold text-foreground mb-6 border-b-2 border-primary pb-3">
        {title}
      </h2>
      <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
        {content}
      </div>
    </motion.section>
  );
}

export default PrivacySection;
