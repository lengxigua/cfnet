import { RepositoryFactory } from '@/repositories';
import { LoggerFactory } from '@/lib/logger';

const logger = LoggerFactory.getLogger('audit');

/**
 * Audit action types
 */
export enum AuditAction {
  // User actions
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_REGISTER = 'user.register',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_PASSWORD_CHANGE = 'user.password_change',

  // Data actions
  POST_CREATE = 'post.create',
  POST_UPDATE = 'post.update',
  POST_DELETE = 'post.delete',

  // File actions
  FILE_UPLOAD = 'file.upload',
  FILE_DELETE = 'file.delete',

  // Payment actions
  PAYMENT_CREATE = 'payment.create',
  SUBSCRIPTION_CREATE = 'subscription.create',
  SUBSCRIPTION_CANCEL = 'subscription.cancel',

  // GDPR actions
  GDPR_DATA_EXPORT = 'gdpr.data_export',
  GDPR_ACCOUNT_DELETE = 'gdpr.account_delete',

  // Admin actions
  ADMIN_USER_UPDATE = 'admin.user_update',
  ADMIN_USER_DELETE = 'admin.user_delete',
}

/**
 * Resource types for audit logs
 */
export enum AuditResource {
  USER = 'user',
  POST = 'post',
  FILE = 'file',
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
  SYSTEM = 'system',
}

/**
 * Log an audit event
 * Fire-and-forget: does not throw on failure
 */
export async function logAuditEvent(
  repos: RepositoryFactory,
  params: {
    userId?: number | null;
    action: AuditAction | string;
    resourceType: AuditResource | string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    await repos.auditLogs.create({
      userId: params.userId ?? null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  } catch (error) {
    // Audit logging should never break the main flow
    logger.error('Failed to write audit log', error as Error, {
      action: params.action,
      resourceType: params.resourceType,
    });
  }
}
