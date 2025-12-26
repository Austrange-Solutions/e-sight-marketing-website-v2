// Example usage for the updated CloudFront system

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl, uploadFileToS3 } from '@/lib/aws-utils';

// Example 1: Display image with CloudFront URL
function ProductImage({ imageKey }: { imageKey: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      // imageKey can be either:
      // - Just filename: "Maceazy-basic.png" 
      // - Full path: "Maceazy-ecommerce-product-images/Maceazy-basic.png"
      // The API will handle both correctly
      
      const url = await getImageUrl(imageKey);
      setImageUrl(url);
      setLoading(false);
    };

    if (imageKey) {
      loadImage();
    }
  }, [imageKey]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 w-full h-48"></div>;
  }

  if (!imageUrl) {
    return <div className="bg-gray-100 w-full h-48">Image not found</div>;
  }

  return (
    <Image 
      src={imageUrl} 
      alt="Product" 
      width={400}
      height={192}
      className="w-full h-48 object-cover"
    />
  );
}

// Example 2: Test component to verify URLs
function CloudFrontTest() {
  const [testResults, setTestResults] = useState<Array<{name: string; key: string; url: string; status: string}>>([]);

  const testUrls = async () => {
    const tests = [
      { name: 'Just filename', key: 'Maceazy-basic.png' },
      { name: 'Full path', key: 'Maceazy-ecommerce-product-images/Maceazy-basic.png' },
    ];

    const results = [];
    for (const test of tests) {
      try {
        const response = await fetch(`/api/aws?key_data=${test.key}`);
        const data = await response.json();
        results.push({
          ...test,
          url: data.url,
          status: 'success'
        });
      } catch (error) {
        results.push({
          ...test,
          url: '',
          status: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setTestResults(results);
  };

  return (
    <div className="p-4">
      <button 
        onClick={testUrls}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test CloudFront URLs
      </button>
      
      {testResults.map((result, index) => (
        <div key={index} className="mt-4 p-3 border rounded">
          <h3 className="font-bold">{result.name}</h3>
          <p><strong>Input:</strong> {result.key}</p>
          {result.status === 'success' ? (
            <>
              <p><strong>Generated URL:</strong> {result.url}</p>
              <p className="text-green-600">✅ Should be: https://dw9tsoyfcyk5k.cloudfront.net/Maceazy-ecommerce-product-images/Maceazy-basic.png</p>
            </>
          ) : (
            <p className="text-red-600">❌ Error: {result.status}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Example 3: File upload with CloudFront URL
function FileUploadExample() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const cloudFrontUrl = await uploadFileToS3(file);
      setUploadedUrl(cloudFrontUrl);
      console.log('File uploaded and available at:', cloudFrontUrl);
      // This URL can be saved directly to MongoDB
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      
      {uploadedUrl && (
        <div className="mt-4">
          <p>Uploaded successfully!</p>
          <p><strong>CloudFront URL:</strong> {uploadedUrl}</p>
          <Image src={uploadedUrl} alt="Uploaded" width={300} height={200} className="mt-2 max-w-xs" />
        </div>
      )}
    </div>
  );
}

export { ProductImage, CloudFrontTest, FileUploadExample };
