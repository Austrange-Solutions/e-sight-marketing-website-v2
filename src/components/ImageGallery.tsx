"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Trash2,
  Edit,
  Eye,
  Download,
  Tag,
  Calendar,
  FileImage,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { isValidUrl, sanitizeUrl } from "@/lib/validation";

interface UploadedImage {
  _id: string;
  filename: string;
  originalName: string;
  s3Key: string;
  cloudFrontUrl: string;
  s3Url: string;
  fileSize: number;
  fileType: string;
  width?: number;
  height?: number;
  uploadMethod: "direct" | "signed-url";
  tags: string[];
  description?: string;
  altText?: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  isActive: boolean;
  etag?: string;
  fileSizeFormatted: string;
  uploadedAgo: string;
}

interface ImageGalleryProps {
  showSearch?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  limit?: number;
  onImageSelect?: (image: UploadedImage) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  showSearch = true,
  showFilters = true,
  showStats = true,
  limit = 20,
  onImageSelect,
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Pagination info
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Edit modal state
  const [editingImage, setEditingImage] = useState<UploadedImage | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    altText: "",
    tags: "",
  });

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (fileTypeFilter) params.append("fileType", fileTypeFilter);

      const response = await fetch(`/api/images?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();

      if (data.success) {
        setImages(data.data);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.error || "Failed to fetch images");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch images");
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, searchTerm, fileTypeFilter, sortBy, sortOrder]);

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setImages(images.filter((img) => img._id !== imageId));
        setSelectedImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
      } else {
        const error = await response.json();
        alert(`Failed to delete image: ${error.error}`);
      }
    } catch (err) {
      alert("Failed to delete image");
      console.error("Delete error:", err);
    }
  };

  const handleEditImage = (image: UploadedImage) => {
    setEditingImage(image);
    setEditForm({
      description: image.description || "",
      altText: image.altText || "",
      tags: image.tags.join(", "),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      const response = await fetch(`/api/images/${editingImage._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: editForm.description,
          altText: editForm.altText,
          tags: editForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setImages(
          images.map((img) =>
            img._id === editingImage._id ? result.data : img
          )
        );
        setEditingImage(null);
      } else {
        const error = await response.json();
        alert(`Failed to update image: ${error.error}`);
      }
    } catch (err) {
      alert("Failed to update image");
      console.error("Update error:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    if (!confirm(`Delete ${selectedImages.size} selected images?`)) return;

    try {
      const response = await fetch(
        `/api/images?ids=${Array.from(selectedImages).join(",")}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setImages(images.filter((img) => !selectedImages.has(img._id)));
        setSelectedImages(new Set());
      } else {
        const error = await response.json();
        alert(`Failed to delete images: ${error.error}`);
      }
    } catch (err) {
      alert("Failed to delete images");
      console.error("Bulk delete error:", err);
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllImages = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img) => img._id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span>Loading images...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
        <button
          onClick={fetchImages}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          {showSearch && (
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          )}

          {showFilters && (
            <div className="flex items-center space-x-4">
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/gif">GIF</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="uploadedAt">Upload Date</option>
                <option value="filename">Filename</option>
                <option value="fileSize">File Size</option>
                <option value="fileType">File Type</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedImages.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">
              {selectedImages.size} image(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedImages(new Set())}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FileImage className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {totalCount} total images
                </span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedImages.size === images.length && images.length > 0
                  }
                  onChange={selectAllImages}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
            <button
              onClick={fetchImages}
              className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No images found
          </h3>
          <p className="text-gray-500">Upload some images to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                selectedImages.has(image._id) ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Image Preview */}
              <div className="relative">
                <Image
                  src={image.cloudFrontUrl}
                  alt={image.altText || image.originalName}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => onImageSelect?.(image)}
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image._id)}
                    onChange={() => toggleImageSelection(image._id)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => {
                      const safeUrl = sanitizeUrl(image.cloudFrontUrl);
                      if (safeUrl !== "#") {
                        // deepcode ignore OR: URL validated via sanitizeUrl against CloudFront/S3 allowlist
                        window.open(safeUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                    title="View Full Size"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {/* deepcode ignore DOMXSS: URL validated via sanitizeUrl which checks against CloudFront/S3 allowlist */}
                  <a
                    href={sanitizeUrl(image.cloudFrontUrl)}
                    download={image.originalName}
                    onClick={(e) => {
                      if (sanitizeUrl(image.cloudFrontUrl) === "#") {
                        e.preventDefault();
                      }
                    }}
                    className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {image.originalName}
                  </h3>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEditImage(image)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {image.uploadedAgo}
                  </div>
                  <div>{image.fileSizeFormatted}</div>
                  <div>{image.fileType.split("/")[1].toUpperCase()}</div>
                  {image.width && image.height && (
                    <div>
                      {image.width} × {image.height}px
                    </div>
                  )}
                </div>

                {image.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {image.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{image.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {image.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {image.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Edit Image</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editForm.altText}
                  onChange={(e) =>
                    setEditForm({ ...editForm, altText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tags: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingImage(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
