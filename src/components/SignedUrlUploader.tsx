import React, { useState } from 'react';
import Image from 'next/image';

interface SignedUrlUploaderProps {
  onUploadComplete?: (url: string) => void;
  onError?: (error: string) => void;
}

const SignedUrlUploader: React.FC<SignedUrlUploaderProps> = ({
  onUploadComplete,
  onError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get signed URL from our API
      console.log('Requesting signed URL for:', file.name);

      const signedUrlResponse = await fetch('/api/aws/signed-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get signed URL');
      }

      const { signedUrl, viewUrl } = await signedUrlResponse.json();
      console.log('Signed URL received:', { signedUrl: signedUrl.substring(0, 100) + '...', viewUrl });

      setUploadProgress(25);

      // Step 2: Upload file directly to S3 using signed URL
      console.log('Uploading file to S3...');

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      setUploadProgress(75);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      setUploadProgress(100);
      setUploadedUrl(viewUrl);

      console.log('File uploaded successfully:', viewUrl);
      onUploadComplete?.(viewUrl);

    } catch (error: unknown) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload with Signed URL</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image File
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Uploading... {uploadProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadedUrl && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-600">
              ✅ Upload successful!
            </div>
            <Image
              src={uploadedUrl}
              alt="Uploaded"
              width={400}
              height={128}
              className="w-full h-32 object-cover rounded-md border"
            />
            <div className="text-xs text-gray-500 break-all">
              {uploadedUrl}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignedUrlUploader;