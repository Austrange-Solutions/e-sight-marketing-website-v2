'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, FileText, Settings, Shield, Bell, Users, MapPin, Camera, Smartphone, Lock } from "lucide-react";
import PrivacySection from "./PrivacySection";

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState<string>("");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  const sections = [
    { id: "about", title: "About E-Kaathi", icon: <Eye className="w-5 h-5" /> },
    { id: "information", title: "Information We Collect", icon: <FileText className="w-5 h-5" /> },
    { id: "permissions", title: "Permission Usage", icon: <Settings className="w-5 h-5" /> },
    { id: "security", title: "Data Security", icon: <Shield className="w-5 h-5" /> },
    { id: "emergency", title: "Emergency SOS System", icon: <Bell className="w-5 h-5" /> },
    { id: "rights", title: "Your Privacy Rights", icon: <Users className="w-5 h-5" /> },
    { id: "contact", title: "Contact Us", icon: <Smartphone className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Table of Contents */}
      <section className="py-12 bg-accent" aria-labelledby="toc-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 id="toc-heading" className="text-2xl font-bold text-foreground mb-4">Table of Contents</h2>
          </motion.div>
          <nav className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Privacy policy table of contents">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center p-4 bg-card rounded-lg shadow hover:shadow-md transition-all duration-300 text-left w-full hover:border-2 hover:border-primary"
                aria-label={`Go to ${section.title} section`}
              >
                <div className="text-primary mr-3" aria-hidden="true">{section.icon}</div>
                <span className="font-medium text-foreground">{section.title}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <article className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* About e-Kaathi */}
          <PrivacySection
            id="about"
            title="About E-Kaathi"
            content={
              <>
                <p className="text-lg">
                  E-Kaathi is a specialized mobile application designed to assist visually impaired individuals through Bluetooth-enabled smart walking stick technology. Our app connects to physical smart walking sticks equipped with ESP32-C3 microcontrollers to provide safety features including emergency SOS alerts and real-time location sharing with designated caretakers.
                </p>
              </>
            }
          />

          {/* Information We Collect */}
          <PrivacySection
            id="information"
            title="Information We Collect and How We Use It"
            content={
              <div className="space-y-6">
                <div className="bg-accent p-6 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-6 h-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold text-foreground">1. Location Information</h3>
                  </div>
                  <div className="space-y-2 text-foreground">
                    <p><strong>What we collect:</strong> Your real-time GPS coordinates and location history</p>
                    <p><strong>Why we need it:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>To share your location with authorized caretakers for safety monitoring</li>
                      <li>To send precise location data during emergency SOS situations</li>
                      <li>To provide navigation assistance through your smart walking stick</li>
                    </ul>
                    <p><strong>Storage:</strong> All location data is stored locally on your device and only transmitted to your designated caretakers</p>
                  </div>
                </div>

                <div className="bg-accent p-6 rounded-lg border-l-4 border-secondary">
                  <div className="flex items-center mb-3">
                    <Smartphone className="w-6 h-6 text-secondary mr-2" />
                    <h3 className="text-xl font-semibold text-foreground">2. Bluetooth Connectivity Data</h3>
                  </div>
                  <div className="space-y-2 text-foreground">
                    <p><strong>What we collect:</strong> Bluetooth device connection information and communication data from your E-Kaathi smart walking stick</p>
                    <p><strong>Why we need it:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>To maintain connection with your ESP32-C3 equipped walking stick</li>
                      <li>To receive emergency SOS signals when you hold the SOS button for 5 seconds</li>
                      <li>To provide real-time communication between your device and walking stick</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-accent p-6 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center mb-3">
                    <Camera className="w-6 h-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold text-foreground">3. Camera Access</h3>
                  </div>
                  <div className="space-y-2 text-foreground">
                    <p><strong>What we collect:</strong> No photos or videos are collected or stored</p>
                    <p><strong>Why we need it:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>To scan QR codes for connecting caretakers to your account</li>
                      <li>To establish secure connections between blind users and their caretakers</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-accent p-6 rounded-lg border-l-4 border-secondary">
                  <div className="flex items-center mb-3">
                    <Users className="w-6 h-6 text-secondary mr-2" />
                    <h3 className="text-xl font-semibold text-foreground">4. Contact Information</h3>
                  </div>
                  <div className="space-y-2 text-foreground">
                    <p><strong>What we collect:</strong> Phone numbers of designated caretakers</p>
                    <p><strong>Why we need it:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>To send emergency SMS alerts during SOS situations</li>
                      <li>To notify caretakers of your location during emergencies</li>
                    </ul>
                  </div>
                </div>
              </div>
            }
          />

          {/* Permission Usage */}
          <PrivacySection
            id="permissions"
            title="Detailed Permission Usage"
            content={
              <div className="space-y-6">
                <div className="border-2 border-primary p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Bluetooth Permissions</h3>
                  <div className="space-y-3">
                    <p><strong>Why We Need These:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Connect to your E-Kaathi smart walking stick with ESP32-C3 microcontroller</li>
                      <li>Receive SOS signals when you press and hold the emergency button for 5 seconds</li>
                      <li>Maintain continuous connection for real-time safety features</li>
                    </ul>
                  </div>
                </div>

                <div className="border-2 border-secondary p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Location Permissions</h3>
                  <div className="space-y-3">
                    <p><strong>When We Use Your Location:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Only when you're actively using the app or during an emergency</li>
                      <li>Shared only with your approved caretakers</li>
                      <li>Never sold or shared with third parties</li>
                    </ul>
                  </div>
                </div>
              </div>
            }
          />

          {/* Data Security */}
          <PrivacySection
            id="security"
            title="Data Security"
            content={
              <div className="space-y-4">
                <div className="bg-accent p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Lock className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-2xl font-semibold text-foreground">How We Protect Your Data</h3>
                  </div>
                  <ul className="space-y-3 text-foreground list-disc list-inside ml-4">
                    <li><strong>Encryption:</strong> All data transmitted between your device and caretakers is encrypted</li>
                    <li><strong>Local Storage:</strong> Most data is stored locally on your device, not on external servers</li>
                    <li><strong>Secure Connections:</strong> Bluetooth and network connections use industry-standard security protocols</li>
                    <li><strong>No Third-Party Sharing:</strong> We never sell or share your data with third parties</li>
                    <li><strong>Authorized Access Only:</strong> Only you and your approved caretakers can access your location data</li>
                  </ul>
                </div>
              </div>
            }
          />

          {/* Emergency SOS System */}
          <PrivacySection
            id="emergency"
            title="Emergency SOS System"
            content={
              <div className="space-y-4">
                <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Bell className="w-8 h-8 text-red-600 mr-3" />
                    <h3 className="text-2xl font-semibold text-foreground">How the SOS Feature Works</h3>
                  </div>
                  <div className="space-y-3 text-foreground">
                    <p><strong>Activation:</strong> Press and hold the SOS button on your E-Kaathi stick for 5 seconds</p>
                    <p><strong>What Happens:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Your location is immediately shared with all designated caretakers</li>
                      <li>SMS alerts are sent to caretaker phone numbers</li>
                      <li>App notifications are sent to caretaker devices</li>
                      <li>Your location continues to be updated every few seconds until help arrives</li>
                    </ul>
                    <p className="text-red-600 font-semibold mt-4">⚠️ During emergencies, location sharing cannot be disabled until the SOS is cancelled or acknowledged by a caretaker</p>
                  </div>
                </div>
              </div>
            }
          />

          {/* Your Privacy Rights */}
          <PrivacySection
            id="rights"
            title="Your Privacy Rights"
            content={
              <div className="space-y-4">
                <p className="text-lg">You have the right to:</p>
                <ul className="space-y-3 list-disc list-inside ml-4">
                  <li><strong>Access Your Data:</strong> Request a copy of all data we have about you</li>
                  <li><strong>Delete Your Data:</strong> Request deletion of your account and all associated data</li>
                  <li><strong>Manage Caretakers:</strong> Add or remove authorized caretakers at any time</li>
                  <li><strong>Control Permissions:</strong> Enable or disable app permissions through your device settings</li>
                  <li><strong>Opt-Out of Location Sharing:</strong> Disable location sharing except during emergencies</li>
                </ul>
                <div className="bg-accent p-4 rounded-lg mt-6">
                  <p className="text-sm text-muted-foreground italic">
                    <strong>Important:</strong> Some features like emergency SOS require certain permissions to function properly. Disabling these permissions may affect app functionality.
                  </p>
                </div>
              </div>
            }
          />

          {/* Contact Us */}
          <PrivacySection
            id="contact"
            title="Contact Us"
            content={
              <div className="bg-primary/10 p-8 rounded-lg border-2 border-primary">
                <h3 className="text-xl font-semibold text-foreground mb-4">Questions About Your Privacy?</h3>
                <p className="mb-6">If you have any questions, concerns, or requests regarding this privacy policy or your data, please contact us:</p>
                <div className="space-y-3">
                  <p><strong>Email:</strong> <a href="mailto:austrange.india@gmail.com" className="text-primary hover:underline">austrange.india@gmail.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+919322871984" className="text-primary hover:underline">+91 93228 71984</a></p>
                  <p><strong>Response Time:</strong> We typically respond within 48-72 hours</p>
                </div>
              </div>
            }
          />

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center border-t-2 border-border pt-8 mt-12"
          >
            <p className="text-lg font-semibold text-foreground mb-4">
              By using E-Kaathi, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
            <div className="text-muted-foreground space-y-2">
              <p className="italic">E-Kaathi - Empowering Independence Through Safe Navigation Technology</p>
              <div className="text-sm">
                <p><strong>Version:</strong> 1.0</p>
                <p><strong>Effective Date:</strong> January 2025</p>
              </div>
            </div>
          </motion.div>
        </div>
      </article>
    </>
  );
}
