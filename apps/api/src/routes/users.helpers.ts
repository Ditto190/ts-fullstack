export type UserAggregateRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  postsCount: number | null;
};

export type UserWithCounts = Omit<UserAggregateRow, 'postsCount'> & {
  _count: {
    posts: number;
  };
};

export function mapUserWithCounts(row: UserAggregateRow): UserWithCounts {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    _count: {
      posts: Number(row.postsCount ?? 0),
    },
  };
}
