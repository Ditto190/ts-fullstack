import { Card, CardContent, CardHeader, CardTitle } from '@adaptiveworx/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { posts: number };
}

export function UsersPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<{ users: User[] }> => api.get('/users'),
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  if (error !== null) {
    return <div className="text-center py-12 text-red-600">Error loading users</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <p className="text-sm text-gray-600">A list of all users in your application.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Name
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Posts
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {user.name ?? 'Anonymous'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user._count.posts}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
