// Re-export types from @app/db
export type { User, Post, CreateUser, CreatePost } from '@app/db/types';

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
