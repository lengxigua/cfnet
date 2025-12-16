import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionData,
  SubscriptionStatus,
} from '@/lib/stripe/types';

/**
 * Subscription Repository
 * Handles subscription records
 */
export class SubscriptionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find subscription by ID
   */
  async findById(id: number): Promise<SubscriptionData | null> {
    try {
      const start = Date.now();
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });
      await analytics.trackDatabaseQuery(
        'subscription.findById',
        'subscriptions',
        Date.now() - start,
        { id }
      );
      return subscription ? this.mapToSubscriptionData(subscription) : null;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch subscription with id ${id}`, error);
    }
  }

  /**
   * Find subscription by Stripe subscription ID
   */
  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionData | null> {
    try {
      const start = Date.now();
      const subscription = await this.prisma.subscription.findUnique({
        where: { stripeSubscriptionId },
      });
      await analytics.trackDatabaseQuery(
        'subscription.findByStripeSubscriptionId',
        'subscriptions',
        Date.now() - start,
        { stripeSubscriptionId }
      );
      return subscription ? this.mapToSubscriptionData(subscription) : null;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch subscription with Stripe ID ${stripeSubscriptionId}`,
        error
      );
    }
  }

  /**
   * Find subscriptions by customer ID
   */
  async findByCustomerId(customerId: number): Promise<SubscriptionData[]> {
    try {
      const start = Date.now();
      const subscriptions = await this.prisma.subscription.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });
      await analytics.trackDatabaseQuery(
        'subscription.findByCustomerId',
        'subscriptions',
        Date.now() - start,
        { customerId }
      );
      return subscriptions.map(s => this.mapToSubscriptionData(s));
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch subscriptions for customer ${customerId}`,
        error
      );
    }
  }

  /**
   * Find active subscription by customer ID
   */
  async findActiveByCustomerId(customerId: number): Promise<SubscriptionData | null> {
    try {
      const start = Date.now();
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          customerId,
          status: {
            in: ['active', 'trialing'],
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      await analytics.trackDatabaseQuery(
        'subscription.findActiveByCustomerId',
        'subscriptions',
        Date.now() - start,
        { customerId }
      );
      return subscription ? this.mapToSubscriptionData(subscription) : null;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch active subscription for customer ${customerId}`,
        error
      );
    }
  }

  /**
   * Create a new subscription
   */
  async create(input: CreateSubscriptionInput): Promise<SubscriptionData> {
    try {
      const start = Date.now();
      const subscription = await this.prisma.subscription.create({
        data: {
          customerId: input.customerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          stripePriceId: input.stripePriceId,
          status: input.status,
          currentPeriodStart: input.currentPeriodStart ?? null,
          currentPeriodEnd: input.currentPeriodEnd ?? null,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd ? 1 : 0,
          trialStart: input.trialStart ?? null,
          trialEnd: input.trialEnd ?? null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
      await analytics.trackDatabaseQuery(
        'subscription.create',
        'subscriptions',
        Date.now() - start
      );
      return this.mapToSubscriptionData(subscription);
    } catch (error) {
      throw new DatabaseError('Failed to create subscription', error);
    }
  }

  /**
   * Update subscription by ID
   */
  async update(id: number, input: UpdateSubscriptionInput): Promise<SubscriptionData> {
    try {
      const start = Date.now();
      const updateData: Record<string, unknown> = {};

      if (input.stripePriceId !== undefined) updateData.stripePriceId = input.stripePriceId;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.currentPeriodStart !== undefined)
        updateData.currentPeriodStart = input.currentPeriodStart;
      if (input.currentPeriodEnd !== undefined)
        updateData.currentPeriodEnd = input.currentPeriodEnd;
      if (input.cancelAtPeriodEnd !== undefined)
        updateData.cancelAtPeriodEnd = input.cancelAtPeriodEnd ? 1 : 0;
      if (input.canceledAt !== undefined) updateData.canceledAt = input.canceledAt;
      if (input.endedAt !== undefined) updateData.endedAt = input.endedAt;
      if (input.trialStart !== undefined) updateData.trialStart = input.trialStart;
      if (input.trialEnd !== undefined) updateData.trialEnd = input.trialEnd;
      if (input.metadata !== undefined) {
        updateData.metadata = input.metadata ? JSON.stringify(input.metadata) : null;
      }

      const subscription = await this.prisma.subscription.update({
        where: { id },
        data: updateData,
      });
      await analytics.trackDatabaseQuery(
        'subscription.update',
        'subscriptions',
        Date.now() - start,
        { id }
      );
      return this.mapToSubscriptionData(subscription);
    } catch (error) {
      throw new DatabaseError(`Failed to update subscription with id ${id}`, error);
    }
  }

  /**
   * Update subscription by Stripe subscription ID
   */
  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    input: UpdateSubscriptionInput
  ): Promise<SubscriptionData> {
    try {
      const start = Date.now();
      const updateData: Record<string, unknown> = {};

      if (input.stripePriceId !== undefined) updateData.stripePriceId = input.stripePriceId;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.currentPeriodStart !== undefined)
        updateData.currentPeriodStart = input.currentPeriodStart;
      if (input.currentPeriodEnd !== undefined)
        updateData.currentPeriodEnd = input.currentPeriodEnd;
      if (input.cancelAtPeriodEnd !== undefined)
        updateData.cancelAtPeriodEnd = input.cancelAtPeriodEnd ? 1 : 0;
      if (input.canceledAt !== undefined) updateData.canceledAt = input.canceledAt;
      if (input.endedAt !== undefined) updateData.endedAt = input.endedAt;
      if (input.trialStart !== undefined) updateData.trialStart = input.trialStart;
      if (input.trialEnd !== undefined) updateData.trialEnd = input.trialEnd;
      if (input.metadata !== undefined) {
        updateData.metadata = input.metadata ? JSON.stringify(input.metadata) : null;
      }

      const subscription = await this.prisma.subscription.update({
        where: { stripeSubscriptionId },
        data: updateData,
      });
      await analytics.trackDatabaseQuery(
        'subscription.updateByStripeSubscriptionId',
        'subscriptions',
        Date.now() - start,
        { stripeSubscriptionId }
      );
      return this.mapToSubscriptionData(subscription);
    } catch (error) {
      throw new DatabaseError(
        `Failed to update subscription with Stripe ID ${stripeSubscriptionId}`,
        error
      );
    }
  }

  /**
   * Delete subscription
   */
  async delete(id: number): Promise<void> {
    try {
      const start = Date.now();
      await this.prisma.subscription.delete({
        where: { id },
      });
      await analytics.trackDatabaseQuery(
        'subscription.delete',
        'subscriptions',
        Date.now() - start,
        { id }
      );
    } catch (error) {
      throw new DatabaseError(`Failed to delete subscription with id ${id}`, error);
    }
  }

  /**
   * Check if customer has active subscription
   */
  async hasActiveSubscription(customerId: number): Promise<boolean> {
    try {
      const start = Date.now();
      const count = await this.prisma.subscription.count({
        where: {
          customerId,
          status: {
            in: ['active', 'trialing'],
          },
        },
      });
      await analytics.trackDatabaseQuery(
        'subscription.hasActiveSubscription',
        'subscriptions',
        Date.now() - start,
        { customerId }
      );
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to check active subscription for customer ${customerId}`,
        error
      );
    }
  }

  /**
   * Map Prisma subscription to SubscriptionData
   */
  private mapToSubscriptionData(subscription: {
    id: number;
    customerId: number;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart: number | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: number;
    canceledAt: number | null;
    endedAt: number | null;
    trialStart: number | null;
    trialEnd: number | null;
    metadata: string | null;
    createdAt: number;
    updatedAt: number;
  }): SubscriptionData {
    return {
      id: subscription.id,
      customerId: subscription.customerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      status: subscription.status as SubscriptionStatus,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd === 1,
      canceledAt: subscription.canceledAt,
      endedAt: subscription.endedAt,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
