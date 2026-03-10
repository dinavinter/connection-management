import { Outlet, Link, useLocation } from 'react-router-dom';
import { Settings, Key, Network } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">OAuth Admin</h1>
          </div>

          <div className="flex space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings size={18} />
              <span>Servers</span>
            </Link>

            <Link
              to="/oauth2-providers"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/oauth2-providers')
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Key size={18} />
              <span>OAuth2 Providers</span>
            </Link>

            <Link
              to="/destinations"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/destinations')
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Network size={18} />
              <span>Destinations</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
