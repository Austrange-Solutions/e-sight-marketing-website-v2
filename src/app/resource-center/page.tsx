'use client';
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import FileViewer from '@/components/resources/FileViewer';

interface Resource {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  viewCount: number;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  'annual-reports': 'Annual Reports',
  'project-reports': 'Project Reports',
  'documents': 'Documents',
};

const categoryColors: Record<string, string> = {
  'annual-reports': 'bg-[#1B9BD8] text-white',
  'project-reports': 'bg-emerald-500 text-white',
  'documents': 'bg-purple-500 text-white',
};

const ResourceCenterPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources?limit=100');
      const data = await response.json();

      if (data.success) {
        setResources(data.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResource = async (resource: Resource) => {
    setSelectedResource(resource);
    setViewerOpen(true);

    try {
      await fetch(`/api/resources/${resource._id}`);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Simple Clean Design */}
      <div className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0C5277]">
              Resource Center
            </h1>
            <p className="text-lg text-[#1B9BD8] max-w-3xl mx-auto">
              Access our comprehensive collection of reports, documents, and resources
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-[#1B9BD8] border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-[#1B9BD8] text-lg font-medium">Loading resources...</p>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-32">
            <FileText className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#0C5277] mb-3">
              No resources found
            </h3>
            <p className="text-[#1B9BD8] text-lg">
              Resources will appear here once uploaded
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Document Preview - First Page View */}
                <div
                  className="relative w-full h-[400px] bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => handleViewResource(resource)}
                >
                  {resource.fileType.startsWith('image/') ? (
                    <img
                      src={resource.fileUrl}
                      alt={resource.title}
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : resource.fileType.toLowerCase().includes('pdf') ? (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <div className="text-center p-8">
                        <FileText className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 font-medium">PDF Document</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <div className="text-center p-8">
                        <FileText className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 font-medium uppercase">
                          {resource.fileType.split('/')[1] || 'Document'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Info */}
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-[#0C5277] mb-3 line-clamp-2 min-h-14">
                    {resource.title}
                  </h3>

                  <button
                    onClick={() => handleViewResource(resource)}
                    className="px-8 py-2.5 bg-[#1B9BD8] hover:bg-[#0C5277] text-white font-semibold rounded transition-colors duration-200 uppercase text-sm tracking-wide"
                  >
                    VIEW 
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {selectedResource && (
        <FileViewer
          fileUrl={selectedResource.fileUrl}
          fileType={selectedResource.fileType}
          fileName={selectedResource.title}
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedResource(null);
          }}
          disableDownload={true}
        />
      )}
    </div>
  );
};

export default ResourceCenterPage;
