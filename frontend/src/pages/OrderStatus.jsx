import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CreditCard,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  Ban,
  AlertTriangle,
  ArrowLeft,
  User,
  ShoppingBag,
} from 'lucide-react';
import useOrderPolling from '../hooks/useOrderPolling';
import OrderStatusStepper from '../components/ui/OrderStatusStepper';

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending',
    message: 'Your order is being processed. Payment verification in progress...',
  },
  PAYMENT_CONFIRMED: {
    icon: CreditCard,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Payment Confirmed',
    message: 'Payment confirmed! Your order is being prepared.',
  },
  PREPARING: {
    icon: ChefHat,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Preparing',
    message: "We're preparing your order. It'll be ready soon!",
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Out for Delivery',
    message: 'Your order is on its way! 🚚',
  },
  DELIVERED: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Delivered',
    message: 'Your order has been delivered! Thank you for shopping with us. 🎉',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Failed',
    message: 'Payment failed. Your stock has been restored. Please try again.',
  },
  CANCELLED: {
    icon: Ban,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Cancelled',
    message: 'This order has been cancelled.',
  },
};

const TERMINAL_STATUSES = ['DELIVERED', 'FAILED', 'CANCELLED'];

export default function OrderStatus() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { status, updatedAt, loading, error } = useOrderPolling(orderId);

  // const status = order?.status || 'PENDING';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;
  const isTerminal = TERMINAL_STATUSES.includes(status);

  const timeAgo = useMemo(() => {
    if (!updatedAt) return null;
    const seconds = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }, [updatedAt]);

  // Loading skeleton
  if (loading && !status) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />

          {/* Stepper skeleton */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Status card skeleton */}
          <div className="card p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-400" strokeWidth={1.5} />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Order Not Found</h2>
          <p className="mt-2 text-gray-500">
            We couldn't find the order you're looking for. It may have been removed or the link is incorrect.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary inline-flex items-center gap-2 mt-6"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const truncatedId = orderId.length > 12
    ? `${orderId.slice(0, 8)}...${orderId.slice(-4)}`
    : orderId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Order ID:{' '}
          <span
            className="font-mono text-gray-700 cursor-help"
            title={orderId}
          >
            {truncatedId}
          </span>
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <OrderStatusStepper status={status} updatedAt={updatedAt} />
      </div>

      {/* Status Detail Card */}
      <div className={`card border ${config.borderColor} overflow-hidden`}>
        <div className={`${config.bgColor} px-6 py-8 sm:px-8 sm:py-10`}>
          <div className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full bg-white/80 shadow-sm ${config.color} mb-4`}>
              <StatusIcon className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${config.color}`}>
              {config.label}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-md">
              {config.message}
            </p>
            {timeAgo && (
              <p className="mt-3 text-xs text-gray-400">
                Last updated: {timeAgo}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 sm:px-8">
          {/* Live tracking indicator */}
          {!isTerminal && (
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm text-green-600 font-medium">Live tracking active...</span>
            </div>
          )}

          {/* Terminal state actions */}
          {isTerminal && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-2">
              <Link
                to="/products"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
              <Link
                to="/profile"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Profile
              </Link>
            </div>
          )}

          {/* Non-terminal link to profile */}
          {!isTerminal && (
            <div className="text-center pt-1 pb-2">
              <Link
                to="/profile"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                View Profile →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
