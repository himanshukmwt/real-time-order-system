import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  Mail,
  User,
  Shield,
  Calendar,
  Package,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function truncateId(id) {
  if (!id) return '';
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

// Deterministic color based on name
const avatarColors = [
  'bg-brand-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-violet-600',
  'bg-teal-600',
  'bg-pink-600',
];

function getAvatarColor(name) {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function Profile() {
  const { user, logout } = useAuth();

  const recentOrders = useMemo(() => {
    try {
      const raw = localStorage.getItem('shopflow_orders');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
  };

  const initials = getInitials(user?.name);
  const avatarColor = getAvatarColor(user?.name);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header / Hero */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800" />
        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row items-center sm:items-end gap-4">
          <div
            className={`w-24 h-24 ${avatarColor} rounded-full flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg shrink-0`}
          >
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left sm:pb-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 capitalize">
            <Shield className="w-3.5 h-3.5" />
            {user?.role || 'user'}
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{user?.role || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Recent Orders</h2>
          {recentOrders.length > 0 && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {recentOrders.length} order{recentOrders.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              When you place orders, they&apos;ll appear here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
            >
              Start shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order, idx) => (
              <div
                key={order.orderId || idx}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Package className="w-4.5 h-4.5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      #{truncateId(order.orderId)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">
                    ${Number(order.totalAmount || 0).toFixed(2)}
                  </span>
                  <Link
                    to={`/orders/${order.orderId}/status`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    Track
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="flex justify-end">
        <button onClick={handleLogout} className="btn-danger flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
