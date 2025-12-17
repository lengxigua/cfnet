import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';
import type { CreateCustomerInput, CustomerData } from '@/lib/stripe/types';

/**
 * Customer Repository
 * Handles Stripe customer data persistence
 */
export class CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find customer by ID
   */
  async findById(id: number): Promise<CustomerData | null> {
    try {
      const start = Date.now();
      const customer = await this.prisma.customer.findUnique({
        where: { id },
      });
      await analytics.trackDatabaseQuery('customer.findById', 'customers', Date.now() - start, {
        id,
      });
      return customer ? this.mapToCustomerData(customer) : null;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch customer with id ${id}`, error);
    }
  }

  /**
   * Find customer by user ID
   */
  async findByUserId(userId: number): Promise<CustomerData | null> {
    try {
      const start = Date.now();
      const customer = await this.prisma.customer.findUnique({
        where: { userId },
      });
      await analytics.trackDatabaseQuery('customer.findByUserId', 'customers', Date.now() - start, {
        userId,
      });
      return customer ? this.mapToCustomerData(customer) : null;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch customer for user ${userId}`, error);
    }
  }

  /**
   * Find customer by Stripe customer ID
   */
  async findByStripeCustomerId(stripeCustomerId: string): Promise<CustomerData | null> {
    try {
      const start = Date.now();
      const customer = await this.prisma.customer.findUnique({
        where: { stripeCustomerId },
      });
      await analytics.trackDatabaseQuery(
        'customer.findByStripeCustomerId',
        'customers',
        Date.now() - start,
        { stripeCustomerId }
      );
      return customer ? this.mapToCustomerData(customer) : null;
    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to fetch customer with Stripe ID ${stripeCustomerId}`,
        error
      );
    }
  }

  /**
   * Create a new customer
   */
  async create(input: CreateCustomerInput & { stripeCustomerId: string }): Promise<CustomerData> {
    try {
      const start = Date.now();
      const customer = await this.prisma.customer.create({
        data: {
          userId: input.userId,
          stripeCustomerId: input.stripeCustomerId,
          email: input.email,
          name: input.name ?? null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
      await analytics.trackDatabaseQuery('customer.create', 'customers', Date.now() - start);
      return this.mapToCustomerData(customer);
    } catch (error) {
      throw new DatabaseError('Failed to create customer', error);
    }
  }

  /**
   * Update customer
   */
  async update(
    id: number,
    data: Partial<Pick<CustomerData, 'email' | 'name' | 'metadata'>>
  ): Promise<CustomerData> {
    try {
      const start = Date.now();
      const updateData: Record<string, unknown> = {};

      if (data.email !== undefined) updateData.email = data.email;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.metadata !== undefined) {
        updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
      }

      const customer = await this.prisma.customer.update({
        where: { id },
        data: updateData,
      });
      await analytics.trackDatabaseQuery('customer.update', 'customers', Date.now() - start, {
        id,
      });
      return this.mapToCustomerData(customer);
    } catch (error) {
      throw new DatabaseError(`Failed to update customer with id ${id}`, error);
    }
  }

  /**
   * Delete customer
   */
  async delete(id: number): Promise<void> {
    try {
      const start = Date.now();
      await this.prisma.customer.delete({
        where: { id },
      });
      await analytics.trackDatabaseQuery('customer.delete', 'customers', Date.now() - start, {
        id,
      });
    } catch (error) {
      throw new DatabaseError(`Failed to delete customer with id ${id}`, error);
    }
  }

  /**
   * Check if customer exists for user
   */
  async existsForUser(userId: number): Promise<boolean> {
    try {
      const start = Date.now();
      const count = await this.prisma.customer.count({
        where: { userId },
      });
      await analytics.trackDatabaseQuery(
        'customer.existsForUser',
        'customers',
        Date.now() - start,
        { userId }
      );
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to check customer existence for user ${userId}`, error);
    }
  }

  /**
   * Map Prisma customer to CustomerData
   */
  private mapToCustomerData(customer: {
    id: number;
    userId: number;
    stripeCustomerId: string;
    email: string | null;
    name: string | null;
    metadata: string | null;
    createdAt: number;
    updatedAt: number;
  }): CustomerData {
    return {
      id: customer.id,
      userId: customer.userId,
      stripeCustomerId: customer.stripeCustomerId,
      email: customer.email,
      name: customer.name,
      metadata: customer.metadata ? JSON.parse(customer.metadata) : null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
