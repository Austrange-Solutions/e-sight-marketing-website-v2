import { useState } from 'react';
import { Eye, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

interface Customer {
  userId: string;
  username: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

interface PaymentInfo {
  method: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
}

interface ShippingAddress {
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
}

interface OrderSummary {
  subtotal: number;
  gst: number;
  transactionFee: number;
  deliveryCharges: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  orderSummary: OrderSummary;
  cancellation?: {
    isCancelled: boolean;
    cancelledAt?: string;
    cancelReason?: string;
  };
}

interface OrdersManagementProps {
  orders: Order[];
  onRefresh: () => void;
}

export default function OrdersManagement({ orders, onRefresh }: OrdersManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Order update error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Orders Management</h3>
        <div className="text-sm text-gray-500">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Orders Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {orderStatuses.map(status => {
          const count = orders.filter(order => order.status === status).length;
          return (
            <div key={status} className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{status}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
            </div>
          );
        })}
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer.username}</div>
                    <div className="text-xs text-gray-500">{order.customer.email}</div>
                    <div className="text-xs text-gray-500">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{order.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      GST: ₹{order.orderSummary.gst} | Delivery: ₹{order.orderSummary.deliveryCharges}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentInfo.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentInfo.status}
                      </span>
                      <div className="mt-1 text-gray-500 capitalize">{order.paymentInfo.method}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${getStatusColor(order.status)} ${
                        updating === order._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status} className="bg-white text-gray-900">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No orders found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Details - #{selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Name:</strong> {selectedOrder.customer.username}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>{selectedOrder.shippingAddress.name}</strong></p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">₹{item.price.toLocaleString()}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">₹{item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Method:</strong> {selectedOrder.paymentInfo.method.toUpperCase()}</p>
                  <p><strong>Status:</strong> {selectedOrder.paymentInfo.status}</p>
                  {selectedOrder.paymentInfo.razorpayPaymentId && (
                    <p><strong>Payment ID:</strong> {selectedOrder.paymentInfo.razorpayPaymentId}</p>
                  )}
                  {selectedOrder.paymentInfo.paidAt && (
                    <p><strong>Paid At:</strong> {new Date(selectedOrder.paymentInfo.paidAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.orderSummary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>GST (18%):</span>
                    <span>₹{selectedOrder.orderSummary.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Transaction Fee:</span>
                    <span>₹{selectedOrder.orderSummary.transactionFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Delivery Charges:</span>
                    <span>₹{selectedOrder.orderSummary.deliveryCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold border-t border-gray-200 mt-2 pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.orderSummary.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}