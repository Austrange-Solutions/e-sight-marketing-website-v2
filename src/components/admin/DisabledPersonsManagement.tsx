"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DisabledPerson {
  _id: string;
  fullName: string;
  email: string;
  aadharNumber?: string;
  phone: string;
  guardianName?: string;
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

    const matchesStatus =
      statusFilter === "all" || person.verificationStatus === statusFilter;

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
      acc[person.verificationStatus] =
        (acc[person.verificationStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Disabled Persons Registration
          </h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <Card className="p-3">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-sm">Total</CardTitle>
                  </div>
                  <Badge variant="default">All</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl font-semibold">{persons.length}</div>
                <CardDescription className="mt-1">
                  All registered disabled persons
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <CardTitle className="text-sm">Pending</CardTitle>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl font-semibold text-yellow-800">
                  {statusCounts.pending || 0}
                </div>
                <CardDescription className="mt-1">
                  Awaiting admin review
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-yellow-600" />
                    <CardTitle className="text-sm">Under Review</CardTitle>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl font-semibold text-yellow-800">
                  {statusCounts.under_review || 0}
                </div>
                <CardDescription className="mt-1">
                  Being evaluated by admin
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-sm">Verified</CardTitle>
                  </div>
                  <Badge variant="default">Good</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl font-semibold text-green-800">
                  {statusCounts.verified || 0}
                </div>
                <CardDescription className="mt-1">
                  Approved registrations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-sm">Rejected</CardTitle>
                  </div>
                  <Badge variant="destructive">Alert</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl font-semibold text-red-800">
                  {statusCounts.rejected || 0}
                </div>
                <CardDescription className="mt-1">
                  Rejected registrations
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={async () => {
              try {
                const res = await fetch(
                  "/api/admin/disabled-persons/export?format=csv"
                );
                if (!res.ok) throw new Error("Export failed");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                // Validate blob URL format (blob URLs are safe)
                if (url.startsWith("blob:") && URL.canParse(url)) {
                  a.href = url;
                  a.download = `disabled-people-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.csv`;
                  // deepcode ignore DOMXSS: Blob URL validated with startsWith('blob:') and URL.canParse() checks
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert("Failed to export CSV");
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>

          <button
            onClick={async () => {
              try {
                const res = await fetch(
                  "/api/admin/disabled-persons/export?format=xlsx"
                );
                if (!res.ok) throw new Error("Export failed");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                // Validate blob URL format (blob URLs are safe)
                if (url.startsWith("blob:") && URL.canParse(url)) {
                  a.href = url;
                  a.download = `disabled-people-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.xlsx`;
                  // deepcode ignore DOMXSS: Blob URL validated with startsWith('blob:') and URL.canParse() checks
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert("Failed to export XLSX");
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
          >
            Export Excel
          </button>
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
                <p className="text-sm text-gray-600 break-all">
                  {person.email}
                </p>
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
              {person.aadharNumber && (
                <p className="text-xs text-gray-500">
                  Aadhaar: {person.aadharNumber}
                </p>
              )}
              {person.guardianName && (
                <p className="text-xs text-gray-500">
                  Guardian: {person.guardianName}
                </p>
              )}
              <p>
                Registered: {new Date(person.createdAt).toLocaleDateString()}
              </p>
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
                  <div className="text-sm font-medium text-gray-900">
                    {person.fullName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{person.email}</div>
                  <div className="text-xs text-gray-500">{person.phone}</div>
                  {person.aadharNumber && (
                    <div className="text-xs text-gray-500">
                      Aadhaar: {person.aadharNumber}
                    </div>
                  )}
                  {person.guardianName && (
                    <div className="text-xs text-gray-500">
                      Guardian: {person.guardianName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {person.disabilityType}
                  </div>
                  <div className="text-xs text-gray-500">
                    {person.disabilityPercentage}%
                  </div>
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
