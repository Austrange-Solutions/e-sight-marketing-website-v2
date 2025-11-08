'use client';
import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Building
} from "lucide-react";

const ContactInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
      suppressHydrationWarning
    >
      <h2 className="text-3xl font-bold text-foreground mb-8">
        Contact Information
      </h2>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <a
              href="mailto:contact@maceazy.com"
              className="text-lg font-medium text-foreground hover:text-primary"
            >
              contact@maceazy.com
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <a
              href="tel:+919322871984"
              className="text-lg font-medium text-foreground hover:text-primary"
            >
              +91 93228 71984
            </a>{" "}
            /{" "}
            <a
              href="tel:+918433887840"
              className="text-lg font-medium text-foreground hover:text-primary"
            >
              +91 84338 87840
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Address</p>
            <div className="text-lg font-medium text-foreground">
              Office 1: CIEL - Room 409, Chetana College, Bandra (East), Mumbai 400051
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Address</p>
            <div className="text-lg font-medium text-foreground">
              Office 2: Riidl - Room 520, Bhaskaracharya Building, Somaiya Vidyavihar, Mumbai 400077
            </div>
          </div>
        </div>
      </div>

      {/* Updated Business section to match the structure of other sections */}
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Business</p>
            <div className="text-lg font-medium text-foreground">
              <div>Operated by <strong>Austrange Solutions Private Limited</strong>
              <br/><strong>Merchant Legal entity name:</strong> AUSTRANGE SOLUTIONS PRIVATE LIMITED</div>
            </div>
          </div>
        </div>



      {/* <div className="pt-8 border-t border-border">
        <h3 className="text-sm text-muted-foreground">Business</h3>
        <p className="text-sm text-foreground mt-2">Operated by <strong>Austrange Solutions Private Limited</strong></p>
        <div className="text-sm text-foreground mt-2">
          <div><strong>Merchant Legal entity name:</strong> AUSTRANGE SOLUTIONS PRIVATE LIMITED</div>
        </div>
      </div> */}

      <div className="pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Follow Us
        </h3>
        <div className="flex space-x-4">
          <a
            href="https://www.facebook.com/people/Austrange-Solutions/61575298985988/"
            className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary/20 transition-colors duration-200"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="https://x.com/austrangesolns"
            className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary/20 transition-colors duration-200"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="https://www.instagram.com/austrangesolutions/"
            className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary/20 transition-colors duration-200"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;
