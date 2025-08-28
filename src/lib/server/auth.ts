import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

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
