import { Resend } from 'resend';
import { LoggerFactory } from '@/lib/logger';

const logger = LoggerFactory.getLogger('email');

/**
 * Email client wrapper for Resend
 * Provides a simple interface for sending transactional emails
 */

let resendClient: Resend | null = null;

/**
 * Get or create Resend client instance
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not configured, email sending disabled');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Get the configured "from" email address
 */
function getFromEmail(): string {
  return process.env.FROM_EMAIL || 'noreply@{{YOUR_DOMAIN}}';
}

/**
 * Send a transactional email
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();

  if (!client) {
    logger.info('Email not sent (Resend not configured)', {
      to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      subject: params.subject,
    });
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await client.emails.send({
      from: params.from || getFromEmail(),
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (result.error) {
      logger.error('Failed to send email', new Error(result.error.message), {
        to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
      });
      return { success: false, error: result.error.message };
    }

    logger.info('Email sent successfully', {
      id: result.data?.id,
      to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      subject: params.subject,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    logger.error('Email sending failed', error as Error, {
      to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      subject: params.subject,
    });
    return { success: false, error: (error as Error).message };
  }
}
