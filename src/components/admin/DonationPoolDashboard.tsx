"use client";

import React, { useState, useEffect } from "react";
import { Download, Users, Building2, Heart, TrendingUp, Calendar } from "lucide-react";
import DonationDetailsModal from "./DonationDetailsModal";
import DonorInfoTooltip from "./DonorInfoTooltip";

interface PoolData {
  totalAmount: number;
  totalBucketValue: number;
  poolFillPercentage: number;
  online: {
    amount: number;
    companyShare: number;
    donorCount: number;
    percentage: number;
  };
  csr: {
    amount: number;
    companyCount: number;
    beneficiaries: number;
    percentage: number;
  };
  foundationBreakdown: Array<{
    foundation: { _id: string; name: string; code: string };
    totalAmount: number;
    online: {
      amount: number;
      donorCount: number;
      donations: Array<{
        _id: string;
        amount: number;
        donor: string;
        donorName: string;
        email: string;
        phone: string;
        isAnonymous: boolean;
        message?: string;
        address?: string;
        city?: string;
        state?: string;
        pan?: string;
        date: string;
        platformFee: number;
        foundationShare: number;
        companyShare: number;
      }>;
    };
    csr: {
      amount: number;
      companyCount: number;
      beneficiaries: number;
      donations: Array<{
        _id: string;
        companyName: string;
        amount: number;
        numberOfPeople: number;
        date: string;
      }>;
    };
    feeBreakdown: {
      platformFee: number;
      foundationShare: number;
      companyShare: number;
    };
  }>;
  buckets: Array<{
    _id: string;
    name: string;
    foundation?: { name: string };
    totalPrice: number;
    bucketQuantity: number;
    totalBucketValue: number;
  }>;
}

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

export default function DonationPoolDashboard() {
  const [pool, setPool] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [expandedFoundation, setExpandedFoundation] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchPool();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchPool = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ dateRange });
      if (dateRange === "custom" && customStartDate && customEndDate) {
        params.append("startDate", customStartDate);
        params.append("endDate", customEndDate);
      }

      const response = await fetch(`/api/admin/donation-pool?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPool(data.pool);
      }
    } catch (error) {
      console.error("Error fetching donation pool:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonorClick = async (donationId: string) => {
    try {
      setFetchingDetails(true);
      
      // Fetch full donation details
      const response = await fetch(`/api/admin/donations?id=${donationId}`);
      const data = await response.json();
      
      if (data.success && data.donations && data.donations.length > 0) {
        setSelectedDonation(data.donations[0]);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching donation details:", error);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDonation(null);
  };

  const handleAnonymityToggle = async (donationId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/donations/${donationId}/anonymity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAnonymous: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update anonymity status");
      }

      // Update selected donation if it's the one being modified
      if (selectedDonation?._id === donationId) {
        setSelectedDonation({ ...selectedDonation, isAnonymous: newStatus });
      }

      // Refresh pool data to reflect changes
      fetchPool();
    } catch (error) {
      console.error("Error toggling anonymity:", error);
      throw error;
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
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading donation pool...</div>
      </div>
    );
  }

  if (!pool) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Donation Pool Dashboard</h2>
        <div className="flex gap-2 items-center">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {dateRange === "custom" && (
        <div className="flex gap-4">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>
      )}

      {/* Pool Fill Progress */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pool Fill Status</h3>
            <p className="text-sm text-gray-600">
              {formatCurrency(pool.totalAmount)} of {formatCurrency(pool.totalBucketValue)} target
            </p>
          </div>
          <div className="text-4xl font-bold text-green-600">
            {pool.poolFillPercentage}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${Math.min(pool.poolFillPercentage, 100)}%` }}
          >
            {pool.poolFillPercentage > 10 && `${pool.poolFillPercentage}%`}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pool */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pool</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(pool.totalAmount)}</p>
            </div>
            <Heart className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        {/* Online Donations - Company Share */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Individual Donors</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(pool.online.companyShare)}</p>
              <p className="text-xs text-gray-500 mt-1">{pool.online.donorCount} donors ({pool.online.percentage}%)</p>
              <p className="text-xs text-blue-600 mt-1">To Company from donations</p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        {/* CSR Donations */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CSR Contributions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(pool.csr.amount)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {pool.csr.companyCount} companies • {pool.csr.beneficiaries} beneficiaries ({pool.csr.percentage}%)
              </p>
            </div>
            <Building2 className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Foundation Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Foundation-wise Breakdown</h3>
        <div className="space-y-4">
          {pool.foundationBreakdown.map((foundation) => (
            <div key={foundation.foundation._id} className="border rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedFoundation(
                    expandedFoundation === foundation.foundation._id
                      ? null
                      : foundation.foundation._id
                  )
                }
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{foundation.foundation.name}</h4>
                  <p className="text-sm text-gray-600">
                    Total: {formatCurrency(foundation.totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">
                    Online: {formatCurrency(foundation.online.amount)} ({foundation.online.donorCount} donors)
                  </p>
                  <p className="text-sm text-green-600">
                    CSR: {formatCurrency(foundation.csr.amount)} ({foundation.csr.companyCount} companies)
                  </p>
                </div>
              </div>

              {expandedFoundation === foundation.foundation._id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Fee Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-sm mb-2">Fee Breakdown</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Platform Fee</p>
                        <p className="font-semibold">{formatCurrency(foundation.feeBreakdown.platformFee)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Foundation Share</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(foundation.feeBreakdown.foundationShare)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Company Share</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(foundation.feeBreakdown.companyShare)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Donor List */}
                  {foundation.online.donations.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Individual Donors</h5>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-2">Donor</th>
                              <th className="text-right p-2">Amount</th>
                              <th className="text-right p-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {foundation.online.donations.map((d) => (
                              <tr 
                                key={d._id} 
                                className="border-t hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => handleDonorClick(d._id)}
                              >
                                <td className="p-2">
                                  <DonorInfoTooltip
                                    donorName={d.donorName}
                                    email={d.email}
                                    phone={d.phone}
                                    address={d.address}
                                    city={d.city}
                                    state={d.state}
                                    pan={d.pan}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{d.donorName}</span>
                                      {d.isAnonymous && (
                                        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                                          🔒 Anonymous
                                        </span>
                                      )}
                                    </div>
                                  </DonorInfoTooltip>
                                </td>
                                <td className="text-right p-2">{formatCurrency(d.amount)}</td>
                                <td className="text-right p-2 text-gray-600">
                                  {new Date(d.date).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CSR List */}
                  {foundation.csr.donations.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">CSR Companies</h5>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-2">Company</th>
                              <th className="text-right p-2">Amount</th>
                              <th className="text-right p-2">Beneficiaries</th>
                              <th className="text-right p-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {foundation.csr.donations.map((d) => (
                              <tr key={d._id} className="border-t">
                                <td className="p-2">{d.companyName}</td>
                                <td className="text-right p-2">{formatCurrency(d.amount)}</td>
                                <td className="text-right p-2">{d.numberOfPeople}</td>
                                <td className="text-right p-2 text-gray-600">
                                  {new Date(d.date).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bucket Summary */}
      {pool.buckets.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Donation Buckets ({pool.buckets.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pool.buckets.map((bucket) => (
              <div key={bucket._id} className="border rounded-lg p-4">
                <h4 className="font-semibold">{bucket.name}</h4>
                <p className="text-sm text-gray-600">
                  {bucket.foundation?.name || 'Pool-based'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {bucket.bucketQuantity} buckets × {formatCurrency(bucket.totalPrice)}
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(bucket.totalBucketValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      <DonationDetailsModal
        donation={selectedDonation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAnonymityToggle={handleAnonymityToggle}
      />
    </div>
  );
}
