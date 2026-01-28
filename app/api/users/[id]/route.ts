import { NextRequest } from 'next/server';
import { successResponse, noContentResponse, withRepositories, withRateLimit } from '@/lib/api';
import { createCacheClient } from '@/lib/cache/client';
import { ResourceNotFoundError, ResourceAlreadyExistsError } from '@/lib/errors';
import { validateIntegerId, parseAndValidateBody, userUpdateSchema } from '@/lib/validators';

export const runtime = 'edge';

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRepositories(request, async repos => {
    const { id } = await params;
    const userId = validateIntegerId(id, 'User ID');

    // DB operation: query user (with posts)
    const user = await repos.users.findByIdWithPosts(userId, 10);

    // Check whether user exists
    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    return successResponse(user, 'User retrieved successfully');
  });
}

// PATCH /api/users/[id] - Update user
// Note: Rate limit applied (10/min) to prevent abuse
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRateLimit(
    request,
    async () => {
      return withRepositories(request, async repos => {
        const { id } = await params;
        const userId = validateIntegerId(id, 'User ID');

        // Parse and validate request body using shared validator
        const { email, name } = await parseAndValidateBody(request, userUpdateSchema);

        // Check whether user exists
        const exists = await repos.users.exists(userId);
        if (!exists) {
          throw new ResourceNotFoundError('User');
        }

        // Check email uniqueness if updating email
        if (email) {
          const emailExists = await repos.users.existsByEmail(email);
          if (emailExists) {
            // Get current user to check if it's the same email
            const currentUser = await repos.users.findById(userId);
            if (currentUser && currentUser.email !== email) {
              throw new ResourceAlreadyExistsError('User with this email');
            }
          }
        }

        // DB operation: update user
        const user = await repos.users.update(userId, {
          ...(email && { email }),
          ...(name !== undefined && { name }),
        });

        // Clear cache
        const cache = createCacheClient();
        await cache?.delete('users:all');
        await cache?.delete(`user:${userId}`);

        return successResponse(user, 'User updated successfully');
      });
    },
    { maxRequests: 10, windowSeconds: 60 }
  );
}

// DELETE /api/users/[id] - Delete user
// Note: Strict rate limit applied (5/min) to prevent abuse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      return withRepositories(request, async repos => {
        const { id } = await params;
        const userId = validateIntegerId(id, 'User ID');

        // Check whether user exists
        const exists = await repos.users.exists(userId);
        if (!exists) {
          throw new ResourceNotFoundError('User');
        }

        // DB operation: delete user (cascade delete related posts)
        await repos.users.delete(userId);

        // Clear cache
        const cache = createCacheClient();
        await cache?.delete('users:all');
        await cache?.delete(`user:${userId}`);

        return noContentResponse();
      });
    },
    { maxRequests: 5, windowSeconds: 60 }
  );
}
