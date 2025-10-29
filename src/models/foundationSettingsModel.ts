import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFoundationSettings extends Document {
  foundationCode: "vsf" | "cf";
  foundationName: string;
  platformFeePercent: number; // Platform's cut from donation (e.g., 10%)
  foundationSharePercent: number; // Foundation's share of remaining amount (e.g., 70%)
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FoundationSettingsSchema: Schema = new Schema(
  {
    foundationCode: {
      type: String,
      enum: ["vsf", "cf"],
      required: [true, "Foundation code is required"],
      unique: true,
    },
    foundationName: {
      type: String,
      required: [true, "Foundation name is required"],
      trim: true,
    },
    platformFeePercent: {
      type: Number,
      required: [true, "Platform fee percentage is required"],
      min: [0, "Platform fee cannot be negative"],
      max: [100, "Platform fee cannot exceed 100%"],
      default: 10,
    },
    foundationSharePercent: {
      type: Number,
      required: [true, "Foundation share percentage is required"],
      min: [0, "Foundation share cannot be negative"],
      max: [100, "Foundation share cannot exceed 100%"],
      default: 70,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be less than 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to calculate company share percentage
FoundationSettingsSchema.virtual("companySharePercent").get(function (this: IFoundationSettings) {
  return 100 - this.foundationSharePercent;
});

// Method to calculate breakdown for a donation amount
FoundationSettingsSchema.methods.calculateBreakdown = function (amount: number) {
  // Two-tier calculation: Platform Fee → Foundation/Company Split
  const platformFee = Math.round(amount * (this.platformFeePercent / 100) * 100) / 100;
  const afterPlatformFee = Math.round((amount - platformFee) * 100) / 100;
  
  const foundationAmount = Math.round(afterPlatformFee * (this.foundationSharePercent / 100) * 100) / 100;
  const companyAmount = Math.round((afterPlatformFee - foundationAmount) * 100) / 100;

  return {
    totalAmount: amount,
    platformFee,
    afterPlatformFee,
    foundationAmount,
    companyAmount,
    platformFeePercent: this.platformFeePercent,
    foundationSharePercent: this.foundationSharePercent,
    companySharePercent: 100 - this.foundationSharePercent,
  };
};

// Index for faster queries
FoundationSettingsSchema.index({ foundationCode: 1 });
FoundationSettingsSchema.index({ isActive: 1 });

const FoundationSettings: Model<IFoundationSettings> =
  mongoose.models.FoundationSettings ||
  mongoose.model<IFoundationSettings>("FoundationSettings", FoundationSettingsSchema);

export default FoundationSettings;
