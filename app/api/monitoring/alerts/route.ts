import { NextRequest, NextResponse } from 'next/server';
import { sendAlert, AlertSeverity, checkErrorRateThreshold } from '@/lib/monitoring/alerting';

export const runtime = 'edge';

/**
 * Alert check endpoint
 * Can be called by Cloudflare Cron Trigger to periodically check system health
 *
 * GET /api/monitoring/alerts - Run alert checks
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.MONITORING_TOKEN;

  // Basic auth protection for monitoring endpoint
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const alerts: Array<{ check: string; triggered: boolean }> = [];

  // Example: Check error rate threshold
  // In production, these values would come from Analytics Engine queries
  const errorRateExceeded = await checkErrorRateThreshold({
    errorCount: 0, // TODO: Query from Analytics Engine
    totalRequests: 100,
    thresholdPercent: 5,
  });

  if (errorRateExceeded) {
    await sendAlert({
      severity: AlertSeverity.WARNING,
      title: 'High Error Rate Detected',
      message: 'Error rate has exceeded the configured threshold of 5%.',
      timestamp: new Date().toISOString(),
      metadata: {
        environment: process.env.NODE_ENV || 'unknown',
      },
    });
  }

  alerts.push({ check: 'error_rate', triggered: errorRateExceeded });

  return NextResponse.json({
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      alerts,
    },
  });
}
