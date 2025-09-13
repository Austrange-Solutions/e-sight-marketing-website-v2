'use client';

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { User, Package, Calendar, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
      image: string;
    };
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    addressType: string;
  };
  orderSummary: {
    subtotal: number;
    gst: number;
    transactionFee: number;
    deliveryCharges: number;
    total: number;
  };
  totalAmount: number;
  paymentInfo: {
    method: 'razorpay' | 'cod';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  cancellation: {
    isCancelled: boolean;
    cancelledAt?: string;
    cancelReason?: string;
    refundStatus: 'none' | 'pending' | 'processed' | 'failed';
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [ordersLoading, setOrdersLoading] = useState(false);
const [ordersPage, setOrdersPage] = useState(1);
const [hasMoreOrders, setHasMoreOrders] = useState(true);
const ORDERS_PAGE_SIZE = 5;
const ordersLoaderRef = useRef<HTMLDivElement | null>(null);
  const { user, loading: authLoading, logout, refreshUser, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

useEffect(() => {
  if (!authLoading) {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    setOrders([]);
    setOrdersPage(1);
    setHasMoreOrders(true);
    fetchOrders(1, true);
  }
}, [authLoading, isAuthenticated, user, router]);

useEffect(() => {
  if (activeTab !== 'orders' || !hasMoreOrders || ordersLoading) return;
  const handleScroll = () => {
    if (!ordersLoaderRef.current) return;
    const rect = ordersLoaderRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setOrdersPage(prev => prev + 1);
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [activeTab, hasMoreOrders, ordersLoading]);

useEffect(() => {
  if (ordersPage > 1) fetchOrders(ordersPage);
}, [ordersPage]);

const fetchOrders = async (page = 1, reset = false) => {
  setOrdersLoading(true);
  try {
    const res = await fetch(`/api/orders?page=${page}&limit=${ORDERS_PAGE_SIZE}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (reset) {
        setOrders(data.orders || []);
      } else {
        setOrders(prev => {
          const existingIds = new Set(prev.map(o => o._id));
          const newOrders = (data.orders || []).filter((o: Order) => !existingIds.has(o._id));
          return [...prev, ...newOrders];
        });
      }
      setHasMoreOrders((data.orders || []).length === ORDERS_PAGE_SIZE);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    setOrdersLoading(false);
    setLoading(false);
  }
};

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await refreshUser(); // Refresh user data from context
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    const cancelReason = prompt(`Are you sure you want to cancel order ${orderNumber}? Please provide a reason:`);
    
    if (!cancelReason) return;

    try {
      const res = await fetch("/api/orders/create", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "cancel",
          cancelReason,
        }),
      });

      if (res.ok) {
        alert("Order cancelled successfully!");
        fetchOrders(); // Refresh orders
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Error cancelling order. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'confirmed': return 'text-blue-600';
      case 'processing': return 'text-orange-600';
      case 'shipped': return 'text-purple-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // if (authLoading || loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  if (authLoading || loading) {
  return (
    <div className="mt-[4%] min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse bg-gray-100">
              <div className="h-6 w-1/3 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-1/4 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-300 rounded mb-2" />
              <div className="h-12 w-full bg-gray-200 rounded mb-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="mt-[4%] min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.username || 'User'}!
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {logoutLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Orders ({orders.length})
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          username: user?.username || '',
                          phone: user?.phone || '',
                          address: user?.address || ''
                        });
                      }}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="font-medium">{user?.username || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{user?.address || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Member since</p>
                        <p className="font-medium">
                          {user ? formatDate(new Date().toISOString()) : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">When you place your first order, it will appear here.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </p>
                          <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <img
                                src={item.image || item.productId?.image || '/placeholder.jpg'}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.jpg';
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleCancelOrder(order._id, order.orderNumber)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {ordersLoading && Array.from({ length: ORDERS_PAGE_SIZE }).map((_, i) => (
  <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse bg-gray-100">
    <div className="h-6 w-1/3 bg-gray-300 rounded mb-2" />
    <div className="h-4 w-1/4 bg-gray-300 rounded mb-2" />
    <div className="h-4 w-1/2 bg-gray-300 rounded mb-2" />
    <div className="h-12 w-full bg-gray-200 rounded mb-2" />
  </div>
))}
<div ref={ordersLoaderRef} style={{ height: 1 }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
