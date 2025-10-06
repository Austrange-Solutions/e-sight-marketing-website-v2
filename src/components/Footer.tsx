'use client';
import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
// import Image from "next/image"; // Removed unused import

const Footer = () => {
  return (
    <footer className="bg-[oklch(0.35_0.08_230)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/assets/images/e-sight-logo.png"
                alt="E-Kaathi Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold">E-Kaathi</span>
            </div>
            <p className="text-white/70">
              Improving the lives of the people living in darkness.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-white/70">
                <Mail className="h-5 w-5 mr-2" />
                <a
                  href="mailto:austrange.india@gmail.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  austrange.india@gmail.com
                </a>
              </li>
              <li className="flex items-center text-white/70">
                <Phone className="h-5 w-5 mr-2" />
                <a
                  href="tel:+919322871984"
                  className="hover:text-white transition-colors duration-200"
                >
                  +91 93228 71984
                </a>
              </li>
              <li className="flex items-center text-white/70">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Not yet, We are Online.</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href=""
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/e_sight_?igsh=MWNwdDRnZXdjZ2w3OQ=="
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} E-Kaathi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
