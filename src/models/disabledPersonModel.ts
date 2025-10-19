import mongoose from "mongoose";

export type DisabilityType = 
  | "Visual Impairment"
  | "Hearing Impairment"
  | "Locomotor Disability"
  | "Intellectual Disability"
  | "Mental Illness"
  | "Multiple Disabilities"
  | "Other";

export type VerificationStatus = "pending" | "under_review" | "verified" | "rejected";

export type DocumentType = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
};

export interface TDisabledPerson {
  _id: mongoose.Types.ObjectId;
  
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  
  // Address Information
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  
  // Disability Information
  disabilityType: DisabilityType;
  disabilityPercentage: number;
  otherDisabilityDetails?: string;
  
  // Documents (All stored in AWS S3: e-sight/disabled-docs/)
  documents: {
    passportPhoto: DocumentType;
    aadharCard?: DocumentType; // Optional - either Aadhar or PAN
    panCard?: DocumentType; // Optional - either Aadhar or PAN
    disabilityCertificate: DocumentType;
    udidCard?: DocumentType; // Unique Disability ID Card (Optional but recommended)
    additionalDocuments?: DocumentType[]; // Any other supporting documents
  };
  
  // Verification Status
  verificationStatus: VerificationStatus;
  verificationHistory: Array<{
    status: VerificationStatus;
    updatedBy: string; // Admin ID or name
    updatedAt: Date;
    comments?: string;
  }>;
  
  // Admin Notes
  adminNotes?: string;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
}

const documentSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const verificationHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "under_review", "verified", "rejected"],
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  comments: {
    type: String,
  },
}, { _id: false });

const disabledPersonSchema = new mongoose.Schema<TDisabledPerson>({
  // Personal Information
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [100, "Name must be less than 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
    index: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian phone number"],
    unique: true,
    index: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
    validate: {
      validator: function(value: Date) {
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 120;
      },
      message: "Please provide a valid date of birth",
    },
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
    enum: {
      values: ["Male", "Female", "Other"],
      message: "Gender must be Male, Female, or Other",
    },
  },
  
  // Address Information
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    trim: true,
    match: [/^\d{6}$/, "Pincode must be 6 digits"],
  },
  
  // Disability Information
  disabilityType: {
    type: String,
    required: [true, "Disability type is required"],
    enum: {
      values: [
        "Visual Impairment",
        "Hearing Impairment",
        "Locomotor Disability",
        "Intellectual Disability",
        "Mental Illness",
        "Multiple Disabilities",
        "Other"
      ],
      message: "Please select a valid disability type",
    },
  },
  disabilityPercentage: {
    type: Number,
    required: [true, "Disability percentage is required"],
    min: [40, "Disability percentage must be at least 40% for certification"],
    max: [100, "Disability percentage cannot exceed 100%"],
  },
  otherDisabilityDetails: {
    type: String,
    trim: true,
  },
  
  // Documents
  documents: {
    passportPhoto: {
      type: documentSchema,
      required: [true, "Passport size photo is required"],
    },
    aadharCard: {
      type: documentSchema,
    },
    panCard: {
      type: documentSchema,
    },
    disabilityCertificate: {
      type: documentSchema,
      required: [true, "Disability certificate is required"],
    },
    udidCard: {
      type: documentSchema,
    },
    additionalDocuments: [documentSchema],
  },
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ["pending", "under_review", "verified", "rejected"],
    default: "pending",
    index: true,
  },
  verificationHistory: [verificationHistorySchema],
  
  // Admin Notes
  adminNotes: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  
  // Verification Date
  verifiedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
disabledPersonSchema.index({ verificationStatus: 1, createdAt: -1 });
disabledPersonSchema.index({ email: 1, phone: 1 });
disabledPersonSchema.index({ createdAt: -1 });

// Virtual for age calculation
disabledPersonSchema.virtual("age").get(function(this: TDisabledPerson) {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware to add verification history entry
disabledPersonSchema.pre('save', function(next) {
  if (this.isModified('verificationStatus')) {
    if (this.verificationStatus === 'verified') {
      this.verifiedAt = new Date();
    }
  }
  next();
});

const DisabledPerson = 
  mongoose.models.DisabledPerson || 
  mongoose.model<TDisabledPerson>("DisabledPerson", disabledPersonSchema);

export default DisabledPerson;
