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
  // Try to derive a deterministic main domain URL from environment (so server and client render match)
  const envMainDomain =
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ||
    (process.env.NEXT_PUBLIC_HOSTNAME ? `https://${process.env.NEXT_PUBLIC_HOSTNAME}` : "");

  const [isDonateDomain, setIsDonateDomain] = useState(false);
  const [mainDomainUrl, setMainDomainUrl] = useState(envMainDomain);

  useEffect(() => {
    // Check if we're on the donate subdomain (client only)
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    const isDonate = hostname.startsWith('donate.');
    setIsDonateDomain(isDonate);

    if (isDonate) {
      // Construct main domain URL from current location (client runtime)
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
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/assets/images/maceazy-logo.png"
                alt="Maceazy Logo"
                className="h-8 w-20"
              />
              {/* <span className="ml-2 text-xl font-bold">Maceazy</span> */}
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
                { href: "/shipping-policy", label: "Shipping & Delivery" },
                { href: "/refund-policy", label: "Refund & Cancellation" },
                { href: "/terms-of-use", label: "Terms of Use" },
              ].map((link) => {
                // Use a deterministic href (either absolute main domain if configured or relative)
                const href = mainDomainUrl ? `${mainDomainUrl}${link.href}` : link.href;
                return (
                  <li key={link.href}>
                    <a href={href} className="text-white/70 hover:text-white transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resource Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {[
                { href: "/resource-center", label: "All Resources" },
                { href: "/resource-center/annual-reports", label: "Annual Reports" },
                { href: "/resource-center/project-reports", label: "Project Reports" },
                { href: "/resource-center/documents", label: "Documents" },
              ].map((link) => {
                // Use a deterministic href (either absolute main domain if configured or relative)
                const href = mainDomainUrl ? `${mainDomainUrl}${link.href}` : link.href;
                return (
                  <li key={link.href}>
                    <a href={href} className="text-white/70 hover:text-white transition-colors duration-200">
                      {link.label}
                    </a>
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
                  href="tel:+918433887840"
                  className="hover:text-white transition-colors duration-200"
                >
                  +91 84338 87840
                </a>
              </li>
              <li className="flex items-start text-white/70">
                <MapPin className="h-9 w-9 mr-2 mt-1" />
                <div className="text-sm">
                  <div>Office 1: CIEL</div>
                  <div>Room 409, Chetana College, Bandra (East), Mumbai 400051</div>
                </div>
              </li>
              <li className="flex items-start text-white/70">
                <MapPin className="h-11 w-11 mr-2 mt-1" />
                <div className="text-sm">
                  <div>Office 2: Riidl</div>
                  <div>Room 520, Bhaskaracharya Building, Somaiya Vidyavihar, Mumbai 400077</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/people/Austrange-Solutions/61575298985988/"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://x.com/austrangesolns"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/austrangesolutions/"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/70">
          © 2025 Austrange Solutions Private Limited
        </div>
      </div>
      </div> {/* end full-bleed wrapper */}
    </footer>
  );
};

export default Footer;
