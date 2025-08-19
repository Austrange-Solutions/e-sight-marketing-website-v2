import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    addressLine2: { type: String, required: true },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    addressType: { type: String, default: "Home" },
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  }],
  orderSummary: {
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true }, // 18% GST
    transactionFee: { type: Number, required: true }, // 2% of subtotal
    deliveryCharges: { type: Number, required: true }, // ₹500 for Mumbai, ₹1000 for outside
    total: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["razorpay", "cod"],
    default: "razorpay",
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, {
  timestamps: true,
});

const Checkout = mongoose.models.Checkout || mongoose.model("Checkout", checkoutSchema);
export default Checkout;