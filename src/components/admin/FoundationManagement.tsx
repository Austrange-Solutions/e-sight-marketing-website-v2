"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Power, PowerOff, Upload, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Foundation {
  _id: string;
  foundationName: string;
  code: string;
  foundationSharePercent: number;
  companySharePercent: number;
  platformFeePercent?: number; // Added platform fee
  displayName?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  icon?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  isActive: boolean;
  priority: number;
  minimumDonation?: number;
  stats: {
    totalDonations: number;
    totalAmount: number;
    donorCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_EMOJIS = ["❤️", "💚", "💜", "🧡", "💙", "💛", "🤍", "🖤", "💖", "💗"];

export default function FoundationManagement() {
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    foundationName: "",
    code: "",
    foundationSharePercent: 65,
    companySharePercent: 35,
    platformFeePercent: 10, // Added platform fee
    displayName: "",
    tagline: "",
    description: "",
    logoUrl: "",
    icon: "❤️",
    primaryColor: "#10b981",
    contactEmail: "",
    contactPhone: "",
    website: "",
    isActive: false,
    minimumDonation: 1,
  });

  // Fetch foundations
  const fetchFoundations = async () => {
    try {
      const response = await fetch("/api/admin/foundations");
      if (!response.ok) throw new Error("Failed to fetch foundations");
      const data = await response.json();
      setFoundations(data.foundations || []);
    } catch (error) {
      console.error("Error fetching foundations:", error);
      toast.error("Failed to load foundations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundations();
  }, []);

  // Auto-calculate company share
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      companySharePercent: 100 - prev.foundationSharePercent,
    }));
  }, [formData.foundationSharePercent]);

  // Handle logo upload
  const handleLogoUpload = async (file: File, foundationId?: string) => {
    try {
      const targetId = foundationId || "new";
      setUploadingLogo(targetId);

      // Generate pre-signed URL
      const presignedResponse = await fetch("/api/images/generate-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          folder: "donation-logos",
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || "Failed to generate upload URL");
      }
      const { uploadUrl, key, fileUrl } = await presignedResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload logo");

      // Use the fileUrl returned from API (already has CloudFront domain)
      const logoUrl = fileUrl;

      // Update form or foundation
      if (foundationId) {
        await updateFoundation(foundationId, { logoUrl });
      } else {
        setFormData((prev) => ({ ...prev, logoUrl }));
      }

      toast.success("Logo uploaded successfully");
      return logoUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(null);
    }
  };

  // Create foundation
  const handleCreate = async () => {
    try {
      if (!formData.foundationName) {
        toast.error("Foundation name is required");
        return;
      }

      const response = await fetch("/api/admin/foundations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to create foundation");

      toast.success("Foundation created successfully");
      fetchFoundations();
      resetForm();
    } catch (error: any) {
      console.error("Error creating foundation:", error);
      toast.error(error.message || "Failed to create foundation");
    }
  };

  // Update foundation
  const updateFoundation = async (id: string, updates: Partial<Foundation>) => {
    try {
      const response = await fetch(`/api/admin/foundations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update foundation");

      toast.success("Foundation updated successfully");
      fetchFoundations();
      setEditingId(null);
    } catch (error: any) {
      console.error("Error updating foundation:", error);
      toast.error(error.message || "Failed to update foundation");
    }
  };

  // Delete foundation
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/foundations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete foundation");

      toast.success("Foundation deleted successfully");
      fetchFoundations();
    } catch (error: any) {
      console.error("Error deleting foundation:", error);
      toast.error(error.message || "Failed to delete foundation");
    }
  };

  // Toggle active status
  const toggleActive = async (foundation: Foundation) => {
    await updateFoundation(foundation._id, { isActive: !foundation.isActive });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      foundationName: "",
      code: "",
      foundationSharePercent: 65,
      companySharePercent: 35,
      platformFeePercent: 10, // Added
      displayName: "",
      tagline: "",
      description: "",
      logoUrl: "",
      icon: "❤️",
      primaryColor: "#10b981",
      contactEmail: "",
      contactPhone: "",
      website: "",
      isActive: false,
      minimumDonation: 1,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  // Start editing
  const startEdit = (foundation: Foundation) => {
    setFormData({
      foundationName: foundation.foundationName,
      code: foundation.code,
      foundationSharePercent: foundation.foundationSharePercent,
      companySharePercent: foundation.companySharePercent,
      platformFeePercent: foundation.platformFeePercent || 10, // Added
      displayName: foundation.displayName || "",
      tagline: foundation.tagline || "",
      description: foundation.description || "",
      logoUrl: foundation.logoUrl || "",
      icon: foundation.icon || "❤️",
      primaryColor: foundation.primaryColor || "#10b981",
      contactEmail: foundation.contactEmail || "",
      contactPhone: foundation.contactPhone || "",
      website: foundation.website || "",
      isActive: foundation.isActive,
      minimumDonation: foundation.minimumDonation || 1,
    });
    setEditingId(foundation._id);
    setShowAddForm(false);
  };

  // Save edit
  const saveEdit = async () => {
    if (editingId) {
      await updateFoundation(editingId, formData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Foundation Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, and manage foundations for your donation platform
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Foundation"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? "Edit Foundation" : "Add New Foundation"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foundation Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Foundation Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.foundationName}
                onChange={(e) => setFormData({ ...formData, foundationName: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="e.g., Vishnu Shakti Foundation"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Foundation Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-mono"
                placeholder="vsf, cf, abc (auto-generated if empty)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase letters, numbers, hyphens only. Leave empty for auto-generation.
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Name (Short)
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="VSF, CF (optional)"
              />
            </div>

            {/* Foundation Share % */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Foundation Share (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.foundationSharePercent}
                onChange={(e) =>
                  setFormData({ ...formData, foundationSharePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Foundation receives this % of total donation
              </p>
            </div>

            {/* Company Share % */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Share (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.companySharePercent}
                onChange={(e) =>
                  setFormData({ ...formData, companySharePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-calculated: {100 - formData.foundationSharePercent}%
              </p>
            </div>

            {/* Platform Fee % */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Platform Fee (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.platformFeePercent}
                onChange={(e) =>
                  setFormData({ ...formData, platformFeePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deducted before Foundation/Company split. Example: ₹100 donation → ₹{formData.platformFeePercent} platform fee → ₹{(100 - formData.platformFeePercent).toFixed(2)} split between foundation ({formData.foundationSharePercent}%) and company ({formData.companySharePercent}%)
              </p>
            </div>

            {/* Tagline */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="e.g., Empowering visually impaired individuals"
                maxLength={150}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                rows={3}
                placeholder="Full description of the foundation's mission and work"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Icon/Emoji Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Icon/Emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                      formData.icon === emoji
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-mono"
                  placeholder="#10b981"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Foundation Logo
              </label>
              <div className="flex items-center gap-4">
                {formData.logoUrl && (
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded-lg border border-border"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingLogo === (editingId || "new") ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    disabled={uploadingLogo === (editingId || "new")}
                  />
                </label>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: "" })}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                PNG or JPG, recommended 512x512px
              </p>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="contact@foundation.org"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="https://foundation.org"
              />
            </div>

            {/* Minimum Donation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum Donation (₹)
              </label>
              <input
                type="number"
                min="1"
                value={formData.minimumDonation}
                onChange={(e) => setFormData({ ...formData, minimumDonation: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>

            {/* Active Toggle */}
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-ring"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
                Active (show on donation page)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={editingId ? saveEdit : handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingId ? "Save Changes" : "Create Foundation"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Foundations List */}
      <div className="space-y-4">
        {foundations.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              No foundations found. Click "Add Foundation" to get started.
            </p>
          </div>
        ) : (
          foundations.map((foundation) => (
            <div
              key={foundation._id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Foundation Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo/Icon */}
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl border-2"
                    style={{
                      borderColor: foundation.primaryColor,
                      backgroundColor: `${foundation.primaryColor}15`,
                    }}
                  >
                    {foundation.logoUrl ? (
                      <img
                        src={foundation.logoUrl}
                        alt={foundation.foundationName}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      foundation.icon
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {foundation.foundationName}
                      </h3>
                      <span
                        className="px-2 py-1 text-xs font-mono rounded"
                        style={{
                          backgroundColor: `${foundation.primaryColor}20`,
                          color: foundation.primaryColor,
                        }}
                      >
                        {foundation.code}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          foundation.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {foundation.isActive ? "✅ Active" : "❌ Inactive"}
                      </span>
                    </div>

                    {foundation.tagline && (
                      <p className="text-sm text-muted-foreground mb-2">{foundation.tagline}</p>
                    )}

                    {foundation.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {foundation.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Donations</p>
                        <p className="text-sm font-semibold text-foreground">
                          {foundation.stats.totalDonations}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-sm font-semibold text-foreground">
                          ₹{foundation.stats.totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unique Donors</p>
                        <p className="text-sm font-semibold text-foreground">
                          {foundation.stats.donorCount}
                        </p>
                      </div>
                    </div>

                    {/* Percentage Split */}
                    <div className="flex gap-6 mt-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Foundation: </span>
                        <span className="text-sm font-semibold text-green-600">
                          {foundation.foundationSharePercent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Company: </span>
                        <span className="text-sm font-semibold text-orange-600">
                          {foundation.companySharePercent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Priority: </span>
                        <span className="text-sm font-semibold text-foreground">
                          {foundation.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(foundation)}
                    className={`p-2 rounded-lg transition-colors ${
                      foundation.isActive
                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                    title={foundation.isActive ? "Deactivate" : "Activate"}
                  >
                    {foundation.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(foundation)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(foundation._id, foundation.foundationName)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only <strong>active</strong> foundations appear on the donation page</li>
              <li>Foundation Share % = portion foundation receives from each donation</li>
              <li>Company Share % = remaining portion (auto-calculated: 100 - Foundation Share)</li>
              <li>Priority determines display order (lower number = appears first)</li>
              <li>Foundations with donations cannot be deleted (deactivate instead)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
