import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for instance methods
interface IFoundationMethods {
  validatePercentages(): boolean;
}

// Interface for static methods
interface IFoundationModel extends Model<IFoundation, {}, IFoundationMethods> {
  getNextPriority(): Promise<number>;
  generateCode(name: string): string;
  isCodeUnique(code: string, excludeId?: string): Promise<boolean>;
}

export interface IFoundation extends Document, IFoundationMethods {
  // Required fields
  foundationName: string;
  code: string; // Unique identifier (e.g., "vsf", "cf", "abc-123")
  foundationSharePercent: number; // Foundation's % of donation
  companySharePercent: number; // Company's % of donation (auto-calculated but editable)
  
  // Platform fee (optional - defaults to 10%)
  platformFeePercent?: number; // Platform fee % deducted before split
  
  // Optional display fields
  displayName?: string; // Short name for buttons (defaults to foundationName)
  tagline?: string; // Brief description
  description?: string; // Full description
  
  // Branding
  logoUrl?: string; // S3 URL for uploaded logo
  icon?: string; // Emoji (💚, 💜, 🧡, ❤️, 💙)
  primaryColor?: string; // Hex color code
  
  // Contact (optional)
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  
  // Operational
  isActive: boolean; // Show on donation page?
  priority: number; // Display order (1 = first)
  minimumDonation?: number; // Minimum donation amount
  
  // Stats (auto-calculated)
  stats: {
    totalDonations: number;
    totalAmount: number;
    donorCount: number;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const FoundationSchema: Schema = new Schema(
  {
    // Required fields
    foundationName: {
      type: String,
      required: [true, "Foundation name is required"],
      trim: true,
      minlength: [2, "Foundation name must be at least 2 characters"],
      maxlength: [200, "Foundation name must not exceed 200 characters"],
    },
    code: {
      type: String,
      required: [true, "Foundation code is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Code can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    foundationSharePercent: {
      type: Number,
      required: [true, "Foundation share percentage is required"],
      min: [0, "Foundation share cannot be negative"],
      max: [100, "Foundation share cannot exceed 100%"],
    },
    companySharePercent: {
      type: Number,
      required: [true, "Company share percentage is required"],
      min: [0, "Company share cannot be negative"],
      max: [100, "Company share cannot exceed 100%"],
      default: function (this: IFoundation) {
        return 100 - this.foundationSharePercent;
      },
    },
    
    // Platform fee (optional - defaults to 10%)
    platformFeePercent: {
      type: Number,
      min: [0, "Platform fee cannot be negative"],
      max: [100, "Platform fee cannot exceed 100%"],
      default: 10,
    },
    
    // Optional display fields
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, "Display name must not exceed 50 characters"],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [150, "Tagline must not exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must not exceed 1000 characters"],
    },
    
    // Branding
    logoUrl: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "❤️",
      trim: true,
    },
    primaryColor: {
      type: String,
      default: "#10b981", // Platform primary color
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code"],
    },
    
    // Contact
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-() ]+$/, "Invalid phone number format"],
    },
    website: {
      type: String,
      trim: true,
    },
    
    // Operational
    isActive: {
      type: Boolean,
      default: false, // Inactive by default, admin must activate
    },
    priority: {
      type: Number,
      default: 999, // Will be auto-assigned to next available number
      min: [1, "Priority must be at least 1"],
    },
    minimumDonation: {
      type: Number,
      min: [1, "Minimum donation must be at least ₹1"],
      default: 1,
    },
    
    // Stats (updated via aggregation)
    stats: {
      totalDonations: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      donorCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
FoundationSchema.index({ code: 1 });
FoundationSchema.index({ isActive: 1, priority: 1 });
FoundationSchema.index({ createdAt: -1 });

// Virtual for display name fallback
FoundationSchema.virtual("displayNameOrFull").get(function (this: IFoundation) {
  return this.displayName || this.foundationName;
});

// Method to validate percentage sum
FoundationSchema.methods.validatePercentages = function () {
  const sum = this.foundationSharePercent + this.companySharePercent;
  if (Math.abs(sum - 100) > 0.01) {
    // Allow tiny floating point errors
    throw new Error(
      `Foundation share (${this.foundationSharePercent}%) + Company share (${this.companySharePercent}%) must equal 100%`
    );
  }
  return true;
};

// Pre-save hook to auto-calculate company share if not provided
FoundationSchema.pre("save", function (this: IFoundation, next) {
  if (this.isModified("foundationSharePercent") && !this.isModified("companySharePercent")) {
    this.companySharePercent = 100 - this.foundationSharePercent;
  }
  next();
});

// Pre-save validation
FoundationSchema.pre("save", function (this: any, next) {
  try {
    const sum = this.foundationSharePercent + this.companySharePercent;
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error(
        `Foundation share (${this.foundationSharePercent}%) + Company share (${this.companySharePercent}%) must equal 100%`
      );
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

// Static method to get next available priority
FoundationSchema.statics.getNextPriority = async function () {
  const highest = await this.findOne().sort("-priority").select("priority").lean();
  return highest ? highest.priority + 1 : 1;
};

// Static method to generate code from name
FoundationSchema.statics.generateCode = function (name: string): string {
  // Remove special characters and extra spaces
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Strategy: First letters of each word
  const words = cleaned.split(" ");
  let code = words
    .map((word) => word[0])
    .join("")
    .replace(/\s/g, "");

  // If code is too short (< 2 chars), use smart abbreviation
  if (code.length < 2) {
    code = cleaned
      .replace(/\s+/g, "-")
      .substring(0, 20)
      .replace(/-+$/, ""); // Remove trailing hyphens
  }

  return code;
};

// Static method to check if code exists
FoundationSchema.statics.isCodeUnique = async function (code: string, excludeId?: string) {
  const query: any = { code: code.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await this.findOne(query);
  return !existing;
};

const Foundation = (mongoose.models.Foundation as IFoundationModel) ||
  mongoose.model<IFoundation, IFoundationModel>("Foundation", FoundationSchema);

export default Foundation;
