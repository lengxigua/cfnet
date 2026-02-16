import { LoggerFactory } from '@/lib/logger';

const logger = LoggerFactory.getLogger('alerting');

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Alert payload sent to webhook
 */
export interface AlertPayload {
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send alert notification via webhook (Slack/Discord compatible)
 */
export async function sendAlert(alert: AlertPayload): Promise<boolean> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('ALERT_WEBHOOK_URL not configured, alert not sent', undefined, {
      title: alert.title,
      severity: alert.severity,
    });
    return false;
  }

  const severityEmoji: Record<AlertSeverity, string> = {
    [AlertSeverity.INFO]: 'information_source',
    [AlertSeverity.WARNING]: 'warning',
    [AlertSeverity.CRITICAL]: 'rotating_light',
  };

  // Format compatible with both Slack and Discord webhooks
  const payload = {
    content: `:${severityEmoji[alert.severity]}: **[${alert.severity.toUpperCase()}]** ${alert.title}`,
    embeds: [
      {
        title: alert.title,
        description: alert.message,
        color:
          alert.severity === AlertSeverity.CRITICAL
            ? 0xff0000
            : alert.severity === AlertSeverity.WARNING
              ? 0xffa500
              : 0x00ff00,
        timestamp: alert.timestamp,
        fields: alert.metadata
          ? Object.entries(alert.metadata).map(([name, value]) => ({
              name,
              value: String(value),
              inline: true,
            }))
          : [],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Alert webhook failed', new Error(`HTTP ${response.status}`), {
        title: alert.title,
      });
      return false;
    }

    logger.info('Alert sent successfully', { title: alert.title });
    return true;
  } catch (error) {
    logger.error('Alert sending failed', error as Error, {
      title: alert.title,
    });
    return false;
  }
}

/**
 * Error rate threshold check
 * Returns true if error rate exceeds threshold
 */
export async function checkErrorRateThreshold(params: {
  errorCount: number;
  totalRequests: number;
  thresholdPercent: number;
}): Promise<boolean> {
  const { errorCount, totalRequests, thresholdPercent } = params;

  if (totalRequests === 0) return false;

  const errorRate = (errorCount / totalRequests) * 100;
  return errorRate > thresholdPercent;
}
