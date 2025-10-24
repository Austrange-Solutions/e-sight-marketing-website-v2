'use client';

import { X, Package, CreditCard, MapPin, Phone, Mail, User, Calendar, Truck } from 'lucide-react';

interface OrderDetailsModalProps {
  order: {
    _id: string;
    orderNumber: string;
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
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    return method === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery';
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
            <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-semibold text-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="bg-accent/50 rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Delivery Information</h3>
            </div>
            <div className="ml-8">
              <p className="text-foreground font-medium">
                {order.status === 'delivered' 
                  ? `Delivered on ${formatDate(order.updatedAt)}`
                  : order.status === 'shipped'
                  ? 'Expected delivery in 2-3 working days'
                  : 'Delivered in 3-4 working days'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Standard shipping • Free delivery on orders above ₹999
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <img
                    src={item.image || item.productId?.image || '/assets/images/maceazy-logo.png'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/images/maceazy-logo.png';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Product ID: {item.productId?._id || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">{getPaymentMethodDisplay(order.paymentInfo.method)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-semibold capitalize ${getPaymentStatusColor(order.paymentInfo.status)}`}>
                  {order.paymentInfo.status}
                </span>
              </div>
              {order.paymentInfo.razorpayPaymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-sm text-foreground bg-accent px-2 py-1 rounded">
                    {order.paymentInfo.razorpayPaymentId}
                  </span>
                </div>
              )}
              {order.paymentInfo.razorpayOrderId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm text-foreground bg-accent px-2 py-1 rounded">
                    {order.paymentInfo.razorpayOrderId}
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{order.orderSummary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">GST (Tax Included)</span>
                  <span className="text-foreground">Included</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span className="text-foreground">₹{order.orderSummary.transactionFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className="text-foreground">₹{order.orderSummary.deliveryCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Shipping Address
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{order.shippingAddress.name}</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress.addressType} Address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-foreground">
                  <p>{order.shippingAddress.address}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  {order.shippingAddress.landmark && <p className="text-sm text-muted-foreground">Landmark: {order.shippingAddress.landmark}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <p className="text-foreground">{order.shippingAddress.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <p className="text-foreground">{order.shippingAddress.email}</p>
              </div>
            </div>
          </div>

          {/* Billing Details (Customer Info) */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Billing Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{order.customerInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{order.customerInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{order.customerInfo.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
