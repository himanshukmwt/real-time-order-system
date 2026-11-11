import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl sm:text-9xl font-extrabold text-brand-600/20 select-none">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mt-3 text-gray-500 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 mt-8"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
