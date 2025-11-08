import mongoose, { Document, Schema } from "mongoose";

export interface ICSRDonation extends Document {
  companyName: string;
  amount: number;
  numberOfPeople: number;
  foundation: mongoose.Types.ObjectId; // Reference to Foundation
  
  // Fee breakdown (auto-calculated but editable)
  platformFee: number;
  foundationShare: number;
  companyShare: number;
  
  // Metadata
  date: Date; // Donation date
  status: 'pending' | 'verified' | 'rejected' | 'received' | 'certificate_issued';
  notes?: string;
  
  // Audit fields
  createdBy: mongoose.Types.ObjectId; // Admin who created
  lastEditedBy?: mongoose.Types.ObjectId; // Admin who last edited
  
  // Detailed change history
  auditLog: Array<{
    editedBy: mongoose.Types.ObjectId;
    editedAt: Date;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const CSRDonationSchema = new Schema<ICSRDonation>(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Amount must be at least ₹1"],
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "Number of people must be at least 1"],
      default: 1,
    },
    foundation: {
      type: Schema.Types.ObjectId,
      ref: "Foundation",
      required: [true, "Foundation selection is required"],
    },
    platformFee: {
      type: Number,
      required: true,
      default: 0,
    },
    foundationShare: {
      type: Number,
      required: true,
      default: 0,
    },
    companyShare: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'received', 'certificate_issued'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    auditLog: [
      {
        editedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        editedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        changes: [
          {
            field: {
              type: String,
              required: true,
            },
            oldValue: {
              type: Schema.Types.Mixed,
            },
            newValue: {
              type: Schema.Types.Mixed,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CSRDonationSchema.index({ foundation: 1, date: -1 });
CSRDonationSchema.index({ status: 1 });
CSRDonationSchema.index({ createdAt: -1 });

// Avoid model recompilation in development
const CSRDonation = mongoose.models.CSRDonation || mongoose.model<ICSRDonation>("CSRDonation", CSRDonationSchema);

export default CSRDonation;
