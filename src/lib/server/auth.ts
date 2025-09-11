import User from '@/models/userModel';

// Update user's verification code and expiry
export async function updateUserVerificationCode(email: string, code: string): Promise<void> {
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await User.findOneAndUpdate(
    { email },
    { verifyCode: code, verifyCodeExpiry: expiry }
  );
}
// Finds a user by email (stub)
export async function getUserByEmail(email: string): Promise<{ email: string } | null> {
  // TODO: Replace with actual DB lookup
  // Example: return await db.users.findOne({ email });
  return { email };
}
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connect } from "@/dbConfig/dbConfig";

export interface ServerUser {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  isAdmin: boolean;
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string; [key: string]: unknown };
    
    if (!decoded.id) {
      return null;
    }

    await connect();
    const user = await User.findById(decoded.id).select('-password').lean();
    
    if (!user) {
      return null;
    }

    // Type assertion for Mongoose lean() result
    const userData = user as unknown as {
      _id: { toString(): string };
      username: string;
      email: string;
      phone?: string;
      address?: string;
      isVerified?: boolean;
      isAdmin?: boolean;
    };

    return {
      _id: userData._id.toString(),
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      isVerified: userData.isVerified || false,
      isAdmin: userData.isAdmin || false
    };
  } catch (error) {
    console.error('Failed to get server user:', error);
    return null;
  }
}
