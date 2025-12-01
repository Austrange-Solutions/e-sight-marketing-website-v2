"use client";

import { useState } from "react";
import CreateTicketForm from "@/components/support/CreateTicketForm";
import TrackTicketStatus from "@/components/support/TrackTicketStatus";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"create" | "track">("create");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mt-[5%] max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Help & Support
          </h1>
          <p className="mt-[5%] max-w-xl mx-auto text-xl text-gray-500">
            We are here to help you. Raise a ticket or track your existing request.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm inline-flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-8 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "create"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Raise a Ticket
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-8 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "track"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Check Status
            </button>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {activeTab === "create" ? <CreateTicketForm /> : <TrackTicketStatus />}
        </div>
      </div>
    </div>
  );
}
