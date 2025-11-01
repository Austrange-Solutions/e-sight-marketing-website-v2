'use client';
import React, { useState, useEffect } from 'react';
import { X, Eye, FileText, Image as ImageIcon, Download } from 'lucide-react';

interface FileViewerProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  onView?: () => void;
  disableDownload?: boolean;
}

const FileViewer: React.FC<FileViewerProps> = ({
  fileUrl,
  fileType,
  fileName,
  isOpen,
  onClose,
  onView,
  disableDownload = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && onView) {
      onView();
    }
  }, [isOpen, onView]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderFileContent = () => {
    const lowerFileType = fileType.toLowerCase();

    // PDF files
    if (lowerFileType === 'pdf' || lowerFileType === 'application/pdf') {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          className="w-full h-full border-0"
          title={fileName}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load PDF');
          }}
        />
      );
    }

    // Image files
    if (
      lowerFileType.includes('image') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(lowerFileType)
    ) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load image');
            }}
            onContextMenu={(e) => disableDownload && e.preventDefault()}
          />
        </div>
      );
    }

    // Office documents (Word, Excel, PowerPoint)
    if (
      ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(lowerFileType) ||
      lowerFileType.includes('word') ||
      lowerFileType.includes('excel') ||
      lowerFileType.includes('powerpoint') ||
      lowerFileType.includes('spreadsheet') ||
      lowerFileType.includes('presentation')
    ) {
      // Use Microsoft Office Online Viewer
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return (
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title={fileName}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load document. Try downloading it instead.');
          }}
        />
      );
    }

    // Text files
    if (
      lowerFileType === 'txt' ||
      lowerFileType === 'text/plain' ||
      lowerFileType.includes('text')
    ) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0 bg-white dark:bg-gray-900"
          title={fileName}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load text file');
          }}
        />
      );
    }

    // Unsupported file type
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview not available
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <p className="text-xs text-gray-400">File type: {fileType}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full h-full max-w-7xl max-h-[95vh] m-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {fileName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="text-center text-red-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Error Loading File</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {renderFileContent()}
        </div>

        {/* Footer - View Only Notice */}
        {disableDownload && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              🔒 View Only Mode - Downloads are disabled for public viewing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
