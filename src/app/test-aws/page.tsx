'use client';

import { useState } from 'react';

export default function TestAWSAPI() {
  const [result, setResult] = useState<{method: string; data: unknown; status: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test GET method
  const testGet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/aws?key_data=e-sight-basic.png');
      const data = await response.json();
      setResult({ method: 'GET', data, status: response.status });
    } catch (err: unknown) {
      setError(`GET Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Test POST method
  const testPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/aws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-image.png',
          contentType: 'image/png'
        })
      });
      const data = await response.json();
      setResult({ method: 'POST', data, status: response.status });
    } catch (err: unknown) {
      setError(`POST Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Test with empty body (to reproduce the error)
  const testPostEmpty = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/aws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '' // Empty body to reproduce the error
      });
      const data = await response.json();
      setResult({ method: 'POST (Empty)', data, status: response.status });
    } catch (err: unknown) {
      setError(`POST Empty Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Test with malformed JSON
  const testPostMalformed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/aws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"filename": "test.png", "contentType": ' // Malformed JSON
      });
      const data = await response.json();
      setResult({ method: 'POST (Malformed)', data, status: response.status });
    } catch (err: unknown) {
      setError(`POST Malformed Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AWS API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testGet}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Test GET (CloudFront URL)
        </button>
        
        <button
          onClick={testPost}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Test POST (Upload URL)
        </button>
        
        <button
          onClick={testPostEmpty}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
        >
          Test POST (Empty Body)
        </button>
        
        <button
          onClick={testPostMalformed}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          Test POST (Malformed JSON)
        </button>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold text-lg mb-2">
            {result.method} Result (Status: {result.status})
          </h3>
          <pre className="bg-white p-3 rounded border overflow-auto text-sm">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Usage Examples */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Correct Usage Examples:</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">GET Request (Get CloudFront URL):</h4>
            <code className="block bg-white p-2 rounded text-sm">
              GET /api/aws?key_data=e-sight-basic.png
            </code>
          </div>
          
          <div>
            <h4 className="font-medium">POST Request (Get Upload URL):</h4>
            <code className="block bg-white p-2 rounded text-sm">
              {`POST /api/aws
Content-Type: application/json

{
  "filename": "my-image.png",
  "contentType": "image/png"
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}