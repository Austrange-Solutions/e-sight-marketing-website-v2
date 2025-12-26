'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageGallery from '@/components/ImageGallery';
import FileUploadForm from '@/components/FileUploadForm';
import SignedUrlUploader from '@/components/SignedUrlUploader';
import { 
  Upload, 
  Images, 
  BarChart3, 
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database
} from 'lucide-react';

interface Stats {
  overview: {
    totalFiles: number;
    totalSize: number;
    avgSize: number;
    maxSize: number;
    minSize: number;
  };
  fileTypes: Array<{
    _id: string;
    count: number;
    totalSize: number;
    avgSize: number;
  }>;
  recentUploads: Array<{
    _id: string;
    filename: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    cloudFrontUrl: string;
  }>;
  uploadTrends: Array<{
    date: string;
    count: number;
    totalSize: number;
  }>;
}

export default function ImageManagementPage() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/images/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadComplete = (url: string) => {
    showNotification('success', 'Image uploaded and saved successfully!');
    fetchStats(); // Refresh stats
  };

  const handleUploadError = (error: string) => {
    showNotification('error', `Upload failed: ${error}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'gallery', label: 'Image Gallery', icon: Images },
    { id: 'upload', label: 'Upload Images', icon: Upload },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Image Management</h1>
            </div>
            
            {stats && (
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Images className="w-4 h-4 mr-1" />
                  {stats.overview.totalFiles} images
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {formatFileSize(stats.overview.totalSize)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`flex items-center p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'gallery' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Image Gallery</h2>
              <p className="text-gray-600">
                Manage your uploaded images with search, filter, and bulk operations.
              </p>
            </div>
            <ImageGallery 
              showSearch={true}
              showFilters={true}
              showStats={true}
              limit={24}
              onImageSelect={(image) => {
                console.log('Selected image:', image);
                // You can implement image preview/details modal here
              }}
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Images</h2>
              <p className="text-gray-600 mb-6">
                Upload images to AWS S3 with CloudFront CDN integration. Images are automatically saved to the database.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Method 1: Direct Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Direct Upload
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload files directly through your server to AWS S3.
                </p>
                <FileUploadForm 
                  onUploadComplete={handleUploadComplete}
                  onError={handleUploadError}
                />
              </div>

              {/* Method 2: Signed URL Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Signed URL Upload
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate signed URLs for direct upload to AWS S3 (more reliable).
                </p>
                <SignedUrlUploader 
                  onUploadComplete={handleUploadComplete}
                  onError={handleUploadError}
                />
              </div>
            </div>

            {/* Upload Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-blue-900 mb-3">Upload Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Supported formats: JPEG, PNG, WebP, GIF</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Images are automatically optimized and served via CloudFront CDN</li>
                <li>• All uploads are automatically saved to the database with metadata</li>
                <li>• You can add descriptions, alt text, and tags after uploading</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Statistics</h2>
              <p className="text-gray-600">
                Overview of your image uploads and storage usage.
              </p>
            </div>

            {loadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading statistics...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Images className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.overview.totalFiles}
                        </p>
                        <p className="text-sm text-gray-600">Total Images</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Database className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatFileSize(stats.overview.totalSize)}
                        </p>
                        <p className="text-sm text-gray-600">Total Size</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatFileSize(stats.overview.avgSize)}
                        </p>
                        <p className="text-sm text-gray-600">Average Size</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatFileSize(stats.overview.maxSize)}
                        </p>
                        <p className="text-sm text-gray-600">Largest File</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Types */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">File Types</h3>
                  <div className="space-y-4">
                    {stats.fileTypes.map((type) => (
                      <div key={type._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium">
                            {type._id.split('/')[1].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{type.count} files</span>
                          <span>{formatFileSize(type.totalSize)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Uploads */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
                  <div className="space-y-3">
                    {stats.recentUploads.map((upload) => (
                      <div key={upload._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <Image
                          src={upload.cloudFrontUrl}
                          alt={upload.originalName}
                          width={48}
                          height={48}
                          className="object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{upload.originalName}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(upload.fileSize)} • {new Date(upload.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Failed to load statistics</p>
                <button
                  onClick={fetchStats}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">
                Configure your image management preferences.
              </p>
            </div>

            <div className="space-y-6">
              {/* AWS Configuration Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">AWS Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">S3 Bucket</label>
                    <p className="font-mono bg-gray-100 p-2 rounded">austrange-storage</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">S3 Region</label>
                    <p className="font-mono bg-gray-100 p-2 rounded">ap-south-1</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">S3 Prefix</label>
                    <p className="font-mono bg-gray-100 p-2 rounded">e-sight-ecommerce-product-images/</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">CloudFront Domain</label>
                    <p className="font-mono bg-gray-100 p-2 rounded">dw9tsoyfcyk5k.cloudfront.net</p>
                  </div>
                </div>
              </div>

              {/* API Endpoints */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Endpoints</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-mono">GET /api/images</span>
                    <span className="text-gray-600">Fetch all images with filtering</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-mono">POST /api/images</span>
                    <span className="text-gray-600">Save new image record</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-mono">PUT /api/images/[id]</span>
                    <span className="text-gray-600">Update image metadata</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-mono">DELETE /api/images/[id]</span>
                    <span className="text-gray-600">Delete image record</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-mono">GET /api/images/stats</span>
                    <span className="text-gray-600">Get upload statistics</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Refresh Stats
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
                  >
                    <Images className="w-4 h-4 mr-2" />
                    View Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}