'use client';
import React, { useState, useEffect } from "react";
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
  const [isDonateDomain, setIsDonateDomain] = useState(false);
  const [mainDomainUrl, setMainDomainUrl] = useState('');

  useEffect(() => {
    // Check if we're on the donate subdomain
    const hostname = window.location.hostname;
    const isDonate = hostname.startsWith('donate.');
    setIsDonateDomain(isDonate);
    
    if (isDonate) {
      // Construct main domain URL
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const mainHostname = hostname.replace('donate.', '');
      setMainDomainUrl(`${protocol}//${mainHostname}${port}`);
    }
  }, []);
  return (
    <footer className="text-white">
      {/* full-bleed background wrapper */}
      <div className="relative left-1/2 right-1/2 -translate-x-1/2 w-screen bg-[oklch(0.35_0.08_230)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/assets/images/maceazy-logo.png"
                alt="Maceazy Logo"
                className="h-8 w-28 object-contain"
              />
              <span className="ml-2 text-xl font-bold">Maceazy</span>
            </div>
            <p className="text-white/70">
              Improving the lives of the people living in darkness.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/products", label: "Products" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map((link) => {
                const href = isDonateDomain ? `${mainDomainUrl}${link.href}` : link.href;
                return (
                  <li key={link.href}>
                    {isDonateDomain ? (
                      <a
                        href={href}
                        className="text-white/70 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-white/70 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-white/70">
                <Mail className="h-5 w-5 mr-2" />
                <a
                  href="mailto:contact@maceazy.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  contact@maceazy.com
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
                <MapPin className="h-20 w-20 mr-2" />
                <a
                  href="https://www.google.com/maps/place/Chetana's+Institute+of+Management+%26+Research/@19.0609911,72.845506,17z/data=!4m14!1m7!3m6!1s0x3be7c9000496fab9:0x225542a39da6c430!2sChetana's+Institute+of+Management+%26+Research!8m2!3d19.060986!4d72.8480809!16s%2Fg%2F1tg4jvtk!3m5!1s0x3be7c9000496fab9:0x225542a39da6c430!8m2!3d19.060986!4d72.8480809!16s%2Fg%2F1tg4jvtk?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  className="hover:text-white transition-colors duration-200"
                >
                  <span><b>Office-1:</b> 409 Chetana College, Managament Building, Government Colony, Bandra East, Mumbai, Maharashtra 400051</span>
                </a>
                
              </li>
              <li className="flex items-center text-white/70">
                <MapPin className="h-20 w-20 mr-2" />
                <a
                  href="https://www.google.com/maps/place/riidl/@19.0724732,72.8977421,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7c627731110d3:0xd9ce4d1935434d16!8m2!3d19.0724681!4d72.900317!16s%2Fg%2F124s_zcmr?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D" target="_blank"
                  className="hover:text-white transition-colors duration-200"
                >
                  <span><b>Office-2:</b> Riidl, 520, Bhaskarachraya Building, Somaiya Vidyavihar, Mumbai, Maharashtra 400077</span>
                </a>
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
          <p>&copy; {new Date().getFullYear()} <a href="https://www.austrangesolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Austrange Solutions Pvt. Ltd.</a> All rights reserved.</p>
        </div>
      </div>
      </div> {/* end full-bleed wrapper */}
    </footer>
  );
};

export default Footer;
