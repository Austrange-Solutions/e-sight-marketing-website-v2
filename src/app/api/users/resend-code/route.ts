import { NextResponse } from 'next/server';
import { resendEmail } from '@/helpers/resendEmail';
import { getUserByEmail } from '@/lib/server/auth';
import { updateUserVerificationCode } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new verification code (implement your logic here)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save code to user
  await updateUserVerificationCode(email, code);

    // Send email
    await resendEmail(email, code);

    return NextResponse.json({ message: 'Verification code resent successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resend verification code' }, { status: 500 });
  }
}
