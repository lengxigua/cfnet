import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceData,
  InvoiceStatus,
} from '@/lib/stripe/types';

/**
 * Invoice Repository
 * Handles invoice records
 */
export class InvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find invoice by ID
   */
  async findById(id: number): Promise<InvoiceData | null> {
    try {
      const start = Date.now();
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });
      await analytics.trackDatabaseQuery('invoice.findById', 'invoices', Date.now() - start, {
        id,
      });
      return invoice ? this.mapToInvoiceData(invoice) : null;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch invoice with id ${id}`, error);
    }
  }

  /**
   * Find invoice by Stripe invoice ID
   */
  async findByStripeInvoiceId(stripeInvoiceId: string): Promise<InvoiceData | null> {
    try {
      const start = Date.now();
      const invoice = await this.prisma.invoice.findUnique({
        where: { stripeInvoiceId },
      });
      await analytics.trackDatabaseQuery(
        'invoice.findByStripeInvoiceId',
        'invoices',
        Date.now() - start,
        { stripeInvoiceId }
      );
      return invoice ? this.mapToInvoiceData(invoice) : null;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch invoice with Stripe ID ${stripeInvoiceId}`,
        error
      );
    }
  }

  /**
   * Find invoices by customer ID
   */
  async findByCustomerId(
    customerId: number,
    options?: { limit?: number; offset?: number }
  ): Promise<InvoiceData[]> {
    try {
      const start = Date.now();
      const invoices = await this.prisma.invoice.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      });
      await analytics.trackDatabaseQuery(
        'invoice.findByCustomerId',
        'invoices',
        Date.now() - start,
        { customerId }
      );
      return invoices.map(i => this.mapToInvoiceData(i));
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch invoices for customer ${customerId}`, error);
    }
  }

  /**
   * Find invoices by subscription ID
   */
  async findBySubscriptionId(subscriptionId: number): Promise<InvoiceData[]> {
    try {
      const start = Date.now();
      const invoices = await this.prisma.invoice.findMany({
        where: { subscriptionId },
        orderBy: { createdAt: 'desc' },
      });
      await analytics.trackDatabaseQuery(
        'invoice.findBySubscriptionId',
        'invoices',
        Date.now() - start,
        { subscriptionId }
      );
      return invoices.map(i => this.mapToInvoiceData(i));
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch invoices for subscription ${subscriptionId}`,
        error
      );
    }
  }

  /**
   * Create a new invoice
   */
  async create(input: CreateInvoiceInput): Promise<InvoiceData> {
    try {
      const start = Date.now();
      const invoice = await this.prisma.invoice.create({
        data: {
          customerId: input.customerId,
          subscriptionId: input.subscriptionId ?? null,
          stripeInvoiceId: input.stripeInvoiceId,
          amountDue: input.amountDue,
          amountPaid: input.amountPaid ?? 0,
          currency: input.currency ?? 'usd',
          status: input.status,
          invoiceUrl: input.invoiceUrl ?? null,
          invoicePdf: input.invoicePdf ?? null,
          periodStart: input.periodStart ?? null,
          periodEnd: input.periodEnd ?? null,
        },
      });
      await analytics.trackDatabaseQuery('invoice.create', 'invoices', Date.now() - start);
      return this.mapToInvoiceData(invoice);
    } catch (error) {
      throw new DatabaseError('Failed to create invoice', error);
    }
  }

  /**
   * Update invoice
   */
  async update(id: number, input: UpdateInvoiceInput): Promise<InvoiceData> {
    try {
      const start = Date.now();
      const updateData: Record<string, unknown> = {};

      if (input.amountPaid !== undefined) updateData.amountPaid = input.amountPaid;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.invoiceUrl !== undefined) updateData.invoiceUrl = input.invoiceUrl;
      if (input.invoicePdf !== undefined) updateData.invoicePdf = input.invoicePdf;

      const invoice = await this.prisma.invoice.update({
        where: { id },
        data: updateData,
      });
      await analytics.trackDatabaseQuery('invoice.update', 'invoices', Date.now() - start, {
        id,
      });
      return this.mapToInvoiceData(invoice);
    } catch (error) {
      throw new DatabaseError(`Failed to update invoice with id ${id}`, error);
    }
  }

  /**
   * Update invoice by Stripe invoice ID
   */
  async updateByStripeInvoiceId(
    stripeInvoiceId: string,
    input: UpdateInvoiceInput
  ): Promise<InvoiceData> {
    try {
      const start = Date.now();
      const updateData: Record<string, unknown> = {};

      if (input.amountPaid !== undefined) updateData.amountPaid = input.amountPaid;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.invoiceUrl !== undefined) updateData.invoiceUrl = input.invoiceUrl;
      if (input.invoicePdf !== undefined) updateData.invoicePdf = input.invoicePdf;

      const invoice = await this.prisma.invoice.update({
        where: { stripeInvoiceId },
        data: updateData,
      });
      await analytics.trackDatabaseQuery(
        'invoice.updateByStripeInvoiceId',
        'invoices',
        Date.now() - start,
        { stripeInvoiceId }
      );
      return this.mapToInvoiceData(invoice);
    } catch (error) {
      throw new DatabaseError(`Failed to update invoice with Stripe ID ${stripeInvoiceId}`, error);
    }
  }

  /**
   * Map Prisma invoice to InvoiceData
   */
  private mapToInvoiceData(invoice: {
    id: number;
    customerId: number;
    subscriptionId: number | null;
    stripeInvoiceId: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    status: string;
    invoiceUrl: string | null;
    invoicePdf: string | null;
    periodStart: number | null;
    periodEnd: number | null;
    createdAt: number;
    updatedAt: number;
  }): InvoiceData {
    return {
      id: invoice.id,
      customerId: invoice.customerId,
      subscriptionId: invoice.subscriptionId,
      stripeInvoiceId: invoice.stripeInvoiceId,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      currency: invoice.currency,
      status: invoice.status as InvoiceStatus,
      invoiceUrl: invoice.invoiceUrl,
      invoicePdf: invoice.invoicePdf,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
