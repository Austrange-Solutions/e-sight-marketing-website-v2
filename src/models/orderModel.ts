import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Order Items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: { type: String },
  }],
  
  // Customer Information
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  
  // Shipping Address
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    addressLine2: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    addressType: { type: String, default: "Home" },
  },
  
  // Order Summary
  orderSummary: {
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true }, // 18% GST
    transactionFee: { type: Number, required: true }, // 2% of subtotal
    deliveryCharges: { type: Number, required: true }, // ₹500 for Mumbai, ₹1000 for outside
    total: { type: Number, required: true },
  },
  
  totalAmount: {
    type: Number,
    required: true,
  },
  
  // Payment Information
  paymentInfo: {
    method: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  
  // Order Number (for easy reference)
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Cancellation Info
  cancellation: {
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed', 'failed'],
      default: 'none',
    },
  },
  
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;