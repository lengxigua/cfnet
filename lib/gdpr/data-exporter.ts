import { RepositoryFactory } from '@/repositories';
import { LoggerFactory } from '@/lib/logger';

const logger = LoggerFactory.getLogger('gdpr:data-exporter');

/**
 * GDPR Data Exporter
 * Collects and formats all user data for export
 */

export interface UserDataExport {
  exportedAt: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    createdAt: number;
    updatedAt: number;
  };
  posts: Array<{
    id: number;
    title: string;
    content: string | null;
    published: boolean;
    createdAt: number;
  }>;
  accounts: Array<{
    provider: string;
    type: string;
  }>;
}

/**
 * Export all data belonging to a user
 */
export async function exportUserData(
  userId: number,
  repos: RepositoryFactory
): Promise<UserDataExport> {
  logger.info('Exporting user data', { userId });

  // Fetch user profile
  const user = await repos.users.findById(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Fetch user posts
  const posts = await repos.posts.findByUserId(userId);

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    posts: posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt,
    })),
    accounts: [], // OAuth accounts (provider info only, no tokens)
  };
}
