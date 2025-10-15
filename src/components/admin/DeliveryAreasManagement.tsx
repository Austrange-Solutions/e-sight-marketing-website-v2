'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Upload, Eye, Search, X } from 'lucide-react';
// import { Download } from 'lucide-react'; // Commented out as it's not being used

interface DeliveryArea {
  _id: string;
  pincode: string;
  areaName: string;
  district: string;
  deliveryCharges: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryAreasManagementProps {
  onRefresh: () => void;
}

export default function DeliveryAreasManagement({ onRefresh }: DeliveryAreasManagementProps) {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [viewingArea, setViewingArea] = useState<DeliveryArea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    pincode: '',
    areaName: '',
    district: '',
    deliveryCharges: 100,
    isActive: true
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  // Filter areas based on search and filters
  useEffect(() => {
    let filtered = areas;

    // Search by pincode or area name
    if (searchQuery) {
      filtered = filtered.filter(area => 
        area.pincode.includes(searchQuery) || 
        area.areaName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by district
    if (filterDistrict) {
      filtered = filtered.filter(area => area.district === filterDistrict);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(area => 
        filterStatus === 'active' ? area.isActive : !area.isActive
      );
    }

    setFilteredAreas(filtered);
  }, [areas, searchQuery, filterDistrict, filterStatus]);

  // Get unique districts for filter dropdown
  const uniqueDistricts = [...new Set(areas.map(area => area.district))].sort();

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/delivery-areas');
      if (response.ok) {
        const data = await response.json();
        setAreas(data.areas || []);
      }
    } catch (error) {
      console.error('Error fetching delivery areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingArea ? '/api/admin/delivery-areas' : '/api/admin/delivery-areas';
      const method = editingArea ? 'PUT' : 'POST';
      const body = editingArea 
        ? { ...formData, _id: editingArea._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchAreas();
        setShowAddForm(false);
        setEditingArea(null);
        setFormData({ pincode: '', areaName: '', district: '', deliveryCharges: 100, isActive: true });
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Error saving delivery area');
      }
    } catch (error) {
      console.error('Error saving delivery area:', error);
      alert('Error saving delivery area');
    }
  };

  // const handleEdit = (area: DeliveryArea) => { // Commented out as it's not being used
  //   setEditingArea(area);
  //   setFormData({
  //     pincode: area.pincode,
  //     areaName: area.areaName,
  //     district: area.district,
  //     deliveryCharges: area.deliveryCharges,
  //     isActive: area.isActive
  //   });
  //   setShowAddForm(true);
  // };

  const handleDelete = async (areaId: string) => {
    if (!confirm('Are you sure you want to delete this delivery area?')) return;

    try {
      const response = await fetch(`/api/admin/delivery-areas?id=${areaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAreas();
        onRefresh();
      } else {
        alert('Error deleting delivery area');
      }
    } catch (error) {
      console.error('Error deleting delivery area:', error);
      alert('Error deleting delivery area');
    }
  };

  const handleBulkImport = async () => {
    if (!confirm('This will import Mumbai suburban pincodes. Continue?')) return;

    try {
      const response = await fetch('/api/admin/delivery-areas/bulk-import', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Import completed: ${data.summary.imported} imported, ${data.summary.skipped} skipped`);
        await fetchAreas();
        onRefresh();
      } else {
        alert('Error during bulk import');
      }
    } catch (error) {
      console.error('Error during bulk import:', error);
      alert('Error during bulk import');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Delivery Areas Management</h2>
          <p className="text-muted-foreground text-sm">Manage pincode-based delivery charges</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleBulkImport}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent"
          >
            <Upload size={16} className="mr-2" />
            Bulk Import Mumbai
          </button>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingArea(null);
              setFormData({ pincode: '', areaName: '', district: '', deliveryCharges: 100, isActive: true });
            }}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90"
          >
            <Plus size={16} className="mr-2" />
            Add New Area
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by pincode or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* District Filter */}
        <select
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
          className="px-3 py-2 sm:px-4 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">All Districts</option>
          {uniqueDistricts.map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 sm:px-4 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Results Count */}
        <div className="flex items-center text-muted-foreground sm:col-span-2 lg:col-span-1">
          <span className="text-sm">
            Showing {filteredAreas.length} of {areas.length} areas
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
          <h3 className="text-sm sm:text-lg font-semibold text-green-800">Active Areas</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-900">{areas.filter(a => a.isActive).length}</p>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm sm:text-lg font-semibold text-blue-800">Total Areas</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-900">{areas.length}</p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
          <h3 className="text-sm sm:text-lg font-semibold text-purple-800">Avg. Charges</h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-900">
            ₹{areas.length > 0 ? Math.round(areas.reduce((acc, a) => acc + a.deliveryCharges, 0) / areas.length) : 0}
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-4 sm:p-6 rounded-lg border border-border max-w-lg w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowAddForm(false); setEditingArea(null); }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-muted-foreground"
              title="Close"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-lg font-semibold mb-4 pr-8">
              {editingArea ? 'Edit Delivery Area' : 'Add New Delivery Area'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Area Name</label>
                  <input
                    type="text"
                    value={formData.areaName}
                    onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Delivery Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryCharges}
                    onChange={(e) => setFormData({ ...formData, deliveryCharges: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-foreground">
                  Active
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium"
                >
                  {editingArea ? 'Update' : 'Add'} Area
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditingArea(null); }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-foreground rounded-md hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredAreas.map((area) => (
          <div key={area._id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-foreground">{area.pincode}</h4>
                <p className="text-sm text-muted-foreground">{area.areaName}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                area.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {area.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">District:</span>
                <span className="text-foreground">{area.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Charges:</span>
                <span className="text-foreground font-medium">₹{area.deliveryCharges}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setViewingArea(area)}
                className="text-blue-600 hover:text-blue-900 p-1"
                title="View Details"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => {
                  setEditingArea(area);
                  setFormData({
                    pincode: area.pincode,
                    areaName: area.areaName,
                    district: area.district,
                    deliveryCharges: area.deliveryCharges,
                    isActive: area.isActive
                  });
                  setShowAddForm(true);
                }}
                className="text-primary hover:text-primary/90 p-1"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(area._id)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pincode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Area Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Charges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200">
              {filteredAreas.map((area) => (
                <tr key={area._id} className="hover:bg-accent">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {area.pincode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {area.areaName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {area.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    ₹{area.deliveryCharges}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      area.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {area.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setViewingArea(area)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingArea(area);
                        setFormData({
                          pincode: area.pincode,
                          areaName: area.areaName,
                          district: area.district,
                          deliveryCharges: area.deliveryCharges,
                          isActive: area.isActive
                        });
                        setShowAddForm(true);
                      }}
                      className="text-primary hover:text-primary/90"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(area._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAreas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {areas.length === 0 
                  ? "No delivery areas found. Click 'Bulk Import Mumbai' to get started."
                  : "No areas match your search criteria."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Viewing Modal */}
      {viewingArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Area Details</h3>
              <button
                onClick={() => setViewingArea(null)}
                className="text-gray-400 hover:text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground">Pincode</label>
                <p className="text-lg font-mono text-foreground">{viewingArea.pincode}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground">Area Name</label>
                <p className="text-foreground">{viewingArea.areaName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground">District</label>
                <p className="text-foreground">{viewingArea.district}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground">Delivery Charges</label>
                <p className="text-lg font-semibold text-green-600">₹{viewingArea.deliveryCharges}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  viewingArea.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {viewingArea.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {viewingArea.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-foreground">Created At</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingArea.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setViewingArea(null);
                  setEditingArea(viewingArea);
                  setFormData({
                    pincode: viewingArea.pincode,
                    areaName: viewingArea.areaName,
                    district: viewingArea.district,
                    deliveryCharges: viewingArea.deliveryCharges,
                    isActive: viewingArea.isActive
                  });
                  setShowAddForm(true);
                }}
                className="w-full sm:flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Edit Area
              </button>
              <button
                onClick={() => setViewingArea(null)}
                className="w-full sm:flex-1 bg-gray-300 text-foreground px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
