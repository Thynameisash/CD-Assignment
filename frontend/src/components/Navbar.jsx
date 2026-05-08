import { Link } from 'react-router-dom';
import { useShortlist } from '../hooks/useShortlist';

export default function Navbar() {
  const { count } = useShortlist();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-gray-900">
          CarFinder
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/browse" className="hover:text-primary-600 transition-colors">
            Browse
          </Link>
          <Link
            to="/shortlist"
            className="relative hover:text-primary-600 transition-colors"
          >
            Shortlist
            {count > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
