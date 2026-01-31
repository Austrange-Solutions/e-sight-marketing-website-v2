"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Search, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Ticket {
  _id: string;
  ticketId: string;
  status: string;
  problemCategory: string;
  customProblem?: string;
  description: string;
  adminResponse?: string;
  updatedAt: string;
  createdAt: string;
}

export default function TrackTicketStatus() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTickets([]);

    try {
      const response = await axios.get(
        `/api/support/track?query=${encodeURIComponent(searchValue)}`,
      );

      if (response.data.success) {
        setTickets(response.data.tickets);
        if (response.data.tickets.length === 0) {
          toast.error(
            "No tickets found. Please check your Ticket ID or Email and try again.",
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching ticket:", error);
      const errorMessage =
        error.response?.data?.error ||
        "No tickets found matching your criteria";
      toast.error(errorMessage);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-5 h-5" />;
      case "in-progress":
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Check Ticket Status
        </h2>
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1">
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter Email Address"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              "Searching..."
            ) : (
              <>
                <Search className="w-5 h-5" /> Check Status
              </>
            )}
          </button>
        </form>
      </div>

      {tickets.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Ticket Details
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    ID:{" "}
                    <span className="font-mono text-gray-700">
                      {ticket.ticketId}
                    </span>
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(ticket.status)}`}
                >
                  {getStatusIcon(ticket.status)}
                  <span className="capitalize">
                    {ticket.status.replace("-", " ")}
                  </span>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Issue Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">
                        {ticket.problemCategory}
                      </p>
                    </div>
                    {ticket.customProblem && (
                      <div>
                        <p className="text-sm text-gray-500">Specific Issue</p>
                        <p className="font-medium text-gray-900">
                          {ticket.customProblem}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700 mt-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Updates & Response
                  </h4>
                  {ticket.adminResponse ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">
                        Support Team Response
                      </p>
                      <p className="text-gray-800">{ticket.adminResponse}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Updated:{" "}
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">
                        No response from support team yet.
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        We typically respond within 24-48 hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
