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
} from "lucide-react";

const ContactInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
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
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Address</p>
            <p className="text-lg font-medium text-foreground">
              Not yet, we are online
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <h3 className="text-sm text-muted-foreground">Business</h3>
        <p className="text-sm text-foreground mt-2">Operated by <strong>Austrange Solutions Private Limited</strong></p>
        <div className="text-sm text-foreground mt-2">
          <div><strong>Merchant Legal entity name:</strong> AUSTRANGE SOLUTIONS PRIVATE LIMITED</div>
          <div className="mt-1"><strong>Registered Address:</strong> R No 403, Lakdiwali Lane, Behram Nagar, A K Road, Madina, Bandra East, Mumbai, Maharashtra, PIN: 400051</div>
          <div className="mt-1"><strong>Operational Address:</strong> R No 403, Lakdiwali Lane, Behram Nagar, A K Road, Madina, Bandra East, Mumbai, Maharashtra, PIN: 400051</div>
          <div className="mt-1"><strong>Telephone No:</strong> 8433887840</div>
          <div className="mt-1"><strong>E-Mail ID:</strong> <a href="mailto:austrange.india@gmail.com" className="text-primary">austrange.india@gmail.com</a></div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Last updated on 24-10-2025 13:37:14</p>
      </div>

      <div className="pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Follow Us
        </h3>
        <div className="flex space-x-4">
          <a
            href="#"
            className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary/20 transition-colors duration-200"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary/20 transition-colors duration-200"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="#"
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
