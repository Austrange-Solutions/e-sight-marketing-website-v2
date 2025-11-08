"use client";

import { ReactNode, useState } from "react";
import { Mail, Phone, MapPin, CreditCard } from "lucide-react";

interface DonorInfoTooltipProps {
  children: ReactNode;
  donorName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pan?: string;
}

export default function DonorInfoTooltip({
  children,
  donorName,
  email,
  phone,
  address,
  city,
  state,
  pan,
}: DonorInfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const hasAddress = address || city || state;
  const fullAddress = [address, city, state].filter(Boolean).join(", ");

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-4 animate-fadeIn">
          {/* Arrow */}
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-600 transform rotate-45" />

          {/* Content */}
          <div className="relative space-y-3">
            {/* Header */}
            <div className="pb-2 border-b border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {donorName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Donor Contact Information</p>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {phone}
                </p>
              </div>
            </div>

            {/* Address (if available) */}
            {hasAddress && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {fullAddress}
                  </p>
                </div>
              </div>
            )}

            {/* PAN (if available) */}
            {pan && (
              <div className="flex items-start gap-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">PAN Number</p>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    {pan}
                  </p>
                </div>
              </div>
            )}

            {/* Footer hint */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center">
                Click row for full details
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
