import { Metadata } from "next";
import StatusCheckForm from "@/components/StatusCheckForm";

export const metadata: Metadata = {
  title: "Check Registration Status | e-Sight",
  description: "Check the status of your disabled person registration application",
  keywords: ["registration status", "disability certificate", "application tracking"],
};

export default function StatusCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8 mt-5">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Check Registration Status
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your disability registration application by entering your registration ID or email address
          </p>
        </div>

        {/* Status Check Form */}
        <StatusCheckForm />

        {/* Information Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About Your Registration Status
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Pending</p>
                <p className="text-sm text-gray-600">
                  Your application has been received and is in the queue for review
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 font-semibold text-sm mr-3 flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Under Review</p>
                <p className="text-sm text-gray-600">
                  Our team is currently reviewing your documents and information
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 font-semibold text-sm mr-3 flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Verified</p>
                <p className="text-sm text-gray-600">
                  Your registration has been approved! You will receive further instructions via email
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 font-semibold text-sm mr-3 flex-shrink-0">
                ✕
              </span>
              <div>
                <p className="font-medium text-gray-900">Rejected</p>
                <p className="text-sm text-gray-600">
                  Your application requires attention. Check your email for details and next steps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Need help?</p>
          <a
            href="/contact"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
