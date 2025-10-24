"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface FoundationSetting {
  foundationCode: "vsf" | "cf";
  foundationName: string;
  platformFeePercent: number;
  foundationSharePercent: number;
  razorpayFeePercent: number;
}

interface DonationBreakdownPreviewProps {
  amount: number;
  foundation: "vsf" | "cf";
}

export default function DonationBreakdownPreview({ amount, foundation }: DonationBreakdownPreviewProps) {
  const [breakdown, setBreakdown] = useState<{
    razorpayFee: number;
    platformFee: number;
    foundationAmount: number;
    companyAmount: number;
    razorpayFeePercent: number;
    platformFeePercent: number;
    foundationSharePercent: number;
    companySharePercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreakdown();
  }, [amount, foundation]);

  const fetchBreakdown = async () => {
    if (!amount || amount <= 0) {
      setBreakdown(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/foundation-settings");
      const data = await response.json();

      if (data.success) {
        const settings = data.settings.find((s: FoundationSetting) => s.foundationCode === foundation);
        if (settings) {
          const razorpayFee = Math.round(amount * (settings.razorpayFeePercent / 100) * 100) / 100;
          const afterRazorpay = Math.round((amount - razorpayFee) * 100) / 100;
          
          const platformFee = Math.round(afterRazorpay * (settings.platformFeePercent / 100) * 100) / 100;
          const afterPlatformFee = Math.round((afterRazorpay - platformFee) * 100) / 100;
          
          const foundationAmount = Math.round(afterPlatformFee * (settings.foundationSharePercent / 100) * 100) / 100;
          const companyAmount = Math.round((afterPlatformFee - foundationAmount) * 100) / 100;

          setBreakdown({
            razorpayFee,
            platformFee,
            foundationAmount,
            companyAmount,
            razorpayFeePercent: settings.razorpayFeePercent,
            platformFeePercent: settings.platformFeePercent,
            foundationSharePercent: settings.foundationSharePercent,
            companySharePercent: 100 - settings.foundationSharePercent,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching breakdown:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !breakdown || amount <= 0) {
    return null;
  }

  const foundationNames: Record<string, string> = {
    vsf: "Vishnu Shakti Foundation",
    cf: "Chetana Foundation",
  };

  const foundationIcons: Record<string, string> = {
    vsf: "💚",
    cf: "💜",
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1">
            How your ₹{amount.toLocaleString("en-IN")} donation will be allocated:
          </h4>
          <p className="text-xs text-blue-700">
            {foundationIcons[foundation]} {foundationNames[foundation]}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Original Amount */}
        <div className="flex items-center justify-between text-sm pb-2 border-b border-blue-200">
          <span className="font-semibold text-blue-900">Total Donation Amount:</span>
          <span className="font-bold text-blue-900">₹{amount.toLocaleString("en-IN")}</span>
        </div>

        {/* Razorpay Fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-red-700">
            <span className="mr-1">−</span>
            Razorpay Fee ({breakdown.razorpayFeePercent}%):
          </span>
          <span className="text-red-700 font-medium">₹{breakdown.razorpayFee.toFixed(2)}</span>
        </div>

        {/* Platform Fee */}
        <div className="flex items-center justify-between text-sm pb-2 border-b border-blue-200">
          <span className="text-orange-700">
            <span className="mr-1">−</span>
            Platform Fee ({breakdown.platformFeePercent}%):
          </span>
          <span className="text-orange-700 font-medium">₹{breakdown.platformFee.toFixed(2)}</span>
        </div>

        {/* Foundation Amount */}
        <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded border border-green-200">
          <span className="text-green-800 font-semibold">
            ✓ Foundation Receives ({breakdown.foundationSharePercent}%):
          </span>
          <span className="text-green-800 font-bold text-base">₹{breakdown.foundationAmount.toFixed(2)}</span>
        </div>

        {/* Company Amount */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700">
            Company Share ({breakdown.companySharePercent.toFixed(1)}%):
          </span>
          <span className="text-blue-700 font-medium">₹{breakdown.companyAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-600">
          <strong>Note:</strong> The foundation will directly receive{" "}
          <strong>₹{breakdown.foundationAmount.toFixed(2)}</strong> from your generous contribution of{" "}
          <strong>₹{amount.toLocaleString("en-IN")}</strong>.
        </p>
      </div>
    </div>
  );
}
