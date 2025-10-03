import { z } from 'zod';

// Zod schemas for Prisma models (runtime validation)
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PostSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1),
  content: z.string().nullable(),
  published: z.boolean(),
  authorId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.pick({
  email: true,
  name: true,
});

export const CreatePostSchema = PostSchema.pick({
  title: true,
  content: true,
  published: true,
  authorId: true,
});

export type User = z.infer<typeof UserSchema>;
export type Post = z.infer<typeof PostSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
