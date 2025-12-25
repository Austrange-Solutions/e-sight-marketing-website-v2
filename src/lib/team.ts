export interface TeamMember {
  name: string;
  position: string;
  image: string;
  description: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Samad Qureshi",
    position: "CEO",
    image: "/assets/images/ceo.jpg",
    description:
      "Leading with empathy and purpose to create assistive technologies that improve independence and quality of life for the specially abled.",
    social: {
      linkedin: "https://www.linkedin.com/in/abdussamadqureshi84/",
      email: "samad.austrange@gmail.com",
      twitter: "https://twitter.com/samadq",
    },
  },
  {
    name: "Vishnuraj Vishwakarma",
    position: "COO",
    image: "/assets/images/coo.jpg",
    description:
      "Executive overseeing daily operations, optimizing efficiency, and ensuring business execution.",
    social: {
      linkedin: "https://www.linkedin.com/in/vishnuraj-vishwakarma/",
    },
  },
  {
    name: "Sahil Mane",
    position: "CTO",
    image: "/assets/images/cto.jpg",
    description: "Technical expert specializing in innovative solutions.",
    social: {
      linkedin: "https://www.linkedin.com/in/sahil-mane-003a0924b/",
      twitter: "https://twitter.com/sahilmane",
    },
  },
  {
    name: "Harsh Gupta",
    position: "CIO",
    image: "/assets/images/cio.jpg",
    description:
      "Leader in managing and implementing IT strategies, optimizing technology for business growth.",
    social: {
      linkedin: "https://www.linkedin.com/in/harsh-gupta-2b41692b1/",
    },
  },
];

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function getMemberBySlug(slug: string) {
  return TEAM_MEMBERS.find((m) => slugify(m.name) === slug) || null;
}
