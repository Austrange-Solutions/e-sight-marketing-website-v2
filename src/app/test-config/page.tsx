'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string | Record<string, unknown>;
}

export default function AWSConfigTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Environment Variables
    testResults.push({
      test: 'Environment Variables',
      status: 'pending',
      message: 'Checking AWS configuration...'
    });

    // Test 2: GET Request (CloudFront URL)
    testResults.push({
      test: 'GET Request (CloudFront URL)',
      status: 'pending',
      message: 'Testing CloudFront URL generation...'
    });

    // Test 3: POST Request (Upload URL)
    testResults.push({
      test: 'POST Request (Upload URL)', 
      status: 'pending',
      message: 'Testing signed URL generation...'
    });

    // Test 4: Form Upload
    testResults.push({
      test: 'Form Upload',
      status: 'pending',
      message: 'Testing direct file upload...'
    });

    setResults([...testResults]);

    // Run Test 1: Check environment variables via upload endpoint
    try {
      const envResponse = await fetch('/api/aws/upload', {
        method: 'POST',
        body: new FormData() // Empty form data to trigger env check
      });
      
      const envData = await envResponse.json();
      
      if (envData.error?.includes('Missing environment variables')) {
        testResults[0] = {
          test: 'Environment Variables',
          status: 'error',
          message: 'Missing AWS configuration',
          details: envData.details
        };
      } else {
        testResults[0] = {
          test: 'Environment Variables',
          status: 'success',
          message: 'AWS environment variables are configured'
        };
      }
    } catch (error) {
      testResults[0] = {
        test: 'Environment Variables',
        status: 'error',
        message: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setResults([...testResults]);

    // Run Test 2: GET Request
    try {
      const getResponse = await fetch('/api/aws?key_data=test-image.png');
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        testResults[1] = {
          test: 'GET Request (CloudFront URL)',
          status: 'success',
          message: 'CloudFront URL generated successfully',
          details: getData.url
        };
      } else {
        testResults[1] = {
          test: 'GET Request (CloudFront URL)',
          status: 'error',
          message: 'Failed to generate CloudFront URL',
          details: getData.error
        };
      }
    } catch (error) {
      testResults[1] = {
        test: 'GET Request (CloudFront URL)',
        status: 'error',
        message: 'GET request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setResults([...testResults]);

    // Run Test 3: POST Request
    try {
      const postResponse = await fetch('/api/aws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-upload.png',
          contentType: 'image/png'
        })
      });
      
      const postData = await postResponse.json();
      
      if (postResponse.ok) {
        testResults[2] = {
          test: 'POST Request (Upload URL)',
          status: 'success',
          message: 'Signed upload URL generated successfully',
          details: postData
        };
      } else {
        testResults[2] = {
          test: 'POST Request (Upload URL)',
          status: 'error',
          message: 'Failed to generate upload URL',
          details: postData.error
        };
      }
    } catch (error) {
      testResults[2] = {
        test: 'POST Request (Upload URL)',
        status: 'error',
        message: 'POST request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setResults([...testResults]);

    // Run Test 4: Form Upload (with a tiny test file)
    try {
      // Create a small test image file
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx!.fillStyle = 'red';
      ctx!.fillRect(0, 0, 1, 1);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      const formData = new FormData();
      formData.append('file', blob, 'test.png');

      const uploadResponse = await fetch('/api/aws/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadData = await uploadResponse.json();
      
      if (uploadResponse.ok) {
        testResults[3] = {
          test: 'Form Upload',
          status: 'success',
          message: 'File uploaded successfully to S3',
          details: uploadData.viewUrl
        };
      } else {
        testResults[3] = {
          test: 'Form Upload',
          status: 'error',
          message: 'File upload failed',
          details: uploadData
        };
      }
    } catch (error) {
      testResults[3] = {
        test: 'Form Upload',
        status: 'error',
        message: 'Upload test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setResults([...testResults]);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AWS S3 Configuration Test
        </h1>
        <p className="text-gray-600">
          Test your AWS credentials and S3 upload functionality
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Diagnostic Tests</h2>
          <button
            onClick={runTests}
            disabled={testing}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              testing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Running Tests...' : 'Run Tests'}</span>
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                    {result.details && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Show Details
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto">
                            {typeof result.details === 'string' 
                              ? result.details 
                              : JSON.stringify(result.details, null, 2)
                            }
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Troubleshooting Guide */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">
          Common Issues & Solutions
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>SignatureDoesNotMatch Error:</strong>
            <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
              <li>Check if AWS_SECRET_ACCESS_KEY is complete and correct</li>
              <li>Ensure no extra spaces or characters in .env file</li>
              <li>Verify the AWS region matches your S3 bucket region</li>
              <li>Try regenerating your AWS access keys</li>
            </ul>
          </div>
          <div>
            <strong>Missing Environment Variables:</strong>
            <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
              <li>Check .env file has all required AWS variables</li>
              <li>Restart your development server after changing .env</li>
              <li>Ensure .env file is in the project root</li>
            </ul>
          </div>
          <div>
            <strong>Access Denied:</strong>
            <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
              <li>Verify IAM user has S3 permissions</li>
              <li>Check bucket policy allows your AWS account</li>
              <li>Ensure bucket exists and is in the correct region</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}