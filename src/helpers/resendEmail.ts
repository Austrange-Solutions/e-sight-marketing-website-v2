// Sends a password reset link to the user's email
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Maceazy</title>
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
            <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">e-Kaathi</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic;">"Improving the lives of blind individuals living in darkness"</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">© ${new Date().getFullYear()} e-Kaathi. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await resend.emails.send({
    from: "Maceazy <no-reply@austrangesolutions.com>",
    to: email,
    subject,
    html,
  });
}
// Sends a verification code to the user's email
export async function resendEmail(email: string, code: string): Promise<void> {
  // Actually send the email using the helper
  await sendVerificationEmail(email, 'Your Maceazy Verification Code', code);
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
        <title>Verify Your Email - Maceazy</title>
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
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-weight: 400;">Secure your Maceazy account</p>
            </div>

            <!-- Content Section -->
            <div style="padding: 48px 40px 40px 40px; position: relative; z-index: 2;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome to !</h2>
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
                  <li style="margin-bottom: 8px;">Return to the Maceazy application</li>
                  <li>Enter the code to verify your email</li>
                </ol>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb; position: relative; z-index: 2;">
              <div style="margin-bottom: 20px;">
                <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Maceazy</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic;">
                  "Improving the lives of blind individuals living in darkness"
                </p>
              </div>
              
              <div style="border-top: 1px solid #d1d5db; padding-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
                  © ${new Date().getFullYear()} Maceazy Technologies. All rights reserved.
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
      from: "Maceazy <no-reply@austrangesolutions.com>", // Consider using your own domain
      to,
      subject: subject || "Verify your Maceazy account",
      html,
    });

    return data;
  } catch (error) {
    console.error("Resend email error:", error);
    throw error;
  }
}

// Sends registration confirmation email to disabled person
export async function sendDisabledRegistrationEmail(
  email: string,
  name: string,
  registrationId: string,
  guardianEmail?: string
): Promise<void> {
  const subject = "Registration Received - Disabled Person Verification";
  const statusCheckUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/disabled-registration/status?id=${registrationId}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Received</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <div style="min-height: 100vh; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, oklch(0.65 0.14 230) 0%, oklch(0.35 0.08 230) 100%); padding: 32px; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0;">Registration Received</h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 14px; margin: 12px 0 0 0;">Your application is under review</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">Dear ${name},</p>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for registering with Maceazy. We have received your application for disabled person verification.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid oklch(0.65 0.14 230); padding: 16px; margin: 24px 0;">
              <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Registration ID</p>
              <p style="color: #1e3a8a; font-size: 16px; font-family: 'Courier New', monospace; margin: 0;">${registrationId}</p>
            </div>
            
            <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin: 24px 0;">
              <p style="color: #713f12; font-size: 14px; margin: 0;">
                <strong>What happens next?</strong><br/>
                Our team will review your documents and information. This typically takes 3-5 business days.
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 24px 0;">
              You can check your verification status anytime using the button below:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${statusCheckUrl}" style="display: inline-block; padding: 14px 32px; background: oklch(0.65 0.14 230); color: #fff; font-size: 16px; font-weight: 600; border-radius: 8px; text-decoration: none;">
                Check Status
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
              You will receive an email notification when your verification status is updated. Kindly ensure to check your spam/junk folder in case the email is filtered there.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Maceazy</h3>
            <p style="color: #6b7280; font-size: 13px; margin: 0; font-style: italic;">"Making Life easier, For the Disabled"</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">© ${new Date().getFullYear()} Maceazy Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Maceazy <no-reply@austrangesolutions.com>",
    to: email,
    subject,
    html,
  });

  // Also send same email to guardian if provided and different from primary
  try {
    if (guardianEmail && guardianEmail !== email) {
      await resend.emails.send({
        from: "Maceazy <no-reply@austrangesolutions.com>",
        to: guardianEmail,
        subject,
        html,
      });
    }
  } catch (gErr) {
    console.error("Failed to send registration email to guardian:", gErr);
    // don't throw - guardian email failure shouldn't fail registration
  }
}

// Sends status update email to disabled person
export async function sendDisabledStatusUpdateEmail(
  email: string,
  name: string,
  registrationId: string,
  status: "under_review" | "verified" | "rejected",
  comments?: string,
  guardianEmail?: string
): Promise<void> {
  const statusMessages = {
    under_review: {
      subject: "Application Under Review",
      title: "Your Application is Under Review",
      message: "Our team is currently reviewing your submitted documents and information.",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      textColor: "#92400e",
    },
    verified: {
      subject: "Application Verified ✓",
      title: "Congratulations! Your Application is Verified",
      message: "Your documents have been verified successfully. You can now access all disability benefits.",
      color: "#10b981",
      bgColor: "#d1fae5",
      textColor: "#065f46",
    },
    rejected: {
      subject: "Application Update Required",
      title: "Additional Information Required",
      message: "We need some clarification or additional documents for your application.",
      color: "#ef4444",
      bgColor: "#fee2e2",
      textColor: "#991b1b",
    },
  };

  const { subject, title, message, color, bgColor, textColor } = statusMessages[status];
  const statusCheckUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/disabled-registration/status?id=${registrationId}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <div style="min-height: 100vh; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, oklch(0.65 0.14 230) 0%, oklch(0.35 0.08 230) 100%); padding: 32px; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0;">${title}</h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 14px; margin: 12px 0 0 0;">Registration ID: ${registrationId}</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">Dear ${name},</p>
            
            <div style="background: #f0f9ff; border-left: 4px solid oklch(0.65 0.14 230); padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Your Registration ID</p>
              <p style="color: #1e3a8a; font-size: 18px; font-family: 'Courier New', monospace; font-weight: 700; margin: 0; letter-spacing: 1px;">${registrationId}</p>
            </div>
            
            <div style="background: ${bgColor}; border-left: 4px solid ${color}; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: ${textColor}; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">Status Update</p>
              <p style="color: ${textColor}; font-size: 14px; margin: 0;">${message}</p>
            </div>
            
            ${comments ? `
              <div style="background: #fff4e6; border: 2px solid #fb923c; padding: 20px; margin: 24px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(251, 146, 60, 0.1);">
                <p style="color: #ea580c; font-size: 15px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center;">
                  💬 Admin Comments:
                </p>
                <p style="color: #9a3412; font-size: 14px; line-height: 1.8; margin: 0; background: #ffffff; padding: 12px; border-radius: 6px; border-left: 3px solid #fb923c;">${comments}</p>
              </div>
            ` : ''}
            
            ${status === 'verified' ? `
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                You can now access special benefits and services for disabled persons. Keep your registration ID safe for future reference.
              </p>
            ` : status === 'rejected' ? `
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                Please review the comments above and submit the required information or documents. You can contact our support team if you have any questions.
              </p>
            ` : `
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                We will notify you once the review is complete. This usually takes 3-5 business days.
              </p>
            `}
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${statusCheckUrl}" style="display: inline-block; padding: 14px 32px; background: oklch(0.65 0.14 230); color: #fff; font-size: 16px; font-weight: 600; border-radius: 8px; text-decoration: none;">
                View Full Details
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
              If you have any questions, please contact our support team. Please note that emails may sometimes go to your spam folder, so kindly check there as well.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Maceazy</h3>
            <p style="color: #6b7280; font-size: 13px; margin: 0; font-style: italic;">"Making Life easier, For the Disabled"</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">© ${new Date().getFullYear()} Maceazy Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Maceazy <no-reply@austrangesolutions.com>",
    to: email,
    subject,
    html,
  });

  // Also send same status update to guardian if provided and different from primary
  try {
    if (guardianEmail && guardianEmail !== email) {
      await resend.emails.send({
        from: "Maceazy <no-reply@austrangesolutions.com>",
        to: guardianEmail,
        subject,
        html,
      });
    }
  } catch (gErr) {
    console.error("Failed to send status update email to guardian:", gErr);
    // don't throw - failure to notify guardian shouldn't block admin action
  }
}

export async function sendSupportTicketEmail(
  email: string,
  name: string,
  ticketId: string,
  problemCategory: string
): Promise<void> {
  const subject = `Support Ticket Created - ${ticketId}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket Created</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 600px; width: 100%; background: #fff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Support Ticket Created</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">We have received your request</p>
          </div>
          
          <div style="padding: 32px 40px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello <strong>${name}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your support ticket has been successfully created. Our team will review your issue and get back to you shortly.
            </p>
            
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;"><strong>Ticket ID:</strong> <span style="color: #111827; font-family: monospace; font-size: 16px;">${ticketId}</span></p>
              <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Category:</strong> <span style="color: #111827;">${problemCategory}</span></p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              You can track the status of your ticket on our support page using your Ticket ID and email.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
              If you have any additional information to add, please reply to this email.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Maceazy</h3>
            <p style="color: #6b7280; font-size: 13px; margin: 0; font-style: italic;">"Making Life easier, For the Disabled"</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">© ${new Date().getFullYear()} Maceazy Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Maceazy Support <no-reply@austrangesolutions.com>",
    to: email,
    subject,
    html,
  });
}

export async function sendSupportStatusUpdateEmail(
  email: string,
  name: string,
  ticketId: string,
  status: string,
  adminResponse?: string
): Promise<void> {
  const subject = `Support Ticket Updated - ${ticketId}`;
  const statusColor = status === 'resolved' ? '#10b981' : status === 'in-progress' ? '#3b82f6' : '#f59e0b';
  const statusText = status === 'resolved' ? 'Resolved' : status === 'in-progress' ? 'In Progress' : 'Pending';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket Updated</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 600px; width: 100%; background: #fff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Ticket Status Updated</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your ticket status has changed</p>
          </div>
          
          <div style="padding: 32px 40px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello <strong>${name}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              The status of your support ticket <strong>${ticketId}</strong> has been updated.
            </p>
            
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">Current Status</p>
              <span style="display: inline-block; padding: 6px 16px; background-color: ${statusColor}; color: white; border-radius: 9999px; font-weight: 600; font-size: 14px;">
                ${statusText}
              </span>
            </div>

            ${adminResponse ? `
            <div style="border-left: 4px solid #667eea; padding-left: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 12px; font-weight: 600; text-transform: uppercase;">Support Team Response</p>
              <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">${adminResponse}</p>
            </div>
            ` : ''}
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
              Thank you for your patience.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Maceazy</h3>
            <p style="color: #6b7280; font-size: 13px; margin: 0; font-style: italic;">"Making Life easier, For the Disabled"</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">© ${new Date().getFullYear()} Maceazy Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Maceazy Support <no-reply@austrangesolutions.com>",
    to: email,
    subject,
    html,
  });
}