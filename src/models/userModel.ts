import mongoose, { Document } from 'mongoose';
// import { Schema } from 'mongoose'; // Commented out as it's not being used

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  isAdmin: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyCode: String,
  verifyCodeExpiry: Date,
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export default User;