"use client";

import { useState } from "react";
import { X, Copy, Check, User, Mail, Phone, MapPin, CreditCard, Building, Calendar, Eye, EyeOff } from "lucide-react";

interface Donation {
  _id: string;
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  platformFee: number;
  foundationAmount: number;
  companyAmount: number;
  sticksEquivalent: number;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  status: "pending" | "completed" | "failed";
  foundation: any;
  message?: string;
  isAnonymous: boolean;
  platformFeePercent?: number;
  foundationSharePercent?: number;
  companySharePercent?: number;
  address?: string;
  city?: string;
  state?: string;
  pan?: string;
  createdAt: string;
  updatedAt: string;
}

interface DonationDetailsModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onAnonymityToggle?: (donationId: string, newStatus: boolean) => Promise<void>;
}

export default function DonationDetailsModal({
  donation,
  isOpen,
  onClose,
  onAnonymityToggle,
}: DonationDetailsModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [togglingAnonymity, setTogglingAnonymity] = useState(false);

  if (!isOpen || !donation) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAnonymityToggle = async () => {
    if (!onAnonymityToggle) return;
    
    setTogglingAnonymity(true);
    try {
      await onAnonymityToggle(donation._id, !donation.isAnonymous);
    } catch (error) {
      console.error("Failed to toggle anonymity:", error);
    } finally {
      setTogglingAnonymity(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFoundationName = () => {
    if (typeof donation.foundation === 'object') {
      return donation.foundation?.displayName || donation.foundation?.foundationName || donation.foundation?.code || "Unknown";
    }
    const foundationMap: Record<string, string> = {
      vsf: "Vishnu Shakti Foundation (VSF)",
      cf: "Chetana Foundation (CF)",
    };
    return foundationMap[donation.foundation as string] || (donation.foundation || "Unknown");
  };

  const getFoundationIcon = () => {
    if (typeof donation.foundation === 'object' && donation.foundation?.icon) {
      return donation.foundation.icon;
    }
    const iconMap: Record<string, string> = {
      vsf: "💚",
      cf: "💜",
    };
    return iconMap[donation.foundation?.code || donation.foundation || "vsf"] || "🏛️";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Donation Details</h2>
                <p className="text-sm text-blue-100">Transaction ID: {donation._id.slice(-8)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Anonymity Status & Toggle */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {donation.isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {donation.isAnonymous ? "Anonymous Donation" : "Public Donation"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {donation.isAnonymous 
                        ? "Donor name hidden on public pages" 
                        : "Donor name visible on public pages"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAnonymityToggle}
                  disabled={togglingAnonymity}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    donation.isAnonymous
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {togglingAnonymity ? "Updating..." : donation.isAnonymous ? "Make Public" : "Make Anonymous"}
                </button>
              </div>
            </div>

            {/* Donor Information */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Donor Information
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {/* Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {donation.donorName}
                        {donation.isAnonymous && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                            🔒 Anonymous
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(donation.donorName, "name")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {copied === "name" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{donation.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(donation.email, "email")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {copied === "email" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{donation.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(donation.phone, "phone")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {copied === "phone" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Address (if provided) */}
                {(donation.address || donation.city || donation.state) && (
                  <div className="flex items-start justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-3 flex-1">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {donation.address && <span>{donation.address}<br /></span>}
                          {donation.city && <span>{donation.city}, </span>}
                          {donation.state && <span>{donation.state}</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(
                        `${donation.address || ""} ${donation.city || ""} ${donation.state || ""}`.trim(),
                        "address"
                      )}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {copied === "address" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* PAN (if provided) */}
                {donation.pan && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PAN Number (for 80G certificate)</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{donation.pan}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(donation.pan!, "pan")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {copied === "pan" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Donation Amount Breakdown */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  💰 Donation Breakdown
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Total Amount */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Donation Amount</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{donation.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {donation.sticksEquivalent.toFixed(1)} E-Kaathi Pro units
                  </p>
                </div>

                {/* Fee Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Platform Fee */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔧</span>
                      <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase">Platform Fee</p>
                    </div>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      ₹{(donation.platformFee || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      {donation.platformFeePercent?.toFixed(1)}% of donation
                    </p>
                  </div>

                  {/* Foundation Amount */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🏛️</span>
                      <p className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase">To Foundation</p>
                    </div>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      ₹{(donation.foundationAmount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {donation.foundationSharePercent?.toFixed(1)}% of net
                    </p>
                  </div>

                  {/* Company Amount */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🏢</span>
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase">To Company</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{(donation.companyAmount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {donation.companySharePercent?.toFixed(1)}% of net
                    </p>
                  </div>
                </div>

                {/* Foundation Info */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFoundationIcon()}</span>
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Supporting Foundation</p>
                      <p className="text-sm font-bold text-purple-800 dark:text-purple-200">{getFoundationName()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Transaction Details
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      donation.status === "completed" ? "bg-green-500" :
                      donation.status === "pending" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{donation.status}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    donation.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                    donation.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}>
                    {donation.status.toUpperCase()}
                  </span>
                </div>

                {/* Order ID */}
                {donation.orderId && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                      <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{donation.orderId}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(donation.orderId!, "orderId")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {copied === "orderId" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* Payment ID */}
                {donation.paymentId && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment ID</p>
                      <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{donation.paymentId}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(donation.paymentId!, "paymentId")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {copied === "paymentId" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(donation.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(donation.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message (if provided) */}
            {donation.message && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
                <h3 className="text-sm font-semibold text-pink-800 dark:text-pink-300 mb-2 flex items-center gap-2">
                  💬 Donor Message
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{donation.message}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
