const sizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
