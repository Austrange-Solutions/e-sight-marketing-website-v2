'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// CEO data that will always be displayed first
const ceoData = {
  name: "Samad Qureshi",
  position: "CEO",
  image: "/assets/images/ceo.jpg",
  description:
    "Visionary leader driving business strategy, growth, and overall company success.",
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

const About = () => {
  // Define team member interface
    interface TeamMember {
      name: string;
      position: string;
      image: string;
      description: string;
    }
  
    // State to hold the randomized team members
    const [randomizedTeam, setRandomizedTeam] = useState<TeamMember[]>([]);
  
  // Randomize team members on component mount
  useEffect(() => {
    const shuffleArray = (array: TeamMember[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    setRandomizedTeam(shuffleArray(otherTeamMembers));
  }, []); // Empty dependency array since we only want this to run once  // Combine CEO with randomized team members
  const displayTeam = [ceoData, ...randomizedTeam];

  return (
    <div className="pt-16">
      {/* Company Overview */}
      <section className="py-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              About e-Kaathi
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Improving the lives of the blind individuals living in darkness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600">
                To improve the life of the blind individuals by giving them a
                better way to navigate their life.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              <p className="text-lg text-gray-600">
                To be the global leader in creating transformative technology
                solutions that shape the way of living of blind individuals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Founders
            </h2>
            <p className="text-xl text-gray-600">
              The brilliant minds behind our success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {displayTeam.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full md:h-64 h-74 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 font-medium mb-4">
                    {member.position}
                  </p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
