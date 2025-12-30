"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Heart, IndianRupee } from "lucide-react";
import DonationDetailsModal from "./DonationDetailsModal";
import DonorInfoTooltip from "./DonorInfoTooltip";

// Foundation mapping constants
const foundationLabels: Record<string, string> = {
  vsf: "VSF (Vishnu Shakti Foundation)",
  cf: "CF (Chetana Foundation)",
};

const foundationIcons: Record<string, string> = {
  vsf: "💚",
  cf: "💜",
};

const foundationColors: Record<string, string> = {
  vsf: "bg-[oklch(0.95_0.02_160)] text-[oklch(0.70_0.15_160)] border-[oklch(0.85_0.04_160)]",
  cf: "bg-purple-100 text-purple-800 border-purple-200",
};

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
  foundation: any; // Can be string (legacy) or populated foundation object
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

interface FoundationStat {
  foundationId: string;
  foundationName: string;
  foundationCode: string;
  displayName: string;
  icon: string;
  primaryColor: string;
  count: number;
  totalAmount: number;
  totalPlatformFee: number;
  totalFoundationAmount: number;
  totalCompanyAmount: number;
}

interface DonationsStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalRevenue: number;
  totalPlatformFees: number;
  totalNetAmount: number;
  byFoundation: FoundationStat[]; // Changed to array
}

export default function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showZeroDonations, setShowZeroDonations] = useState(true); // Toggle visibility
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [foundationFilter, setFoundationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, foundationFilter, searchTerm]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (foundationFilter !== "all") {
        params.append("foundation", foundationFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      console.log('Fetching donations from:', `/api/admin/donations?${params.toString()}`);
      const response = await fetch(`/api/admin/donations?${params.toString()}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Setting donations:', data.donations?.length || 0);
        
        // Debug: Log first few donations' foundation data
        if (data.donations && data.donations.length > 0) {
          console.log('=== Foundation Data Debug ===');
          data.donations.slice(0, 3).forEach((d: any, idx: number) => {
            console.log('Donation', idx + 1, ':', {
              id: d._id,
              foundation: d.foundation,
              foundationType: typeof d.foundation,
              foundationKeys: typeof d.foundation === 'object' ? Object.keys(d.foundation) : 'N/A'
            });
          });
        }
        
        setDonations(data.donations || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('API returned success: false', data);
        setDonations([]);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setDonations([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[oklch(0.95_0.02_160)] text-[oklch(0.70_0.15_160)] border-[oklch(0.85_0.04_160)]";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRowClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
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

      // Update local state
      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation._id === donationId
            ? { ...donation, isAnonymous: newStatus }
            : donation
        )
      );

      // Update selected donation if it's the one being modified
      if (selectedDonation?._id === donationId) {
        setSelectedDonation({ ...selectedDonation, isAnonymous: newStatus });
      }
    } catch (error) {
      console.error("Error toggling anonymity:", error);
      throw error;
    }
  };

  const exportDonations = () => {
    // Create CSV content
    const headers = [
      "Date",
      "Donor Name",
      "Anonymous",
      "Email",
      "Phone",
      "Total Amount",
      "Platform Fee %",
      "Platform Fee",
      "Foundation Share %",
      "Foundation Amount",
      "Company Share %",
      "Company Amount",
      "Sticks",
      "Foundation",
      "Status",
      "Payment ID",
      "Order ID",
    ];
    const csvContent = [
      headers.join(","),
      ...donations.map((d) =>
        [
          formatDate(d.createdAt),
          d.donorName,
          d.isAnonymous ? "Yes" : "No",
          d.email,
          d.phone,
          d.amount.toFixed(2),
          d.platformFeePercent?.toFixed(2) || "0.00",
          (d.platformFee || 0).toFixed(2),
          d.foundationSharePercent?.toFixed(2) || "0.00",
          (d.foundationAmount || 0).toFixed(2),
          d.companySharePercent?.toFixed(2) || "0.00",
          (d.companyAmount || 0).toFixed(2),
          d.sticksEquivalent.toFixed(2),
          typeof d.foundation === 'object' 
            ? (d.foundation?.foundationName || d.foundation?.displayName || "Unknown")
            : foundationLabels[d.foundation || "vsf"],
          d.status,
          d.paymentId || "",
          d.orderId || "",
        ].join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !donations.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card border-2 border-indigo-300 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="bg-card border border-orange-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fees</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{stats.totalPlatformFees?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  %
                </div>
              </div>
            </div>

            <div className="bg-card border border-[oklch(0.70_0.15_160)] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">To Foundations</p>
                  <p className="text-2xl font-bold text-[oklch(0.70_0.15_160)]">
                    ₹{stats.totalNetAmount?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[oklch(0.95_0.02_160)] flex items-center justify-center text-[oklch(0.70_0.15_160)] font-bold">
                  🏛️
                </div>
              </div>
            </div>

            <div className="bg-card border border-[oklch(0.65_0.14_230)] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">To Company</p>
                  <p className="text-2xl font-bold text-[oklch(0.65_0.14_230)]">
                    ₹{(
                      // Prefer server-aggregated value when present to avoid small rounding/logic differences
                      (stats as any).totalCompanyAmount !== undefined
                        ? (stats as any).totalCompanyAmount
                        : (stats.totalRevenue - (stats.totalPlatformFees || 0) - (stats.totalNetAmount || 0))
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[oklch(0.96_0.015_230)] flex items-center justify-center text-[oklch(0.65_0.14_230)] font-bold">
                  🏢
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                  ⏱
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Section */}
          <div className="bg-gradient-to-br from-[oklch(0.96_0.015_230)] to-[oklch(0.96_0.015_200)] border-2 border-[oklch(0.65_0.14_230)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💰 Revenue Breakdown
              <span className="text-sm font-normal text-gray-600">(How ₹{stats.totalRevenue.toLocaleString("en-IN")} is distributed)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Platform Fee */}
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-xl">🔧</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-orange-800 uppercase">Platform Fees</div>
                    <div className="text-xs text-orange-600">Website & Payment Costs</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  ₹{stats.totalPlatformFees?.toLocaleString("en-IN") || "0"}
                </div>
                <div className="text-xs text-orange-700">
                  {stats.totalRevenue > 0 
                    ? `${((stats.totalPlatformFees / stats.totalRevenue) * 100).toFixed(1)}% of total revenue`
                    : '0%'
                  }
                </div>
              </div>

              {/* To Foundations */}
              <div className="bg-white rounded-lg p-4 border-2 border-[oklch(0.70_0.15_160)] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.95_0.02_160)] flex items-center justify-center">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[oklch(0.70_0.15_160)] uppercase">To Foundations</div>
                    <div className="text-xs text-[oklch(0.70_0.15_160)]">NGO/Foundation Share</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[oklch(0.70_0.15_160)] mb-1">
                  ₹{stats.totalNetAmount?.toLocaleString("en-IN") || "0"}
                </div>
                <div className="text-xs text-[oklch(0.70_0.15_160)]">
                  {stats.totalRevenue > 0 
                    ? `${((stats.totalNetAmount / stats.totalRevenue) * 100).toFixed(1)}% of total revenue`
                    : '0%'
                  }
                </div>
              </div>

              {/* To Company */}
              <div className="bg-white rounded-lg p-4 border-2 border-[oklch(0.65_0.14_230)] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.96_0.015_230)] flex items-center justify-center">
                    <span className="text-xl">🏢</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[oklch(0.65_0.14_230)] uppercase">To Company</div>
                    <div className="text-xs text-[oklch(0.65_0.14_230)]">MACEAZY Revenue Share</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[oklch(0.65_0.14_230)] mb-1">
                  ₹{(
                    (stats as any).totalCompanyAmount !== undefined
                      ? (stats as any).totalCompanyAmount
                      : (stats.totalRevenue - (stats.totalPlatformFees || 0) - (stats.totalNetAmount || 0))
                  ).toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-[oklch(0.65_0.14_230)]">
                  {stats.totalRevenue > 0 
                    ? `${(((
                        (stats as any).totalCompanyAmount !== undefined
                          ? (stats as any).totalCompanyAmount
                          : (stats.totalRevenue - (stats.totalPlatformFees || 0) - (stats.totalNetAmount || 0))
                      ) / stats.totalRevenue) * 100).toFixed(1)}% of total revenue`
                    : '0%'
                  }
                </div>
              </div>
            </div>

            {/* Verification Summary */}
            <div className="mt-4 pt-4 border-t border-[oklch(0.65_0.14_230)]">
              <div className="flex flex-wrap justify-between items-center text-sm">
                <div className="text-gray-700">
                  <span className="font-semibold">Total Revenue:</span> ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-gray-600">
                  = ₹{stats.totalPlatformFees?.toLocaleString("en-IN") || "0"} (Platform) + 
                  ₹{stats.totalNetAmount?.toLocaleString("en-IN") || "0"} (Foundations) + 
                  ₹{(stats.totalRevenue - (stats.totalPlatformFees || 0) - (stats.totalNetAmount || 0)).toLocaleString("en-IN")} (Company)
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                <span>👥</span>
                <span><strong>{stats.completed}</strong> completed donations from <strong>{stats.completed}</strong> individual donors</span>
              </div>
            </div>
          </div>

          {/* Foundation Summary Table */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-accent border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Foundation-wise Collection Summary</h3>
              <button
                onClick={() => setShowZeroDonations(!showZeroDonations)}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {showZeroDonations ? "Hide Zero Donations" : "Show Zero Donations"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Foundation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Donations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Collected
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Platform Fee (2%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Net Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {stats.byFoundation
                    .filter(foundation => showZeroDonations || foundation.count > 0)
                    .map((foundation) => (
                    <tr key={foundation.foundationId} className="hover:bg-accent/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{foundation.icon}</span>
                          <span className="text-sm font-medium text-foreground">
                            {foundation.displayName || foundation.foundationName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {foundation.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: foundation.primaryColor }}>
                        ₹{foundation.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                        ₹{foundation.totalPlatformFee?.toLocaleString("en-IN") || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[oklch(0.70_0.15_160)]">
                        ₹{foundation.totalFoundationAmount?.toLocaleString("en-IN") || "0"}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-accent/30 font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {stats.byFoundation.reduce((sum, f) => sum + f.count, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ₹{stats.totalRevenue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                      ₹{stats.totalPlatformFees?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[oklch(0.70_0.15_160)]">
                      ₹{stats.byFoundation.reduce((sum, f) => sum + (f.totalFoundationAmount || 0), 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Filters and Search */}
      <div className="bg-card border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={foundationFilter}
              onChange={(e) => {
                setFoundationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none"
            >
              <option value="all">All Foundations</option>
              <option value="vsf">VSF</option>
              <option value="cf">CF</option>
            </select>
          </div>

          <button
            onClick={exportDonations}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Foundation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {donations.map((donation) => (
                <tr 
                  key={donation._id} 
                  className="hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(donation)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DonorInfoTooltip
                      donorName={donation.donorName}
                      email={donation.email}
                      phone={donation.phone}
                      address={donation.address}
                      city={donation.city}
                      state={donation.state}
                      pan={donation.pan}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground">
                          {donation.donorName}
                        </div>
                        {donation.isAnonymous && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                            🔒 Anonymous
                          </span>
                        )}
                      </div>
                    </DonorInfoTooltip>
                    <div className="text-sm text-muted-foreground">
                      {donation.sticksEquivalent.toFixed(1)} E-Kaathi Pro
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{donation.email}</div>
                    <div className="text-sm text-muted-foreground">{donation.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-foreground">
                        ₹{donation.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-orange-600">
                        - Platform ({donation.platformFeePercent?.toFixed(1) || "0"}%): ₹{(donation.platformFee || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-green-700 font-semibold border-t border-gray-200 pt-0.5">
                        Foundation ({donation.foundationSharePercent?.toFixed(1) || "0"}%): ₹{(donation.foundationAmount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600">
                        Company ({donation.companySharePercent?.toFixed(1) || "0"}%): ₹{(donation.companyAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">
                          {typeof donation.foundation === 'object' && donation.foundation?.icon 
                            ? donation.foundation.icon 
                            : foundationIcons[donation.foundation?.code || donation.foundation || "vsf"]}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            typeof donation.foundation === 'object' && donation.foundation?.primaryColor
                              ? `border-[${donation.foundation.primaryColor}]`
                              : foundationColors[donation.foundation?.code || donation.foundation || "vsf"]
                          }`}
                          style={typeof donation.foundation === 'object' && donation.foundation?.primaryColor ? {
                            backgroundColor: `${donation.foundation.primaryColor}20`,
                            color: donation.foundation.primaryColor,
                            borderColor: donation.foundation.primaryColor
                          } : undefined}
                        >
                          {typeof donation.foundation === 'object' 
                            ? (donation.foundation.displayName || donation.foundation.foundationName || donation.foundation.code || "Unknown").toUpperCase()
                            : foundationLabels[donation.foundation as string] || (donation.foundation || "vsf").toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-xs" title={typeof donation.foundation === 'object' ? (donation.foundation._id || donation.foundation.id || donation.foundation) : donation.foundation}>
                        ID: {typeof donation.foundation === 'object' 
                          ? (donation.foundation._id || donation.foundation.id || 'N/A')
                          : donation.foundation || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(
                        donation.status
                      )}`}
                    >
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {donation.paymentId || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-border">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {donations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No donations found</p>
          </div>
        )}
      </div>

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
