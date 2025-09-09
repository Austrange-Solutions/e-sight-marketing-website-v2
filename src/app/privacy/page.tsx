'use client';
import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Smartphone, Lock, Users, MapPin, Camera, Bell, Settings, FileText } from "lucide-react";

const PrivacyPolicyContent = () => {
  const sections = [
    {
      id: "about",
      title: "About e-Kaathi",
      icon: <Eye className="w-6 h-6" />
    },
    {
      id: "information",
      title: "Information We Collect",
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: "permissions",
      title: "Permission Usage",
      icon: <Settings className="w-6 h-6" />
    },
    {
      id: "security",
      title: "Data Security",
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: "emergency",
      title: "Emergency SOS System",
      icon: <Bell className="w-6 h-6" />
    },
    {
      id: "rights",
      title: "Your Privacy Rights",
      icon: <Users className="w-6 h-6" />
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: <Smartphone className="w-6 h-6" />
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Privacy Policy
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-6">
              Your privacy and safety are our top priorities. Learn how we protect your data while keeping you safe.
            </p>
            <div className="text-sm opacity-90">
              <p><strong>Effective Date:</strong> January 2025</p>
              <p><strong>Last Updated:</strong> January 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 text-left w-full"
              >
                <div className="text-indigo-600 mr-3">
                  {section.icon}
                </div>
                <span className="font-medium text-gray-900">{section.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* About e-Kaathi */}
          <motion.div
            id="about"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <Eye className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">About e-Kaathi</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-600 mb-6">
                e-Kaathi is a specialized mobile application designed to assist visually impaired individuals through Bluetooth-enabled smart walking stick technology. Our app connects to physical smart walking sticks equipped with ESP32-C3 microcontrollers to provide safety features including emergency SOS alerts and real-time location sharing with designated caretakers.
              </p>
            </div>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            id="information"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Information We Collect and How We Use It</h2>
            </div>
            
            <div className="space-y-8">
              {/* Location Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">1. Location Information</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>What we collect:</strong> Your real-time GPS coordinates and location history
                  </div>
                  <div>
                    <strong>Why we need it:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>To share your location with authorized caretakers for safety monitoring</li>
                      <li>To send precise location data during emergency SOS situations</li>
                      <li>To provide navigation assistance through your smart walking stick</li>
                    </ul>
                  </div>
                  <div>
                    <strong>How it&apos;s used:</strong> Location data is only shared with caretakers you explicitly authorize
                  </div>
                  <div>
                    <strong>Storage:</strong> All location data is stored locally on your device and only transmitted to your designated caretakers
                  </div>
                </div>
              </div>

              {/* Bluetooth Connectivity */}
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Smartphone className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">2. Bluetooth Connectivity Data</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>What we collect:</strong> Bluetooth device connection information and communication data from your e-Kaathi smart walking stick
                  </div>
                  <div>
                    <strong>Why we need it:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>To maintain connection with your ESP32-C3 equipped walking stick</li>
                      <li>To receive emergency SOS signals when you hold the SOS button for 5 seconds</li>
                      <li>To provide real-time communication between your device and walking stick</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Storage:</strong> Connection data is stored locally and not shared with third parties
                  </div>
                </div>
              </div>

              {/* Camera Access */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Camera className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">3. Camera Access</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>What we collect:</strong> No photos or videos are collected or stored
                  </div>
                  <div>
                    <strong>Why we need it:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>To scan QR codes for connecting caretakers to your account</li>
                      <li>To establish secure connections between blind users and their caretakers</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Storage:</strong> No camera data is stored on our servers or your device
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">4. Contact Information</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>What we collect:</strong> Phone numbers of designated caretakers
                  </div>
                  <div>
                    <strong>Why we need it:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>To send emergency SMS alerts during SOS situations</li>
                      <li>To notify caretakers of your location during emergencies</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Storage:</strong> Contact information is encrypted and stored securely on your device
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Permission Usage */}
          <motion.div
            id="permissions"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <Settings className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Detailed Permission Usage</h2>
            </div>
            
            <div className="space-y-8">
              {/* Bluetooth Permissions */}
              <div className="border border-blue-200 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Bluetooth Permissions</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-900">Permissions Required:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                      <li><code className="bg-gray-100 px-2 py-1 rounded">BLUETOOTH</code></li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">BLUETOOTH_ADMIN</code></li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">BLUETOOTH_CONNECT</code></li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">BLUETOOTH_SCAN</code></li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">BLUETOOTH_PRIVILEGED</code></li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Why We Need These:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                      <li><strong>Primary Purpose:</strong> Connect to your e-Kaathi smart walking stick with ESP32-C3 microcontroller</li>
                      <li><strong>Emergency Function:</strong> Receive SOS signals when you press and hold the emergency button for 5 seconds</li>
                      <li><strong>Safety Monitoring:</strong> Maintain continuous connection for real-time safety features</li>
                      <li><strong>Data Transmission:</strong> Send/receive navigation and safety data between your phone and walking stick</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">What We DON&apos;T Do:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-red-600">
                      <li>❌ We don&apos;t connect to unauthorized Bluetooth devices</li>
                      <li>❌ We don&apos;t access other Bluetooth devices in your area</li>
                      <li>❌ We don&apos;t collect data from devices other than e-Kaathi walking sticks</li>
                      <li>❌ We don&apos;t use Bluetooth for advertising or marketing purposes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Location Permissions */}
              <div className="border border-green-200 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Location Permissions</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-900">Permissions Required:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                      <li><code className="bg-gray-100 px-2 py-1 rounded">ACCESS_FINE_LOCATION</code></li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">ACCESS_COARSE_LOCATION</code></li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">ACCESS_BACKGROUND_LOCATION</code></li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Why We Need These:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                      <li><strong>Emergency Response:</strong> Send precise location to caretakers during SOS alerts</li>
                      <li><strong>Safety Monitoring:</strong> Allow caretakers to track your location for safety purposes</li>
                      <li><strong>Navigation Assistance:</strong> Provide location-based guidance through your walking stick</li>
                      <li><strong>Background Safety:</strong> Continue location monitoring even when app is closed for emergency situations</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">What We DON&apos;T Do:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-red-600">
                      <li>❌ We don&apos;t sell your location data to third parties</li>
                      <li>❌ We don&apos;t use location for advertising or marketing</li>
                      <li>❌ We don&apos;t track you for commercial purposes</li>
                      <li>❌ We don&apos;t share location with anyone except your designated caretakers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div
            id="security"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Data Security and Privacy Measures</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Lock className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Data Encryption</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• All personal data is encrypted using AES-256 encryption</li>
                  <li>• Bluetooth communications with walking stick are secured</li>
                  <li>• Location data transmission to caretakers is encrypted end-to-end</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Local Storage Priority</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• All personal information is stored primarily on your device</li>
                  <li>• No cloud storage of sensitive personal data</li>
                  <li>• Location history kept locally with user-controlled retention periods</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Settings className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Minimal Data Collection</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• We collect only data essential for safety and emergency features</li>
                  <li>• No unnecessary personal information is gathered</li>
                  <li>• Users have full control over what data is shared and with whom</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Access Controls</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Only explicitly authorized caretakers can access your location</li>
                  <li>• User controls all sharing permissions</li>
                  <li>• Immediate revocation of access when caretaker is removed</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Emergency SOS System */}
          <motion.div
            id="emergency"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <Bell className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Emergency SOS System</h2>
            </div>
            
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>SOS Trigger:</strong> Press and hold SOS button on e-Kaathi walking stick for 5 seconds</li>
                <li><strong>Signal Processing:</strong> Walking stick sends emergency signal via Bluetooth to your phone</li>
                <li><strong>Location Capture:</strong> App immediately captures your precise GPS location</li>
                <li><strong>Alert Distribution:</strong> Instant SMS sent to all designated caretakers with your location</li>
                <li><strong>Continuous Updates:</strong> Location updates sent until emergency is resolved</li>
              </ol>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy During Emergencies:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Location sharing is activated only during genuine emergency situations</li>
                <li>SOS system requires deliberate 5-second button press to prevent accidental activation</li>
                <li>Emergency contacts are limited to your pre-approved caretakers only</li>
                <li>All emergency data is encrypted during transmission</li>
              </ul>
            </div>
          </motion.div>

          {/* Your Privacy Rights */}
          <motion.div
            id="rights"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Data Control</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>View:</strong> Access all stored personal data at any time</li>
                  <li><strong>Edit:</strong> Modify caretaker contacts and location sharing preferences</li>
                  <li><strong>Delete:</strong> Remove all stored data from the app</li>
                  <li><strong>Export:</strong> Download your data in standard formats</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Sharing Control</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Authorize:</strong> Choose which caretakers can access your location</li>
                  <li><strong>Revoke:</strong> Instantly remove caretaker access</li>
                  <li><strong>Pause:</strong> Temporarily disable location sharing</li>
                  <li><strong>Resume:</strong> Re-enable location sharing when needed</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            id="contact"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center mb-6">
              <Smartphone className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Privacy Questions or Concerns:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> privacy@e-kaathi.com</p>
                    <p><strong>Phone:</strong> [Your support phone number]</p>
                    <p><strong>Address:</strong> [Your company address]</p>
                    <p><strong>Response Time:</strong> We respond to all privacy inquiries within 48 hours</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Data Protection Officer:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> dpo@e-kaathi.com</p>
                    <p><strong>Role:</strong> Handles all privacy-related complaints and inquiries</p>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">🚨 Emergency Support:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>24/7 Hotline:</strong> [Emergency support number]</p>
                    <p><strong>For:</strong> Technical issues affecting emergency SOS functionality</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center border-t border-gray-200 pt-8"
          >
            <p className="text-lg font-semibold text-gray-900 mb-4">
              By using e-Kaathi, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
            <div className="text-gray-600">
              <p className="italic mb-2">e-Kaathi - Empowering Independence Through Safe Navigation Technology</p>
              <div className="text-sm">
                <p><strong>Version:</strong> 1.0</p>
                <p><strong>Effective Date:</strong> January 2025</p>
                <p><strong>Document ID:</strong> EKAATHI-PP-2025-001</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyContent;
