// models/Cart.ts
import mongoose from "mongoose";

export type TCartItem = {
  productId: mongoose.Types.ObjectId;
  quantity: number;
};

export type TCart = {
  userId: mongoose.Types.ObjectId;
  items: TCartItem[];
  createdAt: Date;
  updatedAt: Date;
};

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema<TCart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;