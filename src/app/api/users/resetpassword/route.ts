import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connect } from '@/dbConfig/dbConfig';

await connect();
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }
    const user = await User.findOne({ forgotPasswordToken: token });
    if (!user || !user.forgotPasswordTokenExpiry || user.forgotPasswordTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({ message: 'Password reset successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
