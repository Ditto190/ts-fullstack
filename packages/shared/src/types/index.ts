// Re-export types from @app/db (Drizzle-generated)
export type { User, Post, NewUser, NewPost } from "@app/db";

// Shared API types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
