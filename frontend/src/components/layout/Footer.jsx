export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ShopFlow. Built for real-time order processing.
        </p>
      </div>
    </footer>
  );
}
