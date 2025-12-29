"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { sanitizeUrl } from "@/lib/validation";

interface Ticket {
  _id: string;
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  userType: string;
  problemCategory: string;
  customProblem?: string;
  description: string;
  photos: string[];
  status: "pending" | "in-progress" | "resolved";
  adminResponse?: string;
  createdAt: string;
}

export default function SupportTicketManager() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/admin/support-tickets?status=${filterStatus}`
      );
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      const { data } = await axios.put("/api/admin/support-tickets", {
        ticketId: selectedTicket.ticketId,
        status: newStatus,
        adminResponse: responseMessage,
      });

      if (data.success) {
        toast.success("Ticket updated successfully");
        setTickets((prev) =>
          prev.map((t) =>
            t.ticketId === selectedTicket.ticketId ? data.ticket : t
          )
        );
        setSelectedTicket(data.ticket);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      resolved: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${styles[status as keyof typeof styles]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-120px)] flex overflow-hidden">
      {/* Ticket List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-700">Support Tickets</h2>
            <button
              onClick={fetchTickets}
              className="text-blue-600 text-sm hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="flex gap-2">
            {["all", "pending", "in-progress", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tickets found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setResponseMessage(ticket.adminResponse || "");
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTicket?._id === ticket._id
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs text-gray-500">
                      #{ticket.ticketId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate mb-1">
                    {ticket.problemCategory}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {ticket.name}
                  </p>
                  <div className="flex justify-between items-center">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs text-gray-500 capitalize">
                      {ticket.userType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail View */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {selectedTicket ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedTicket.problemCategory}
                    {selectedTicket.customProblem && (
                      <span className="text-gray-500 font-normal text-lg">
                        {" "}
                        - {selectedTicket.customProblem}
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      ID: {selectedTicket.ticketId}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                    User Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500 w-20 inline-block">
                        Name:
                      </span>{" "}
                      <span className="font-medium">{selectedTicket.name}</span>
                    </p>
                    <p>
                      <span className="text-gray-500 w-20 inline-block">
                        Email:
                      </span>{" "}
                      <span className="font-medium">
                        {selectedTicket.email}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500 w-20 inline-block">
                        Phone:
                      </span>{" "}
                      <span className="font-medium">
                        {selectedTicket.phone}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500 w-20 inline-block">
                        Type:
                      </span>{" "}
                      <span className="font-medium">
                        {selectedTicket.userType}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500 w-20 inline-block">
                        Gender:
                      </span>{" "}
                      <span className="font-medium">
                        {selectedTicket.gender}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {selectedTicket.photos && selectedTicket.photos.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Attachments
                  </h4>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {selectedTicket.photos.map((photo, idx) => {
                      const safeUrl = sanitizeUrl(photo);
                      return (
                        /* deepcode ignore DOMXSS: URL validated via sanitizeUrl which checks against CloudFront/S3 allowlist */
                        <a
                          key={idx}
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (safeUrl === "#") {
                              e.preventDefault();
                            }
                          }}
                          className="block w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity relative group"
                        >
                          <Image
                            src={photo}
                            alt={`Attachment ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <ExternalLink className="text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">
                  Update Status & Response
                </h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Response (Sent to user)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Write a solution or response..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate("in-progress")}
                    disabled={
                      updating || selectedTicket.status === "in-progress"
                    }
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("resolved")}
                    disabled={updating || selectedTicket.status === "resolved"}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("pending")}
                    disabled={updating || selectedTicket.status === "pending"}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 disabled:opacity-50"
                  >
                    Mark Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
