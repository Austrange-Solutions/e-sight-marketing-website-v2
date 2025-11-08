"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Save, X, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface Foundation {
  _id: string;
  foundationName: string;
  displayName?: string;
  code: string;
}

interface CSRDonation {
  _id: string;
  companyName: string;
  amount: number;
  numberOfPeople: number;
  foundation: Foundation;
  platformFee: number;
  foundationShare: number;
  companyShare: number;
  date: string;
  status: 'pending' | 'verified' | 'rejected' | 'received' | 'certificate_issued';
  notes?: string;
  createdBy?: { username: string };
  lastEditedBy?: { username: string };
  auditLog?: Array<{
    editedBy: { username: string };
    editedAt: string;
    changes: Array<{ field: string; oldValue: any; newValue: any }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function CSRDonationsManager() {
  const [csrDonations, setCSRDonations] = useState<CSRDonation[]>([]);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    amount: '',
    numberOfPeople: '1',
    foundation: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Edit state
  const [editData, setEditData] = useState<Partial<CSRDonation>>({});

  useEffect(() => {
    fetchFoundations();
    fetchCSRDonations();
  }, [dateRange, statusFilter, customStartDate, customEndDate]);

  const fetchFoundations = async () => {
    try {
      const response = await fetch('/api/foundations');
      const data = await response.json();
      console.log('🔍 Foundations API response:', data); // Debug log
      if (data.success) {
        const filtered = data.foundations.filter((f: Foundation) => f.code !== 'general');
        console.log('✅ Filtered foundations:', filtered); // Debug log
        setFoundations(filtered);
      } else {
        console.error('❌ API returned error:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching foundations:', error);
    }
  };

  const fetchCSRDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      if (dateRange !== 'all' && dateRange !== 'custom') {
        // The API will handle dateRange parameter
      } else if (dateRange === 'custom' && (customStartDate || customEndDate)) {
        if (customStartDate) params.append('startDate', customStartDate);
        if (customEndDate) params.append('endDate', customEndDate);
      }

      const response = await fetch(`/api/admin/csr-donations?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setCSRDonations(data.csrDonations);
      }
    } catch (error) {
      console.error('Error fetching CSR donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/csr-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          numberOfPeople: parseInt(formData.numberOfPeople),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('CSR donation added successfully!');
        setShowForm(false);
        setFormData({
          companyName: '',
          amount: '',
          numberOfPeople: '1',
          foundation: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchCSRDonations();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding CSR donation:', error);
      alert('Failed to add CSR donation');
    }
  };

  const startEdit = (donation: CSRDonation) => {
    setEditingId(donation._id);
    setEditData({ ...donation });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/csr-donations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: editData.companyName,
          amount: editData.amount,
          numberOfPeople: editData.numberOfPeople,
          foundation: editData.foundation?._id || editData.foundation,
          platformFee: editData.platformFee,
          foundationShare: editData.foundationShare,
          companyShare: editData.companyShare,
          date: editData.date,
          status: editData.status,
          notes: editData.notes,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('CSR donation updated successfully!');
        setEditingId(null);
        setEditData({});
        fetchCSRDonations();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating CSR donation:', error);
      alert('Failed to update CSR donation');
    }
  };

  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete CSR donation from ${companyName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/csr-donations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('CSR donation deleted successfully!');
        fetchCSRDonations();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting CSR donation:', error);
      alert('Failed to delete CSR donation');
    }
  };

  const toggleAuditLog = (id: string) => {
    setExpandedAudit(expandedAudit === id ? null : id);
  };

  const totalCSRAmount = csrDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalCompanies = csrDonations.length;
  const totalPeople = csrDonations.reduce((sum, d) => sum + d.numberOfPeople, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CSR Donations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: ₹{totalCSRAmount.toLocaleString('en-IN')} • {totalCompanies} Companies • {totalPeople} People
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add CSR Donation'}
        </button>
      </div>

      {/* Add CSR Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border-2 border-green-200 space-y-4">
          <h3 className="text-lg font-semibold mb-4">New CSR Donation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Foundation *</label>
              <select
                value={formData.foundation}
                onChange={(e) => setFormData({ ...formData, foundation: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">
                  {foundations.length === 0 ? 'Loading foundations...' : 'Select Foundation'}
                </option>
                {foundations.length === 0 ? (
                  <option value="" disabled>No active foundations found</option>
                ) : (
                  foundations.map((f) => (
                    <option key={f._id} value={f.code}>
                      {f.displayName || f.foundationName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number of People *</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfPeople}
                onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add CSR Donation
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <React.Fragment key="custom-date-range">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </React.Fragment>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="received">Received</option>
              <option value="certificate_issued">Certificate Issued</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* CSR Donations Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Foundation</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">People</th>
              <th className="px-4 py-3 text-right">Plat. Fee</th>
              <th className="px-4 py-3 text-right">Found. Share</th>
              <th className="px-4 py-3 text-right">Co. Share</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Loading CSR donations...
                </td>
              </tr>
            ) : csrDonations.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No CSR donations found
                </td>
              </tr>
            ) : (
              csrDonations.map((donation) => {
                const isEditing = editingId === donation._id;
                const data = isEditing ? editData : donation;

                return (
                  <React.Fragment key={donation._id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={new Date(data.date!).toISOString().split('T')[0]}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        ) : (
                          new Date(donation.date).toLocaleDateString('en-IN')
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={data.companyName!}
                            onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          donation.companyName
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={typeof data.foundation === 'object' ? data.foundation._id : data.foundation}
                            onChange={(e) => setEditData({ ...editData, foundation: e.target.value as any })}
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            {foundations.map((f) => (
                              <option key={f._id} value={f._id}>
                                {f.displayName || f.foundationName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          donation.foundation?.displayName || donation.foundation?.foundationName
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={data.amount!}
                            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-right"
                          />
                        ) : (
                          `₹${donation.amount.toLocaleString('en-IN')}`
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data.numberOfPeople!}
                            onChange={(e) => setEditData({ ...editData, numberOfPeople: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-right"
                          />
                        ) : (
                          donation.numberOfPeople
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={data.platformFee!}
                            onChange={(e) => setEditData({ ...editData, platformFee: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-right text-xs"
                          />
                        ) : (
                          `₹${donation.platformFee.toLocaleString('en-IN')}`
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={data.foundationShare!}
                            onChange={(e) => setEditData({ ...editData, foundationShare: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-right text-xs"
                          />
                        ) : (
                          `₹${donation.foundationShare.toLocaleString('en-IN')}`
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={data.companyShare!}
                            onChange={(e) => setEditData({ ...editData, companyShare: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-right text-xs"
                          />
                        ) : (
                          `₹${donation.companyShare.toLocaleString('en-IN')}`
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={data.status!}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="received">Received</option>
                            <option value="certificate_issued">Certificate Issued</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs ${
                            donation.status === 'verified' ? 'bg-green-100 text-green-800' :
                            donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {donation.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(donation._id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(donation)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => toggleAuditLog(donation._id)}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="Audit Log"
                              >
                                {expandedAudit === donation._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              <button
                                onClick={() => handleDelete(donation._id, donation.companyName)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Audit Log Row */}
                    {expandedAudit === donation._id && donation.auditLog && donation.auditLog.length > 0 && (
                      <tr className="bg-purple-50">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="text-sm space-y-2">
                            <h4 className="font-semibold text-purple-900">Audit Log</h4>
                            {donation.auditLog.map((log, idx) => (
                              <div key={idx} className="border-l-2 border-purple-300 pl-3">
                                <p className="text-xs text-gray-600">
                                  {new Date(log.editedAt).toLocaleString('en-IN')} by {log.editedBy.username}
                                </p>
                                <ul className="mt-1 space-y-1">
                                  {log.changes.map((change, cidx) => (
                                    <li key={cidx} className="text-xs">
                                      <span className="font-medium">{change.field}:</span>{' '}
                                      <span className="text-red-600">{JSON.stringify(change.oldValue)}</span> →{' '}
                                      <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
