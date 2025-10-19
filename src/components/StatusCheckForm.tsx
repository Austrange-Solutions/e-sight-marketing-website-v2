"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RegistrationStatus {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  disabilityType: string;
  disabilityPercentage: number;
  verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  createdAt: string;
  updatedAt: string;
  verificationHistory: Array<{
    status: string;
    updatedBy: string;
    updatedAt: string;
    comments?: string;
  }>;
}

export default function StatusCheckForm() {
  const [searchType, setSearchType] = useState<"email" | "registrationId">("email");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus(null);

    if (!searchValue.trim()) {
      setError("Please enter a search value");
      return;
    }

    if (searchType === "email" && !searchValue.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchType === "email") {
        params.append("email", searchValue);
      } else {
        params.append("id", searchValue);
      }

      const response = await fetch(`/api/disabled-registration/status?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch status");
      }

      setStatus(data.registration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch registration status");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Your Registration</CardTitle>
          <CardDescription>
            Enter your registration ID or email address to check the status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Selection */}
            <div className="space-y-2">
              <Label>Search By</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="email"
                    checked={searchType === "email"}
                    onChange={(e) => setSearchType(e.target.value as "email")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Email Address</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="registrationId"
                    checked={searchType === "registrationId"}
                    onChange={(e) => setSearchType(e.target.value as "registrationId")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Registration ID</span>
                </label>
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">
                {searchType === "email" ? "Email Address" : "Registration ID"}
              </Label>
              <Input
                id="search"
                type={searchType === "email" ? "email" : "text"}
                placeholder={
                  searchType === "email"
                    ? "Enter your email address"
                    : "Enter your registration ID"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                required
                aria-required="true"
                aria-label={searchType === "email" ? "Email Address" : "Registration ID"}
              />
            </div>

            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Searching..." : "Check Status"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Status Display */}
      {status && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>ID: {status._id}</CardDescription>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  status.verificationStatus
                )}`}
              >
                {getStatusLabel(status.verificationStatus)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-sm text-gray-900 mt-1">{status.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900 mt-1">{status.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900 mt-1">{status.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Disability Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{status.disabilityType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Disability Percentage</dt>
                  <dd className="text-sm text-gray-900 mt-1">{status.disabilityPercentage}%</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {new Date(status.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Status History */}
            {status.verificationHistory && status.verificationHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status History</h3>
                <div className="space-y-3">
                  {status.verificationHistory.map((history, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded-r-md"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            history.status
                          )}`}
                        >
                          {getStatusLabel(history.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.updatedAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Updated by: {history.updatedBy}</p>
                      {history.comments && (
                        <p className="text-sm text-gray-700 mt-1 italic">{history.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Message */}
            {status.verificationStatus === "verified" && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">
                  <strong>Congratulations!</strong> Your registration has been verified. You will
                  receive further instructions via email.
                </p>
              </div>
            )}
            {status.verificationStatus === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">
                  <strong>Action Required:</strong> Your application requires attention. Please
                  check your email for details and next steps.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
