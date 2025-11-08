"use client";

import { useState, useEffect } from "react";
import { Users, Heart, TrendingUp, Award, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Donation {
  _id: string;
  donorName: string;
  amount: number;
  sticksEquivalent: number;
  message?: string;
  foundation: any;
  createdAt: string;
  isAnonymous: boolean;
}

interface TopDonor {
  donorName: string;
  totalAmount: number;
  donationCount: number;
}

interface Stats {
  totalAmount: number;
  totalDonations: number;
  totalSticks: number;
}

export default function DonorsWallPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [foundationFilter, setFoundationFilter] = useState<string>("all");

  useEffect(() => {
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, foundationFilter]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (foundationFilter !== "all") {
        params.append("foundation", foundationFilter);
      }

      const response = await fetch(`/api/donate/donors?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDonations(data.donations);
        setTopDonors(data.topDonors || []);
        setStats(data.stats);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFoundationIcon = (foundation: any) => {
    if (typeof foundation === "object" && foundation?.icon) {
      return foundation.icon;
    }
    return "🏛️";
  };

  const getFoundationName = (foundation: any) => {
    if (typeof foundation === "object") {
      return foundation?.displayName || foundation?.foundationName || foundation?.code || "Foundation";
    }
    return foundation || "Foundation";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading donor wall...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
              <Heart className="w-12 h-12" fill="currentColor" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Amazing Donors</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Thank you to our generous supporters who are making a difference in the lives of visually impaired individuals
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Donations</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{stats.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Donors</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDonations}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">E-Kaathi Pro Units</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSticks.toFixed(1)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Donors Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Top Donors
                </h2>
              </div>
              <div className="p-6">
                {topDonors.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No top donors yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topDonors.map((donor, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700 dark:to-transparent"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-gradient-to-br from-orange-400 to-orange-600"
                              : "bg-gradient-to-br from-blue-400 to-blue-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {donor.donorName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {donor.donationCount} donation{donor.donationCount > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₹{donor.totalAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Donations</h2>
                <select
                  value={foundationFilter}
                  onChange={(e) => {
                    setFoundationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all">All Foundations</option>
                  <option value="vsf">VSF</option>
                  <option value="cf">CF</option>
                </select>
              </div>

              <div className="p-6">
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No donations found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div
                        key={donation._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {donation.donorName}
                              </h3>
                              {donation.isAnonymous && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                                  🔒 Anonymous
                                </span>
                              )}
                            </div>
                            {donation.message && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                &quot;{donation.message}&quot;
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                {getFoundationIcon(donation.foundation)}
                                {getFoundationName(donation.foundation)}
                              </span>
                              <span>{formatDate(donation.createdAt)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ₹{donation.amount.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {donation.sticksEquivalent.toFixed(1)} E-Kaathi Pro
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Join Our Community of Donors</h2>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Your contribution can change lives. Help us empower visually impaired individuals with assistive technology.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Heart className="w-5 h-5" fill="currentColor" />
              Donate Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
