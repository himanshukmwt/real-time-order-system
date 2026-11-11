import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-brand-600'
        : 'text-gray-600 hover:text-brand-600'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left — Logo */}
          <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl">
            <Package className="h-6 w-6" />
            <span>ShopFlow</span>
          </Link>

          {/* Center — Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
          </div>

          {/* Right (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin/products"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-4 py-3">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              Products
            </NavLink>

            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center">
                  Register
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 space-y-1">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
