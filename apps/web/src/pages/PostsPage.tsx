import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Post {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: string;
  author: {
    name: string | null;
    email: string;
  };
}

export function PostsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async (): Promise<{ posts: Post[] }> => api.get('/posts'),
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading posts...</div>;
  }

  if (error !== null) {
    return <div className="text-center py-12 text-red-600">Error loading posts</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all blog posts.</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {data?.posts.map((post) => (
          <article
            key={post.id}
            className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
              {post.published ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                  Draft
                </span>
              )}
            </div>
            {post.content !== null && post.content.length > 0 && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.content}</p>
            )}
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>{post.author.name ?? post.author.email}</span>
              <span className="mx-2">·</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
