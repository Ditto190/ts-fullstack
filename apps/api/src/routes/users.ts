import type { FastifyPluginAsync } from "fastify";
import { db } from "@app/db";
import { users, insertUserSchema } from "@app/db";
import { eq, desc } from "drizzle-orm";
import { validateBody } from "@app/shared/validation-middleware";

export const userRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/users - List all users
  server.get("/", async () => {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return { users: allUsers };
  });

  // GET /api/users/:id - Get single user
  server.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const [user] = await db.select().from(users).where(eq(users.id, request.params.id));

    if (user === undefined) {
      return reply.code(404).send({ error: "User not found" });
    }

    return { user };
  });

  // POST /api/users - Create user
  server.post("/", { preHandler: validateBody(insertUserSchema) }, async (request) => {
    const data = insertUserSchema.parse(request.body);
    const [user] = await db.insert(users).values(data).returning();
    return { user };
  });

  // DELETE /api/users/:id - Delete user
  server.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const [deleted] = await db.delete(users).where(eq(users.id, request.params.id)).returning();

    if (deleted === undefined) {
      return reply.code(404).send({ error: "User not found" });
    }

    return { user: deleted };
  });
};
