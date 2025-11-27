"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Package, ShoppingBag } from "lucide-react";

interface BucketInfo {
  name: string;
  description?: string;
  foundation?: { name: string };
  totalBucketValue: number;
  targetValue: number;
  allocatedAmount: number;
  bucketFillPercentage: number;
  poolAllocationPercent: number;
  bucketFillPercent: number;
  bucketQuantity: number;
  products: Array<{
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

interface PoolProgress {
  totalPoolAmount: number;
  totalBucketValue: number;
  poolFillPercentage: number;
  onlineAmount: number;
  csrAmount: number;
  bucketCount: number;
  buckets: BucketInfo[];
}

export default function DonationPoolProgress() {
  const [progress, setProgress] = useState<PoolProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    fetchProgress();
    // Refresh every 30 seconds
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress) {
      // Animate progress bar
      const target = progress.poolFillPercentage;
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedPercentage(target);
          clearInterval(timer);
        } else {
          setAnimatedPercentage(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [progress]);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/donation-pool/progress");
      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error("Error fetching pool progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  // Don't show anything if there's no progress data or no active buckets
  if (!progress || progress.bucketCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-[oklch(0.97_0.01_160)] via-[oklch(0.96_0.015_230)] to-[oklch(0.97_0.01_200)] rounded-2xl p-6 md:p-8 shadow-xl border-2 border-[oklch(0.70_0.15_160)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Donation Pool Progress
          </h3>
          <p className="text-sm md:text-base text-gray-600">
            Supporting {progress.bucketCount} donation bucket{progress.bucketCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-white rounded-full p-3 shadow-md">
          <TrendingUp className="w-8 h-8 text-[oklch(0.70_0.15_160)]" />
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-lg font-semibold text-gray-700">
            {formatCurrency(progress.totalPoolAmount)}
          </span>
          <span className="text-sm text-gray-600">
            of {formatCurrency(progress.totalBucketValue)} goal
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[oklch(0.70_0.15_160)] via-[oklch(0.65_0.14_230)] to-[oklch(0.60_0.12_200)] rounded-full transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: `${Math.min(animatedPercentage, 100)}%` }}
          >
            {animatedPercentage > 15 && (
              <span className="text-[oklch(1_0_0)] font-bold text-sm md:text-base animate-pulse">
                {animatedPercentage}%
              </span>
            )}
          </div>
          {animatedPercentage <= 15 && (
            <span className="absolute inset-0 flex items-center justify-center text-gray-700 font-bold text-sm md:text-base">
              {animatedPercentage}%
            </span>
          )}
        </div>

        {/* Milestone Markers */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Donation Buckets */}
      {progress.buckets && progress.buckets.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-[oklch(0.65_0.14_230)]" />
            Active Donation Buckets
          </h4>
          {progress.buckets.map((bucket, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[oklch(0.65_0.14_230)] hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-gray-900 mb-1">
                    {bucket.name}
                  </h5>
                  {bucket.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {bucket.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[oklch(0.70_0.15_160)]">
                    {formatCurrency(bucket.allocatedAmount)}
                  </p>
                  <p className="text-xs text-gray-500">Allocated</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {bucket.bucketFillPercentage}% filled
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Bucket Progress</span>
                  <span>{formatCurrency(bucket.targetValue)} target</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(bucket.bucketFillPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Products in Bucket */}
              {bucket.products && bucket.products.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Products ({bucket.products.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bucket.products.map((product, pIndex) => (
                      <div
                        key={pIndex}
                        className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(product.productPrice)} × {product.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatCurrency(product.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
