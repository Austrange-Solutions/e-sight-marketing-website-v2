import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connect } from '@/dbConfig/dbConfig';
import { sendPasswordResetEmail } from '@/helpers/resendEmail';

export async function POST(req: Request) {
  await connect();
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Generate token and expiry
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    user.forgotPasswordToken = token;
    user.forgotPasswordTokenExpiry = expiry;
    await user.save();
    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/resetpassword?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);
    return NextResponse.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reset link' }, { status: 500 });
  }
}
