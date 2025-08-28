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
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Contact Information
      </h2>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <a
              href="mailto:austrange.india@gmail.com"
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              austrange.india@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Phone className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <a
              href="tel:+919322871984"
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              +91 93228 71984
            </a>{" "}
            /{" "}
            <a
              href="tel:+918433887840"
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              +91 84338 87840
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <MapPin className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p className="text-lg font-medium text-gray-900">
              Not yet, we are online
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Follow Us
        </h3>
        <div className="flex space-x-4">
          <a
            href="#"
            className="bg-indigo-100 p-3 rounded-full text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="bg-indigo-100 p-3 rounded-full text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="bg-indigo-100 p-3 rounded-full text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;
