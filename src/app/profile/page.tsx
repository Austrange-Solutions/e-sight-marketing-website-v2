'use client';
import { useState, useEffect } from 'react';
import { User, Package, Calendar, MapPin, Phone, Mail, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/users/logout", {
        method: "POST",
      });

      if (res.ok) {
        // Clear any client-side storage if needed
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        router.push("/login");
      } else {
        alert("Error logging out. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
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
          cancelReason,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert("Order cancelled successfully!");
        fetchOrders(); // Refresh orders
      } else {
        alert(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.username || 'User Profile'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition duration-200 flex items-center space-x-2"
            >
              {logoutLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </>
              )}
            </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Username</p>
                        <p className="text-gray-900">{user?.username || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-gray-900">{user?.address || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      {/* Order Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Payment: {order.paymentInfo.method.toUpperCase()} - {order.paymentInfo.status.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.cancellation.isCancelled && (
                            <p className="text-xs text-red-600 mt-1">
                              Cancelled: {order.cancellation.cancelReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <img
                              src={item.image || item.productId?.image || '/placeholder-image.jpg'}
                              alt={item.name || item.productId?.name || 'Product'}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name || item.productId?.name}</h4>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ₹{item.price || item.productId?.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{(item.quantity * (item.price || item.productId?.price || 0)).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address}</p>
                          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                          <p>{order.shippingAddress.country}</p>
                          <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₹{order.orderSummary.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST (18%):</span>
                            <span>₹{order.orderSummary.gst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction Fee:</span>
                            <span>₹{order.orderSummary.transactionFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Charges:</span>
                            <span>₹{order.orderSummary.deliveryCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-2 border-t border-blue-200">
                            <span>Total:</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      {order.paymentInfo.razorpayPaymentId && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Payment ID: {order.paymentInfo.razorpayPaymentId}</p>
                            <p>Order ID: {order.paymentInfo.razorpayOrderId}</p>
                            {order.paymentInfo.paidAt && (
                              <p>Paid on: {new Date(order.paymentInfo.paidAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="space-x-2">
                          {!order.cancellation.isCancelled && 
                           order.status !== 'delivered' && 
                           order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelOrder(order._id, order.orderNumber)}
                              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition duration-200"
                            >
                              Cancel Order
                            </button>
                          )}
                          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                            Track Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}