import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    domains: [
      "austrange-storage.s3.ap-south-1.amazonaws.com",
      'dw9tsoyfcyk5k.cloudfront.net'
    ],
  },
};

export default nextConfig;