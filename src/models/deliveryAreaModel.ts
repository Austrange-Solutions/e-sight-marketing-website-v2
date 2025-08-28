import mongoose from "mongoose";

export interface TDeliveryArea {
  _id: mongoose.Types.ObjectId;
  pincode: string;
  areaName: string;
  district: string;
  isActive: boolean;
  deliveryCharges: number;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryAreaSchema = new mongoose.Schema<TDeliveryArea>({
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    unique: true,
    trim: true,
    match: [/^\d{6}$/, "Pincode must be 6 digits"]
  },
  areaName: {
    type: String,
    required: [true, "Area name is required"],
    trim: true
  },
  district: {
    type: String,
    required: [true, "District is required"],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryCharges: {
    type: Number,
    default: 100, // Standard Mumbai suburban charges
    min: [0, "Delivery charges cannot be negative"]
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
deliveryAreaSchema.index({ pincode: 1 });
deliveryAreaSchema.index({ isActive: 1 });

const DeliveryArea = mongoose.models.DeliveryArea || mongoose.model<TDeliveryArea>("DeliveryArea", deliveryAreaSchema);

export default DeliveryArea;
