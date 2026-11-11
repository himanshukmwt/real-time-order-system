import {
  Clock,
  CreditCard,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', icon: CreditCard },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_MESSAGES = {
  PENDING: 'Your order has been placed and is awaiting confirmation.',
  PAYMENT_CONFIRMED: 'Payment received! Your order will be prepared shortly.',
  PREPARING: 'Your order is being prepared with care.',
  OUT_FOR_DELIVERY: 'Your order is on its way to you!',
  DELIVERED: 'Your order has been delivered. Enjoy!',
  FAILED: 'Something went wrong with your order. Please contact support.',
  CANCELLED: 'This order has been cancelled.',
};

export default function OrderStatusStepper({ status, updatedAt }) {
  const isFailed = status === 'FAILED';
  const isCancelled = status === 'CANCELLED';
  const isTerminalError = isFailed || isCancelled;

  const currentStepIndex = STEPS.findIndex((s) => s.key === status);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (isTerminalError) {
    const Icon = isFailed ? XCircle : Ban;
    const colorClasses = isFailed
      ? { border: 'border-red-200', bg: 'bg-red-50', iconBg: 'bg-red-100', icon: 'text-red-500', title: 'text-red-700', text: 'text-red-600' }
      : { border: 'border-orange-200', bg: 'bg-orange-50', iconBg: 'bg-orange-100', icon: 'text-orange-500', title: 'text-orange-700', text: 'text-orange-600' };

    return (
      <div className="w-full">
        {/* <div className={`flex flex-col items-center gap-3 rounded-xl border-2 border-${color}-200 bg-${color}-50 p-6`}>
          <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-${color}-100`}>
            <Icon className={`h-8 w-8 text-${color}-500`} /> */}
        <div className={`flex flex-col items-center gap-3 rounded-xl border-2 ${colorClasses.border} ${colorClasses.bg} p-6`}>
          +          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colorClasses.iconBg}`}>
            +            <Icon className={`h-8 w-8 ${colorClasses.icon}`} />
          </div>
          <p className={`text-lg font-semibold ${colorClasses.title}`}>
            Order {isFailed ? 'Failed' : 'Cancelled'}
          </p>
          <p className={`text-lg font-semibold ${colorClasses.title}`}>
            {STATUS_MESSAGES[status]}
          </p>
          {updatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Updated: {formatDate(updatedAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step node */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                    ${isCompleted ? 'border-brand-600 bg-brand-600 text-white' : ''}
                    ${isCurrent ? 'border-brand-600 bg-brand-50 text-brand-600 animate-pulse' : ''}
                    ${isFuture ? 'border-gray-300 bg-white text-gray-300' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-[11px] font-medium text-center leading-tight w-20 sm:w-24
                    ${isCompleted || isCurrent ? 'text-brand-600' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line (not after the last step) */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-1 mb-6">
                  <div
                    className={`h-0.5 w-full rounded transition-colors ${index < currentStepIndex ? 'bg-brand-600' : 'bg-gray-300'
                      }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status message */}
      <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-center">
        <p className="text-sm font-medium text-brand-700">
          {STATUS_MESSAGES[status] || 'Processing your order...'}
        </p>
        {updatedAt && (
          <p className="text-xs text-brand-500 mt-1">
            Last updated: {formatDate(updatedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
