import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';
import type { WebhookEventData } from '@/lib/stripe/types';

/**
 * Webhook Event Repository
 * Handles webhook event idempotency tracking
 */
export class WebhookEventRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find webhook event by Stripe event ID
   */
  async findByStripeEventId(stripeEventId: string): Promise<WebhookEventData | null> {
    try {
      const start = Date.now();
      const event = await this.prisma.webhookEvent.findUnique({
        where: { stripeEventId },
      });
      await analytics.trackDatabaseQuery(
        'webhookEvent.findByStripeEventId',
        'webhook_events',
        Date.now() - start,
        { stripeEventId }
      );
      return event;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch webhook event with Stripe ID ${stripeEventId}`,
        error
      );
    }
  }

  /**
   * Check if webhook event has been processed
   */
  async isProcessed(stripeEventId: string): Promise<boolean> {
    try {
      const start = Date.now();
      const count = await this.prisma.webhookEvent.count({
        where: { stripeEventId },
      });
      await analytics.trackDatabaseQuery(
        'webhookEvent.isProcessed',
        'webhook_events',
        Date.now() - start,
        { stripeEventId }
      );
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to check if webhook event ${stripeEventId} is processed`,
        error
      );
    }
  }

  /**
   * Mark webhook event as processed
   */
  async markProcessed(stripeEventId: string, eventType: string): Promise<WebhookEventData> {
    try {
      const start = Date.now();
      const event = await this.prisma.webhookEvent.create({
        data: {
          stripeEventId,
          eventType,
        },
      });
      await analytics.trackDatabaseQuery(
        'webhookEvent.markProcessed',
        'webhook_events',
        Date.now() - start,
        { stripeEventId, eventType }
      );
      return event;
    } catch (error) {
      throw new DatabaseError(`Failed to mark webhook event ${stripeEventId} as processed`, error);
    }
  }

  /**
   * Clean up old webhook events (older than 30 days)
   */
  async cleanupOldEvents(olderThanDays: number = 30): Promise<number> {
    try {
      const start = Date.now();
      const cutoffTimestamp = Math.floor(Date.now() / 1000) - olderThanDays * 24 * 60 * 60;

      const result = await this.prisma.webhookEvent.deleteMany({
        where: {
          processedAt: {
            lt: cutoffTimestamp,
          },
        },
      });
      await analytics.trackDatabaseQuery(
        'webhookEvent.cleanupOldEvents',
        'webhook_events',
        Date.now() - start,
        { olderThanDays, deletedCount: result.count }
      );
      return result.count;
    } catch (error) {
      throw new DatabaseError('Failed to cleanup old webhook events', error);
    }
  }
}
