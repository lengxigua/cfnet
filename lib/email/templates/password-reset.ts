import { baseEmailTemplate } from './base';

/**
 * Password reset email template
 * Sent when a user requests a password reset
 */
export function passwordResetEmailTemplate(params: {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
}): { subject: string; html: string } {
  const { userName, resetUrl, expiresInMinutes } = params;

  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p class="text-muted">
      This link will expire in ${expiresInMinutes} minutes.
    </p>
    <p class="text-muted">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not be changed.
    </p>
  `;

  return {
    subject: 'Reset Your Password - {{SITE_NAME}}',
    html: baseEmailTemplate(content, 'Password Reset'),
  };
}
