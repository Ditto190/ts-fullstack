import { db, insertUserSchema, posts, users } from '@adaptiveworx/db';
import { validateBody } from '@adaptiveworx/shared/validation-middleware';
import { desc, eq, sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { mapUserWithCounts } from './users.helpers.js';
export type { UserWithCounts } from './users.helpers.js';

export const userRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/users - List all users
  server.get('/', async () => {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        postsCount: sql<number>`COALESCE(COUNT(${posts.id}), 0)`,
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));

    return { users: allUsers.map(mapUserWithCounts) };
  });

  // GET /api/users/:id - Get single user
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        postsCount: sql<number>`COALESCE(COUNT(${posts.id}), 0)`,
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .where(eq(users.id, request.params.id))
      .groupBy(users.id);

    if (user === undefined) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return { user: mapUserWithCounts(user) };
  });

  // POST /api/users - Create user
  server.post('/', { preHandler: validateBody(insertUserSchema) }, async (request) => {
    const data = insertUserSchema.parse(request.body);
    // Type assertion needed due to exactOptionalPropertyTypes + Drizzle insert types
    const [user] = await db
      .insert(users)
      .values(data as typeof users.$inferInsert)
      .returning();
    return { user };
  });

  // DELETE /api/users/:id - Delete user
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const [deleted] = await db.delete(users).where(eq(users.id, request.params.id)).returning();

    if (deleted === undefined) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return { user: deleted };
  });
};
