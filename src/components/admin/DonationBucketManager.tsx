"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Package } from "lucide-react";

interface Foundation {
  _id: string;
  foundationName: string;
  code: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface BucketProduct {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Bucket {
  _id: string;
  name: string;
  description?: string;
  foundation?: {
    _id: string;
    foundationName: string;
    code: string;
  };
  products: BucketProduct[];
  totalPrice: number;
  bucketQuantity: number;
  totalBucketValue: number;
  poolAllocationPercent: number;
  bucketFillPercent: number;
  isActive: boolean;
  createdBy: { username: string };
  createdAt: string;
}

export default function DonationBucketManager() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    foundation: "", // Optional
    bucketQuantity: 1,
    poolAllocationPercent: 0,
    bucketFillPercent: 100,
    isActive: true,
  });

  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ productId: string; quantity: number }>
  >([]);

  useEffect(() => {
    fetchBuckets();
    fetchFoundations();
    fetchProducts();
  }, []);

  const fetchBuckets = async () => {
    try {
      const response = await fetch("/api/admin/donation-buckets");
      const data = await response.json();
      if (data.success) {
        setBuckets(data.buckets);
      }
    } catch (error) {
      console.error("Error fetching buckets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoundations = async () => {
    try {
      const response = await fetch("/api/foundations");
      const data = await response.json();
      if (data.success) {
        setFoundations(data.foundations.filter((f: Foundation) => f.code !== "general"));
      }
    } catch (error) {
      console.error("Error fetching foundations:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch all products (set high limit)
      const response = await fetch("/api/products?limit=1000");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: "", quantity: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, sp) => {
      const product = products.find((p) => p._id === sp.productId);
      if (product) {
        return total + product.price * sp.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || selectedProducts.length === 0) {
      alert("Please fill bucket name and add at least one product");
      return;
    }

    if (selectedProducts.some((p) => !p.productId || p.quantity < 1)) {
      alert("Please select products and set valid quantities");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        foundation: formData.foundation || undefined,
        bucketQuantity: formData.bucketQuantity,
        poolAllocationPercent: formData.poolAllocationPercent,
        bucketFillPercent: formData.bucketFillPercent,
        isActive: formData.isActive,
        products: selectedProducts,
      };

      const url = editingId
        ? `/api/admin/donation-buckets/${editingId}`
        : "/api/admin/donation-buckets";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? "Bucket updated successfully!" : "Bucket created successfully!");
        setShowForm(false);
        resetForm();
        fetchBuckets();
      } else {
        alert(data.message || "Failed to save bucket");
      }
    } catch (error) {
      console.error("Error saving bucket:", error);
      alert("Failed to save bucket");
    }
  };

  const handleEdit = (bucket: Bucket) => {
    setEditingId(bucket._id);
    setFormData({
      name: bucket.name,
      description: bucket.description || "",
      foundation: bucket.foundation?._id || "",
      bucketQuantity: bucket.bucketQuantity,
      poolAllocationPercent: (bucket as any).poolAllocationPercent || 0,
      bucketFillPercent: (bucket as any).bucketFillPercent || 100,
      isActive: bucket.isActive,
    });
    setSelectedProducts(
      bucket.products.map((p) => ({
        productId: p.productId as any,
        quantity: p.quantity,
      }))
    );
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bucket?")) return;

    try {
      const response = await fetch(`/api/admin/donation-buckets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Bucket deleted successfully!");
        fetchBuckets();
      } else {
        alert(data.message || "Failed to delete bucket");
      }
    } catch (error) {
      console.error("Error deleting bucket:", error);
      alert("Failed to delete bucket");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/donation-buckets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (data.success) {
        fetchBuckets();
      }
    } catch (error) {
      console.error("Error updating bucket:", error);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      description: "", 
      foundation: "", 
      bucketQuantity: 1,
      poolAllocationPercent: 0,
      bucketFillPercent: 100,
      isActive: true,
    });
    setSelectedProducts([]);
    setEditingId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center p-8">Loading buckets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Buckets</h2>
          <p className="text-sm text-gray-600">Create product bundles for donation distribution</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.70_0.15_160)] text-[oklch(1_0_0)] rounded-lg hover:bg-[oklch(0.65_0.15_160)] transition"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Create Bucket"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[oklch(0.70_0.15_160)]">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Bucket" : "Create New Bucket"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bucket Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Vision Care Package A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foundation (Optional)
                </label>
                <select
                  value={formData.foundation}
                  onChange={(e) => setFormData({ ...formData, foundation: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">No Foundation (Pool-based)</option>
                  {foundations.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.foundationName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Leave empty to receive from total donation pool</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={2}
                placeholder="Brief description of this bucket"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Buckets *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.bucketQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, bucketQuantity: parseInt(e.target.value) || 1 })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pool Allocation %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.poolAllocationPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, poolAllocationPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">% of total pool for this bucket</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bucket Fill %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.bucketFillPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, bucketFillPercent: parseFloat(e.target.value) || 100 })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">% of bucket value from pool</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[oklch(0.96_0.015_230)] rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Enable this bucket to receive donations)
              </label>
            </div>

            {/* Products Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Products in Bucket *
                </label>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="text-sm text-[oklch(0.70_0.15_160)] hover:text-[oklch(0.65_0.15_160)] flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No products added yet</p>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="mt-2 text-sm text-[oklch(0.70_0.15_160)] hover:text-[oklch(0.65_0.15_160)]"
                  >
                    Add your first product
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map((sp, index) => {
                    const product = products.find((p) => p._id === sp.productId);
                    const subtotal = product ? product.price * sp.quantity : 0;

                    return (
                      <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={sp.productId}
                            onChange={(e) =>
                              handleProductChange(index, "productId", e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 mb-2"
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} - {formatCurrency(p.price)} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-32">
                          <input
                            type="number"
                            min="1"
                            value={sp.quantity}
                            onChange={(e) =>
                              handleProductChange(index, "quantity", parseInt(e.target.value) || 1)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Qty"
                            required
                          />
                        </div>

                        <div className="w-32 flex items-center justify-end">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Summary */}
            {selectedProducts.length > 0 && (
              <div className="bg-[oklch(0.97_0.01_160)] rounded-lg p-4 border border-[oklch(0.85_0.04_160)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Price per Bucket:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Total Value ({formData.bucketQuantity} buckets):
                  </span>
                  <span className="text-xl font-bold text-[oklch(0.70_0.15_160)]">
                    {formatCurrency(calculateTotalPrice() * formData.bucketQuantity)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-[oklch(0.70_0.15_160)] text-[oklch(1_0_0)] rounded-lg hover:bg-[oklch(0.65_0.15_160)] transition"
              >
                <Save className="w-5 h-5" />
                {editingId ? "Update Bucket" : "Create Bucket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buckets List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">All Buckets ({buckets.length})</h3>
        </div>

        {buckets.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No donation buckets created yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-[oklch(0.70_0.15_160)] hover:text-[oklch(0.65_0.15_160)] text-sm font-medium"
            >
              Create your first bucket
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {buckets.map((bucket) => (
              <div key={bucket._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg text-gray-900">{bucket.name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bucket.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {bucket.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {bucket.description && (
                      <p className="text-sm text-gray-600 mb-2">{bucket.description}</p>
                    )}

                    <div className="text-sm text-gray-600 mb-3">
                      {bucket.foundation ? (
                        <>
                          <span className="font-medium">{bucket.foundation.foundationName}</span>
                          {" • "}
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-purple-600">Pool-based</span>
                          {" • "}
                        </>
                      )}
                      Created by {bucket.createdBy.username}
                    </div>

                    {/* Allocation Info */}
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-[oklch(0.96_0.015_230)] text-[oklch(0.65_0.14_230)] rounded-full">
                        Pool: {bucket.poolAllocationPercent}%
                      </span>
                      <span className="px-2 py-1 text-xs bg-[oklch(0.95_0.02_160)] text-[oklch(0.70_0.15_160)] rounded-full">
                        Fill: {bucket.bucketFillPercent}%
                      </span>
                    </div>

                    {/* Products in Bucket */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Products:</p>
                      <div className="space-y-1">
                        {bucket.products.map((p, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {p.quantity}x {p.productName}
                            </span>
                            <span className="text-gray-600">{formatCurrency(p.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Price per Bucket: </span>
                        <span className="font-semibold">{formatCurrency(bucket.totalPrice)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity: </span>
                        <span className="font-semibold">{bucket.bucketQuantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Value: </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(bucket.totalBucketValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(bucket._id, bucket.isActive)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        bucket.isActive
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {bucket.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(bucket)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bucket._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
