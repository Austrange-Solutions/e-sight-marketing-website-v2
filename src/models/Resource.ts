import mongoose, { Document, Schema } from "mongoose";

export interface IResource extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileKey: string; // S3 key for deletion
  fileType: string; // pdf, docx, xlsx, jpg, png, etc.
  fileSize: number; // in bytes
  category: "annual-reports" | "project-reports" | "documents";
  viewCount: number;
  isPublic: boolean;
  uploadedBy: mongoose.Types.ObjectId; // Reference to admin user
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileKey: {
      type: String,
      required: [true, "File key is required"],
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["annual-reports", "project-reports", "documents"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Uploader reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
resourceSchema.index({ category: 1, createdAt: -1 });
resourceSchema.index({ isPublic: 1 });

const Resource = mongoose.models.Resource || mongoose.model<IResource>("Resource", resourceSchema);

export default Resource;
