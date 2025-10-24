"use client";

import { useEffect, useState } from "react";

export default function DebugDonationsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/donations?page=1&limit=3')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Donations Data</h1>
      
      <div className="bg-gray-900 text-green-400 p-6 rounded-lg">
        <h2 className="text-xl mb-4 text-white">First 3 Donations - Foundation Data:</h2>
        {data.donations?.slice(0, 3).map((d: any, idx: number) => (
          <div key={idx} className="mb-6 border-l-4 border-yellow-500 pl-4">
            <div className="text-white font-bold">Donation {idx + 1}:</div>
            <div><strong>ID:</strong> {d._id}</div>
            <div><strong>Donor:</strong> {d.donorName}</div>
            <div><strong>Foundation Type:</strong> {typeof d.foundation}</div>
            <div><strong>Foundation Value:</strong></div>
            <pre className="text-xs bg-black p-2 rounded mt-2">{JSON.stringify(d.foundation, null, 2)}</pre>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-green-400 p-6 rounded-lg mt-6">
        <h2 className="text-xl mb-4 text-white">Full Response:</h2>
        <pre className="text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
