'use client';

import { useState } from 'react';
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SimpleUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function SimpleS3Uploader({ 
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = ''
}: SimpleUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => acceptedTypes.includes(file.type));
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (validFiles.length !== newFiles.length) {
      setError('Some files were skipped due to invalid type.');
    } else if (filesToAdd.length !== validFiles.length) {
      setError(`Only ${remainingSlots} more files can be added.`);
    } else {
      setError(null);
    }

    setFiles(prev => [...prev, ...filesToAdd]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploaded: UploadedFile[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/aws/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        uploaded.push({
          name: result.filename,
          url: result.viewUrl,
          size: file.size,
          type: file.type,
        });
      }

      setUploadedFiles(prev => [...prev, ...uploaded]);
      setFiles([]);

      // Call the callback with uploaded URLs
      if (onUploadComplete) {
        onUploadComplete(uploaded.map(f => f.url));
      }

    } catch (error: unknown) {
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drag files here or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {acceptedTypes.join(', ').replace(/image\//g, '').toUpperCase()} • Max {maxFiles} files
        </p>
        
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="simple-file-input"
        />
        <label
          htmlFor="simple-file-input"
          className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Choose Files
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </span>
            ) : (
              `Upload ${files.length} File${files.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-green-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-green-700 break-all">
                  {file.url}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Example usage component
export function UploadExample() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(prev => [...prev, ...urls]);
    console.log('New files uploaded:', urls);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Simple S3 Upload</h2>
      
      <SimpleS3Uploader
        onUploadComplete={handleUploadComplete}
        maxFiles={3}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      />

      {uploadedUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">All Uploaded URLs:</h3>
          <div className="space-y-1">
            {uploadedUrls.map((url, index) => (
              <code key={index} className="block text-xs bg-gray-100 p-2 rounded break-all">
                {url}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}