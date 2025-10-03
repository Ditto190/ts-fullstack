import { Routes, Route, Link } from 'react-router-dom';
import { UsersPage } from './pages/UsersPage';
import { PostsPage } from './pages/PostsPage';

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Users
              </Link>
              <Link
                to="/posts"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Posts
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/posts" element={<PostsPage />} />
        </Routes>
      </main>
    </div>
  );
}
