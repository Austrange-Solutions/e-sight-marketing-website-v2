import { Metadata } from "next";
import DisabledRegistrationForm from "@/components/DisabledRegistrationForm";

export const metadata: Metadata = {
  title: "Disabled Person Registration - e-Sight",
  description:
    "Register for disabled person verification to access special benefits and services. Secure document submission with government-approved disability certification.",
  keywords:
    "disability registration, disabled person verification, disability certificate, UDID card, disability benefits, accessibility services",
  openGraph: {
    title: "Disabled Person Registration - e-Sight",
    description:
      "Register for disabled person verification to access special benefits and services.",
    type: "website",
  },
};

export default function DisabledRegistrationPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Disabled Person Registration",
    description:
      "Register and verify your disability status to access benefits and services",
    provider: {
      "@type": "Organization",
      name: "e-Sight Technologies",
      description: "Making Life easier, For the Disabled",
    },
    accessibilityAPI: ["ARIA"],
    accessibilityControl: [
      "fullKeyboardControl",
      "fullMouseControl",
      "fullTouchControl",
    ],
    accessibilityFeature: [
      "largePrint",
      "highContrast",
      "structuralNavigation",
      "tableOfContents",
      "alternativeText",
    ],
    accessibilityHazard: ["noFlashingHazard", "noMotionSimulationHazard", "noSoundHazard"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/20 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header Section */}
          <header className="text-center mb-8" role="banner">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Disabled Person Registration
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Register and verify your disability status to access special benefits,
              services, and assistance programs.
            </p>
          </header>

          {/* Important Information Section */}
          <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-6 mb-8" role="alert">
            <h2 className="text-lg font-semibold text-warning-foreground mb-3">
              Important Information
            </h2>
            <ul className="space-y-2 text-sm text-warning-foreground list-disc list-inside">
              <li>All fields marked with * are mandatory</li>
              <li>Disability percentage must be at least 40% for certification</li>
              <li>Documents must be clear, legible, and in PDF or image format</li>
              <li>At least one ID proof (Aadhar or PAN) is required</li>
              <li>Verification typically takes 3-5 business days</li>
              <li>You will receive email updates about your application status</li>
            </ul>
          </div>

          {/* Documents Required Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Documents Required
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-foreground mb-2">Mandatory Documents:</h3>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Passport size photograph</li>
                  <li>Government-issued disability certificate</li>
                  <li>Aadhar Card OR PAN Card</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Optional Documents:</h3>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>UDID Card (Recommended)</li>
                  <li>Medical reports</li>
                  <li>Additional certificates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Accessibility Features Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-primary mb-3">
              Accessibility Features
            </h2>
            <p className="text-sm text-muted-foreground">
              This form has been designed with accessibility in mind. It includes:
              proper ARIA labels for screen readers, keyboard navigation support,
              high contrast mode compatibility, and clear form validation messages.
            </p>
          </div>

          {/* Registration Form Component */}
          <main role="main" aria-label="Registration Form">
            <DisabledRegistrationForm />
          </main>

          {/* Help Section */}
          <footer className="mt-8 text-center text-sm text-muted-foreground" role="contentinfo">
            <p>
              Need help? Contact us at{" "}
              <a
                href="mailto:support@e-sight.com"
                className="text-primary hover:underline"
              >
                support@e-sight.com
              </a>{" "}
              or call <a href="tel:+911234567890" className="text-primary hover:underline">+91 123-456-7890</a>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
