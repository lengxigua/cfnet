import { PrismaClient } from '@prisma/client';
import { DatabaseQueryError } from '@/lib/errors';

/**
 * Audit Log Repository
 * Handles database operations for audit log entries
 */
export class AuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new audit log entry
   */
  async create(data: {
    userId?: number | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId ?? null,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId ?? null,
          details: data.details ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
        },
      });
    } catch (error) {
      throw new DatabaseQueryError('Failed to create audit log', error);
    }
  }

  /**
   * Find audit logs by user ID
   */
  async findByUserId(userId: number, limit = 50, offset = 0) {
    try {
      return await this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch audit logs by user', error);
    }
  }

  /**
   * Find audit logs by action type
   */
  async findByAction(action: string, limit = 50, offset = 0) {
    try {
      return await this.prisma.auditLog.findMany({
        where: { action },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch audit logs by action', error);
    }
  }

  /**
   * Find recent audit logs
   */
  async findRecent(limit = 100) {
    try {
      return await this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: { select: { email: true, name: true } } },
      });
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch recent audit logs', error);
    }
  }

  /**
   * Delete audit logs older than a given timestamp
   */
  async deleteOlderThan(timestamp: number) {
    try {
      return await this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: timestamp } },
      });
    } catch (error) {
      throw new DatabaseQueryError('Failed to delete old audit logs', error);
    }
  }
}
