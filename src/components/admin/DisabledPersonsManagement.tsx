"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DisabledPerson {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  disabilityType: string;
  disabilityPercentage: number;
  verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  createdAt: string;
  city: string;
  state: string;
}

interface DisabledPersonsManagementProps {
  persons: DisabledPerson[];
  onRefresh?: () => void;
}

export default function DisabledPersonsManagement({
  persons,
  onRefresh,
}: DisabledPersonsManagementProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter persons based on search and status
  const filteredPersons = persons.filter((person) => {
    const matchesSearch =
      person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || person.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "under_review":
        return "Under Review";
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/dashboard/disabled-persons/${id}`);
  };

  // Count by status
  const statusCounts = persons.reduce(
    (acc, person) => {
      acc[person.verificationStatus] = (acc[person.verificationStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Disabled Persons Registration</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {persons.length} | Pending: {statusCounts.pending || 0} | Under Review:{" "}
            {statusCounts.under_review || 0} | Verified: {statusCounts.verified || 0} | Rejected:{" "}
            {statusCounts.rejected || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {filteredPersons.map((person) => (
          <div
            key={person._id}
            onClick={() => handleRowClick(person._id)}
            className="bg-white border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{person.fullName}</h4>
                <p className="text-sm text-gray-600 break-all">{person.email}</p>
                <p className="text-sm text-gray-600">{person.phone}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${getStatusColor(
                  person.verificationStatus
                )}`}
              >
                {getStatusLabel(person.verificationStatus)}
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                {person.disabilityType} ({person.disabilityPercentage}%)
              </p>
              <p>
                {person.city}, {person.state}
              </p>
              <p>Registered: {new Date(person.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersons.map((person) => (
              <tr
                key={person._id}
                onClick={() => handleRowClick(person._id)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{person.fullName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{person.email}</div>
                  <div className="text-xs text-gray-500">{person.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{person.disabilityType}</div>
                  <div className="text-xs text-gray-500">{person.disabilityPercentage}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{person.city}</div>
                  <div className="text-xs text-gray-500">{person.state}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      person.verificationStatus
                    )}`}
                  >
                    {getStatusLabel(person.verificationStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(person.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPersons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery || statusFilter !== "all"
            ? "No registrations found matching your filters."
            : "No registrations found."}
        </div>
      )}
    </div>
  );
}
