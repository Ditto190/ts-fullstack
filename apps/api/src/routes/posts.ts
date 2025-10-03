import type { FastifyPluginAsync } from "fastify";
import { db } from "@app/db";
import { posts, insertPostSchema } from "@app/db";
import { eq, desc } from "drizzle-orm";
import { validateBody } from "@app/shared/validation-middleware";

export const postRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/posts - List all posts
  server.get("/", async () => {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    return { posts: allPosts };
  });

  // GET /api/posts/:id - Get single post
  server.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const [post] = await db.select().from(posts).where(eq(posts.id, request.params.id));

    if (post === undefined) {
      return reply.code(404).send({ error: "Post not found" });
    }

    return { post };
  });

  // POST /api/posts - Create post
  server.post("/", { preHandler: validateBody(insertPostSchema) }, async (request) => {
    const data = insertPostSchema.parse(request.body);
    const [post] = await db.insert(posts).values(data).returning();
    return { post };
  });

  // PUT /api/posts/:id - Update post
  server.put<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const [updated] = await db
      .update(posts)
      .set(request.body as typeof posts.$inferInsert)
      .where(eq(posts.id, request.params.id))
      .returning();

    if (updated === undefined) {
      return reply.code(404).send({ error: "Post not found" });
    }

    return { post: updated };
  });

  // DELETE /api/posts/:id - Delete post
  server.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const [deleted] = await db.delete(posts).where(eq(posts.id, request.params.id)).returning();

    if (deleted === undefined) {
      return reply.code(404).send({ error: "Post not found" });
    }

    return { post: deleted };
  });
};
