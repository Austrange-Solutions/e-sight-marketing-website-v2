import mongoose from "mongoose";

export interface TAdminSettings {
  _id: mongoose.Types.ObjectId;
  settingKey: string;
  settingValue: string | number | boolean;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSettingsSchema = new mongoose.Schema<TAdminSettings>({
  settingKey: {
    type: String,
    required: [true, "Setting key is required"],
    unique: true,
    trim: true
  },
  settingValue: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, "Setting value is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for faster queries (settingKey index is created by unique: true)
adminSettingsSchema.index({ isActive: 1 });

const AdminSettings = mongoose.models.AdminSettings || mongoose.model<TAdminSettings>("AdminSettings", adminSettingsSchema);

export default AdminSettings;
