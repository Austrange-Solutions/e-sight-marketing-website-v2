'use client';

import { useState } from 'react';

interface UploadResult {
  success: boolean;
  viewUrl: string;
  filename: string;
  s3Key: string;
  size: number;
  type: string;
  etag: string;
}

interface FileUploadFormProps {
  onUploadComplete?: (url: string) => void;
  onError?: (error: string) => void;
}

export default function FileUploadForm({ onUploadComplete, onError }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/aws/upload', {
        method: 'POST',
        body: formData, // No need to set Content-Type, browser will set it automatically with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
      setFile(null); // Clear the file input
      
      console.log('Upload successful:', data);
      onUploadComplete?.(data.viewUrl);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

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
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload to AWS S3</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop Area */}
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
          {file ? (
            <div>
              <p className="text-sm text-gray-600">Selected file:</p>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Drag & drop your file here, or</p>
              <label className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          type="submit"
          disabled={!file || uploading}
          className={`w-full py-2 px-4 rounded font-medium ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload to S3'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium mb-2">Upload Successful! 🎉</p>
          
          <div className="space-y-2 text-sm">
            <p><strong>CloudFront URL:</strong></p>
            <p className="break-all text-blue-600">{result.viewUrl}</p>
            
            <p><strong>Filename:</strong> {result.filename}</p>
            <p><strong>Size:</strong> {(result.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {result.type}</p>
          </div>

          {/* Image Preview */}
          {result.type.startsWith('image/') && (
            <div className="mt-3">
              <p className="font-medium mb-2">Preview:</p>
              <img 
                src={result.viewUrl} 
                alt="Uploaded" 
                className="max-w-full h-48 object-cover rounded border"
              />
            </div>
          )}

          {/* Copy URL Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(result.viewUrl);
              alert('CloudFront URL copied to clipboard!');
            }}
            className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Copy URL
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Only image files are allowed (JPEG, PNG, WebP, GIF)</li>
          <li>Maximum file size: 5MB</li>
          <li>Files are uploaded directly to AWS S3</li>
          <li>CloudFront URL is returned for fast global access</li>
        </ul>
      </div>
    </div>
  );
}

// Simple usage example
export function SimpleUploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/aws/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Upload successful:', result.viewUrl);
        // Save result.viewUrl to your database
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button 
        onClick={uploadFile}
        disabled={!selectedFile}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Upload
      </button>
    </div>
  );
}