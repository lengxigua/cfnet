import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';
import type { CreatePaymentInput, PaymentData, PaymentStatus } from '@/lib/stripe/types';

/**
 * Payment Repository
 * Handles one-time payment records
 */
export class PaymentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find payment by ID
   */
  async findById(id: number): Promise<PaymentData | null> {
    try {
      const start = Date.now();
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });
      await analytics.trackDatabaseQuery('payment.findById', 'payments', Date.now() - start, {
        id,
      });
      return payment ? this.mapToPaymentData(payment) : null;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch payment with id ${id}`, error);
    }
  }

  /**
   * Find payment by Stripe Payment Intent ID
   */
  async findByPaymentIntentId(stripePaymentIntentId: string): Promise<PaymentData | null> {
    try {
      const start = Date.now();
      const payment = await this.prisma.payment.findUnique({
        where: { stripePaymentIntentId },
      });
      await analytics.trackDatabaseQuery(
        'payment.findByPaymentIntentId',
        'payments',
        Date.now() - start,
        { stripePaymentIntentId }
      );
      return payment ? this.mapToPaymentData(payment) : null;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch payment with payment intent ${stripePaymentIntentId}`,
        error
      );
    }
  }

  /**
   * Find payment by Stripe Checkout Session ID
   */
  async findByCheckoutSessionId(stripeCheckoutSessionId: string): Promise<PaymentData | null> {
    try {
      const start = Date.now();
      const payment = await this.prisma.payment.findUnique({
        where: { stripeCheckoutSessionId },
      });
      await analytics.trackDatabaseQuery(
        'payment.findByCheckoutSessionId',
        'payments',
        Date.now() - start,
        { stripeCheckoutSessionId }
      );
      return payment ? this.mapToPaymentData(payment) : null;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch payment with checkout session ${stripeCheckoutSessionId}`,
        error
      );
    }
  }

  /**
   * Find payments by customer ID
   */
  async findByCustomerId(
    customerId: number,
    options?: { limit?: number; offset?: number }
  ): Promise<PaymentData[]> {
    try {
      const start = Date.now();
      const payments = await this.prisma.payment.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      });
      await analytics.trackDatabaseQuery(
        'payment.findByCustomerId',
        'payments',
        Date.now() - start,
        { customerId }
      );
      return payments.map(p => this.mapToPaymentData(p));
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch payments for customer ${customerId}`, error);
    }
  }

  /**
   * Create a new payment record
   */
  async create(input: CreatePaymentInput): Promise<PaymentData> {
    try {
      const start = Date.now();
      const payment = await this.prisma.payment.create({
        data: {
          customerId: input.customerId,
          stripePaymentIntentId: input.stripePaymentIntentId ?? null,
          stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
          amount: input.amount,
          currency: input.currency ?? 'usd',
          status: input.status,
          description: input.description ?? null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
      await analytics.trackDatabaseQuery('payment.create', 'payments', Date.now() - start);
      return this.mapToPaymentData(payment);
    } catch (error) {
      throw new DatabaseError('Failed to create payment', error);
    }
  }

  /**
   * Update payment status
   */
  async updateStatus(id: number, status: PaymentStatus): Promise<PaymentData> {
    try {
      const start = Date.now();
      const payment = await this.prisma.payment.update({
        where: { id },
        data: { status },
      });
      await analytics.trackDatabaseQuery('payment.updateStatus', 'payments', Date.now() - start, {
        id,
        status,
      });
      return this.mapToPaymentData(payment);
    } catch (error) {
      throw new DatabaseError(`Failed to update payment status for id ${id}`, error);
    }
  }

  /**
   * Update payment by Payment Intent ID
   */
  async updateByPaymentIntentId(
    stripePaymentIntentId: string,
    data: Partial<Pick<PaymentData, 'status' | 'metadata'>>
  ): Promise<PaymentData | null> {
    try {
      const start = Date.now();
      const updateData: Record<string, unknown> = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.metadata !== undefined) {
        updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
      }

      const payment = await this.prisma.payment.update({
        where: { stripePaymentIntentId },
        data: updateData,
      });
      await analytics.trackDatabaseQuery(
        'payment.updateByPaymentIntentId',
        'payments',
        Date.now() - start,
        { stripePaymentIntentId }
      );
      return this.mapToPaymentData(payment);
    } catch (error) {
      throw new DatabaseError(
        `Failed to update payment with payment intent ${stripePaymentIntentId}`,
        error
      );
    }
  }

  /**
   * Count payments by customer
   */
  async countByCustomerId(customerId: number): Promise<number> {
    try {
      const start = Date.now();
      const count = await this.prisma.payment.count({
        where: { customerId },
      });
      await analytics.trackDatabaseQuery(
        'payment.countByCustomerId',
        'payments',
        Date.now() - start,
        { customerId }
      );
      return count;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to count payments for customer ${customerId}`, error);
    }
  }

  /**
   * Map Prisma payment to PaymentData
   */
  private mapToPaymentData(payment: {
    id: number;
    customerId: number;
    stripePaymentIntentId: string | null;
    stripeCheckoutSessionId: string | null;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    metadata: string | null;
    createdAt: number;
    updatedAt: number;
  }): PaymentData {
    return {
      id: payment.id,
      customerId: payment.customerId,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      stripeCheckoutSessionId: payment.stripeCheckoutSessionId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status as PaymentStatus,
      description: payment.description,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
