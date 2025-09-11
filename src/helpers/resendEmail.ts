// Sends a password reset link to the user's email
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - E-sight</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 520px; width: 100%; background: #fff; border-radius: 24px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
            <h1 style="color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Password Reset</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">You requested to reset your password</p>
          </div>
          <div style="padding: 32px 40px; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Click the button below to reset your password. This link will expire in 15 minutes.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: #667eea; color: #fff; font-size: 18px; font-weight: 600; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">Reset Password</a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">If you did not request a password reset, please ignore this email.</p>
          </div>
          <div style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">e-Sight</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic;">"Improving the lives of blind individuals living in darkness"</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">© ${new Date().getFullYear()} e-Sight Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await resend.emails.send({
    from: "e-Sight <no-reply@austrangesolutions.com>",
    to: email,
    subject,
    html,
  });
}
// Sends a verification code to the user's email
export async function resendEmail(email: string, code: string): Promise<void> {
  // Actually send the email using the helper
  await sendVerificationEmail(email, 'Your E-sight Verification Code', code);
}
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  to: string,
  subject: string,
  code: string
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - E-sight</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
        <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
          <!-- Main Container -->
          <div style="max-width: 520px; width: 100%; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25); position: relative;">
            
            <!-- Decorative Elements -->
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(102, 126, 234, 0.1); border-radius: 50%; z-index: 1;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(118, 75, 162, 0.1); border-radius: 50%; z-index: 1;"></div>
            
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px 40px 40px; text-align: center; position: relative; z-index: 2;">
              <div style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="width: 60px; height: 60px; background: #ffffff; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#667eea" stroke-width="2"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#667eea" stroke-width="2" stroke-linecap="round"/>
                    <path d="M9 9h.01" stroke="#667eea" stroke-width="2" stroke-linecap="round"/>
                    <path d="M15 9h.01" stroke="#667eea" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Email Verification</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-weight: 400;">Secure your e-Sight account</p>
            </div>

            <!-- Content Section -->
            <div style="padding: 48px 40px 40px 40px; position: relative; z-index: 2;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome to e-Sight!</h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0; max-width: 400px; margin-left: auto; margin-right: auto;">
                  We're excited to have you join our mission of improving lives through innovative assistive technology.
                </p>
              </div>

              <!-- OTP Section -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 32px; text-align: center; margin: 32px 0; border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div>
                <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0; font-weight: 500;">Your verification code is:</p>
                
                <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin: 20px 0; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08); border: 2px solid #e5e7eb;">
                  <div style="font-size: 36px; font-weight: 800; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);">
                    ${code}
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 16px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#f59e0b"/>
                    <path d="M12 8v4l3 3" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span style="color: #f59e0b; font-size: 14px; font-weight: 500;">Expires in 1 hour</span>
                </div>
              </div>

              <!-- Instructions -->
              <div style="background: #fefbff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #7c3aed; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#7c3aed"/>
                  </svg>
                  Next Steps
                </h3>
                <ol style="color: #6b46c1; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Copy the 6-digit code above</li>
                  <li style="margin-bottom: 8px;">Return to the e-Sight application</li>
                  <li>Enter the code to verify your email</li>
                </ol>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb; position: relative; z-index: 2;">
              <div style="margin-bottom: 20px;">
                <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">e-Sight</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic;">
                  "Improving the lives of blind individuals living in darkness"
                </p>
              </div>
              
              <div style="border-top: 1px solid #d1d5db; padding-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
                  © ${new Date().getFullYear()} e-Sight Technologies. All rights reserved.
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                  This email was sent to ${to.split('@')[0]}@•••
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: "e-Sight <no-reply@austrangesolutions.com>", // Consider using your own domain
      to,
      subject: subject || "Verify your e-Sight account",
      html,
    });

    return data;
  } catch (error) {
    console.error("Resend email error:", error);
    throw error;
  }
}