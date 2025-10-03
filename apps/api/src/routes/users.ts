import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@app/db';
import { CreateUserSchema } from '@app/db/types';
import { validateBody } from '@app/shared/validation-middleware';

export const userRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/users - List all users
  server.get('/', async () => {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { users };
  });

  // GET /api/users/:id - Get single user
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.params.id },
      include: { posts: true },
    });

    if (user === null) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return { user };
  });

  // POST /api/users - Create user
  server.post('/', { preHandler: validateBody(CreateUserSchema) }, async (request) => {
    const data = CreateUserSchema.parse(request.body);
    const user = await prisma.user.create({ data });
    return { user };
  });

  // DELETE /api/users/:id - Delete user
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const user = await prisma.user.delete({
        where: { id: request.params.id },
      });
      return { user };
    } catch (error) {
      return reply.code(404).send({ error: 'User not found' });
    }
  });
};
