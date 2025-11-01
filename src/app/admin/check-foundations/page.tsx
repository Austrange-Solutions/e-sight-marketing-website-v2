"use client";

import { useEffect, useState } from "react";

export default function CheckFoundationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/check-foundations');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch');
        }
        
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading database check...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8">No data</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Foundation Check</h1>
      
      {/* Foundations */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">All Foundations</h2>
        <div className="space-y-2">
          {data.foundations?.map((f: any) => (
            <div key={f.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div><strong>ID:</strong> {f.id}</div>
              <div><strong>Code:</strong> {f.code}</div>
              <div><strong>Name:</strong> {f.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CF Check */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">CF Foundation Check</h2>
        <div>
          <strong>CF Exists:</strong> {data.cfExists ? '✅ YES' : '❌ NO'}
        </div>
        {data.cfData && (
          <div className="mt-2 border-l-4 border-green-500 pl-4 py-2">
            <div><strong>ID:</strong> {data.cfData.id}</div>
            <div><strong>Code:</strong> {data.cfData.code}</div>
            <div><strong>Name:</strong> {data.cfData.name}</div>
          </div>
        )}
      </section>

      {/* VSF ID Check */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">VSF Foundation ID Check</h2>
        <div>
          <strong>VSF ID in DB:</strong> {data.vsfId}
        </div>
        <div>
          <strong>Is 68F8E0A93EE0BE3EF2450503 correct?</strong> {data.isVsfIdCorrect ? '✅ YES' : '❌ NO'}
        </div>
      </section>

      {/* General Donations Count */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">General Donations</h2>
        <div className="text-2xl">
          <strong>Count:</strong> <span className="text-red-600">{data.generalDonationsCount}</span>
        </div>
      </section>

      {/* Foundation Distribution */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Foundation Value Distribution</h2>
        <div className="space-y-3">
          {data.foundationDistribution?.map((d: any, idx: number) => (
            <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
              <div><strong>Foundation Value:</strong> {JSON.stringify(d.foundationValue)}</div>
              <div><strong>Type:</strong> {d.foundationType}</div>
              <div><strong>Count:</strong> {d.count}</div>
              <div><strong>Total:</strong> ₹{d.total.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Donations */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sample Donations (First 20)</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.sampleDonations?.map((d: any) => (
            <div key={d.id} className="border-l-4 border-yellow-500 pl-4 py-2 text-sm">
              <div><strong>ID:</strong> {d.id}</div>
              <div><strong>Donor:</strong> {d.donorName}</div>
              <div><strong>Foundation:</strong> {JSON.stringify(d.foundation)}</div>
              <div><strong>Type:</strong> {d.foundationType}</div>
              <div><strong>Amount:</strong> ₹{d.amount}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Raw JSON */}
      <section className="mb-8 bg-gray-900 text-green-400 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-white">Raw JSON Data</h2>
        <pre className="text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      </section>
    </div>
  );
}
