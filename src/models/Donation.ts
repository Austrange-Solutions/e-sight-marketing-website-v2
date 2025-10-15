import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonation extends Document {
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  sticksEquivalent: number;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  status: "pending" | "completed" | "failed";
  message?: string;
  isAnonymous: boolean;
  // Optional fields for tax exemption
  address?: string;
  city?: string;
  state?: string;
  pan?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema = new Schema(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be less than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Minimum donation amount is ₹1"],
      max: [1000000, "Maximum donation amount is ₹10,00,000"],
    },
    sticksEquivalent: {
      type: Number,
      required: true,
      default: function () {
        return this.amount / 1499;
      },
    },
    paymentId: {
      type: String,
      trim: true,
    },
    orderId: {
      type: String,
      trim: true,
    },
    signature: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message must be less than 500 characters"],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Optional fields for tax exemption
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address must be less than 200 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City must be less than 100 characters"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, "State must be less than 100 characters"],
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please provide a valid PAN number (e.g., ABCDE1234F)"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
DonationSchema.index({ status: 1, createdAt: -1 });
DonationSchema.index({ email: 1 });
DonationSchema.index({ orderId: 1 });
DonationSchema.index({ amount: -1 }); // For leaderboard queries

// Virtual for formatted stick count
DonationSchema.virtual("formattedSticks").get(function (this: IDonation) {
  const sticks = this.sticksEquivalent;
  if (sticks < 0.5) {
    return "Contributing";
  } else if (sticks < 1) {
    return "0.5 E-Kaathi Pro";
  } else if (sticks < 1.5) {
    return "1 E-Kaathi Pro";
  } else {
    return `${sticks.toFixed(1)} E-Kaathi Pro`;
  }
});

// Virtual for formatted amount
DonationSchema.virtual("formattedAmount").get(function (this: IDonation) {
  return `₹${this.amount.toLocaleString("en-IN")}`;
});

const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);

export default Donation;
