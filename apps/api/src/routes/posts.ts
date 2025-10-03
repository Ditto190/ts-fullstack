import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@app/db';
import { CreatePostSchema } from '@app/db/types';
import { validateBody } from '@app/shared/validation-middleware';

export const postRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/posts - List all posts
  server.get('/', async (request) => {
    const { published } = request.query as { published?: string };

    const posts = await prisma.post.findMany({
      where: published !== undefined ? { published: published === 'true' } : undefined,
      include: {
        author: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { posts };
  });

  // GET /api/posts/:id - Get single post
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const post = await prisma.post.findUnique({
      where: { id: request.params.id },
      include: { author: true },
    });

    if (post === null) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    return { post };
  });

  // POST /api/posts - Create post
  server.post('/', { preHandler: validateBody(CreatePostSchema) }, async (request) => {
    const data = CreatePostSchema.parse(request.body);
    const post = await prisma.post.create({
      data,
      include: { author: true },
    });
    return { post };
  });

  // PATCH /api/posts/:id/publish - Publish post
  server.patch<{ Params: { id: string } }>('/:id/publish', async (request, reply) => {
    try {
      const post = await prisma.post.update({
        where: { id: request.params.id },
        data: { published: true },
        include: { author: true },
      });
      return { post };
    } catch (error) {
      return reply.code(404).send({ error: 'Post not found' });
    }
  });

  // DELETE /api/posts/:id - Delete post
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const post = await prisma.post.delete({
        where: { id: request.params.id },
      });
      return { post };
    } catch (error) {
      return reply.code(404).send({ error: 'Post not found' });
    }
  });
};
