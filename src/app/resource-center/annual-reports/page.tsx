"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, Image as ImageIcon } from "lucide-react";
import FileViewer from "@/components/resources/FileViewer";

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

const AnnualReportsPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/resources?category=annual-reports&limit=100"
      );
      const data = await response.json();

      if (data.success) {
        setResources(data.data);
      }
    } catch (error) {
      console.error("Error fetching annual reports:", error);
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
      console.error("Error tracking view:", error);
    }
  };

  // Group resources by year
  const resourcesByYear = resources.reduce(
    (acc: Record<number, Resource[]>, resource) => {
      const year = new Date(resource.createdAt).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(resource);
      return acc;
    },
    {}
  );

  const years = Object.keys(resourcesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/resource-center"
            className="inline-flex items-center gap-2 text-[#1B9BD8] hover:text-[#0C5277] mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resource Center
          </Link>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0C5277]">
              Annual Reports
            </h1>
            <p className="text-lg text-[#1B9BD8] max-w-3xl mx-auto">
              View our yearly impact reports and financial summaries
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Reports by Year */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading reports...
              </p>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No reports found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Annual reports will appear here once uploaded
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {year}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resourcesByYear[year].map((resource) => (
                    <div
                      key={resource._id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                    >
                      {/* Document Preview */}
                      <div
                        className="relative w-full h-[400px] bg-gray-50 overflow-hidden cursor-pointer"
                        onClick={() => handleViewResource(resource)}
                      >
                        {resource.fileType.startsWith("image/") ? (
                          <Image
                            src={resource.fileUrl}
                            alt={resource.title}
                            fill
                            className="object-contain bg-white"
                          />
                        ) : resource.fileType.toLowerCase().includes("pdf") ? (
                          <div className="w-full h-full flex items-center justify-center bg-white">
                            <div className="text-center p-8">
                              <FileText className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-gray-500 font-medium">
                                PDF Document
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white">
                            <div className="text-center p-8">
                              <FileText className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-gray-500 font-medium uppercase">
                                {resource.fileType.split("/")[1] || "Document"}
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
                          VIEW MORE
                        </button>
                      </div>
                    </div>
                  ))}
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

export default AnnualReportsPage;
