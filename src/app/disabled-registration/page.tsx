import { Metadata } from "next";
import DisabledRegistrationForm from "@/components/DisabledRegistrationForm";
import StatusCheckForm from "@/components/StatusCheckForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      description: "Making Life easier, For Specially",
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
              Register and verify your disability status or check your application status
            </p>
          </header>

          {/* Tabs Component */}
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="register" className="text-base font-semibold">
                New Registration
              </TabsTrigger>
              <TabsTrigger value="status" className="text-base font-semibold">
                Check Status
              </TabsTrigger>
            </TabsList>

            {/* Registration Tab */}
            <TabsContent value="register" className="space-y-8">
              {/* Important Information Section */}
              <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-6" role="alert">
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
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">
                  Documents Required
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Mandatory Documents:</h3>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Passport size photograph</li>
                      <li>Government-issued disability certificate</li>
                      <li>Aadhar Card</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Optional Documents:</h3>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>PAN Card (Recommended)</li>
                      <li>Medical reports</li>
                      <li>Additional certificates</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Accessibility Features Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
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
            </TabsContent>

            {/* Status Check Tab */}
            <TabsContent value="status" className="space-y-8">
              {/* Hero Section for Status */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Track Your Application
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Enter your registration ID or email address to check your application status
                </p>
              </div>

              {/* Status Check Form */}
              <StatusCheckForm />

              {/* Information Section */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  About Your Registration Status
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold text-sm mr-3 flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Pending</p>
                      <p className="text-sm">
                        Your application has been received and is in the queue for review
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 font-semibold text-sm mr-3 flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Under Review</p>
                      <p className="text-sm">
                        Our team is currently reviewing your documents and information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-semibold text-sm mr-3 flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Verified</p>
                      <p className="text-sm">
                        Your registration has been approved! You will receive further instructions via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 font-semibold text-sm mr-3 flex-shrink-0">
                      ✕
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Rejected</p>
                      <p className="text-sm">
                        Your application requires attention. Check your email for details and next steps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
