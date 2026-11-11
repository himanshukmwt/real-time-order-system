import { NavLink, Outlet, Link } from 'react-router-dom';
import { Package, PlusCircle, ArrowLeft } from 'lucide-react';

const sidebarLinks = [
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/products/new', label: 'Add Product', icon: PlusCircle },
];

export default function AdminLayout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-gray-300 hover:bg-brand-900 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-brand-950">
        {/* Title */}
        <div className="flex h-16 items-center gap-2 border-b border-brand-900 px-6">
          <Package className="h-6 w-6 text-brand-400" />
          <span className="text-lg font-bold text-white">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={linkClass}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Back to store */}
        <div className="border-t border-brand-900 px-3 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-brand-900 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile top bar for admin */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between bg-brand-950 px-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-400" />
          <span className="text-base font-bold text-white">Admin Panel</span>
        </div>
        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Store
        </Link>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-brand-900 bg-brand-950">
        {sidebarLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-400' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Content area */}
      <main className="flex-1 bg-gray-50 md:overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 mt-14 md:mt-0 mb-16 md:mb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
