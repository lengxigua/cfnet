import { baseEmailTemplate } from './base';

/**
 * Welcome email template
 * Sent to users after successful registration
 */
export function welcomeEmailTemplate(params: { userName: string; loginUrl: string }): {
  subject: string;
  html: string;
} {
  const { userName, loginUrl } = params;

  const content = `
    <h2>Welcome, ${userName}!</h2>
    <p>Thank you for creating an account. We're excited to have you on board.</p>
    <p>You can now access all features by logging into your account:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" class="button">Go to Dashboard</a>
    </p>
    <p class="text-muted">
      If you didn't create this account, please ignore this email.
    </p>
  `;

  return {
    subject: 'Welcome to {{SITE_NAME}}!',
    html: baseEmailTemplate(content, 'Welcome'),
  };
}
