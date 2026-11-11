import { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, List, X } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="h-8 bg-gray-200 rounded w-1/3" />
  </div>
);

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data?.data?.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return [...cats].sort();
  }, [products]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSortBy('newest');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    search || selectedCategories.length > 0 || sortBy !== 'newest' || inStockOnly;

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }

    // Category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // In stock
    if (inStockOnly) {
      result = result.filter((p) => (p.stock ?? p.countInStock ?? 0) > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return result;
  }, [products, search, selectedCategories, sortBy, inStockOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card sticky top-24 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

            {/* Search */}
            <div>
              <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="product-search"
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">In Stock Only</span>
            </label>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary w-full flex items-center justify-center gap-1.5 text-sm"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Products
              {!loading && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              )}
            </h1>

            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Search className="mx-auto w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  layout={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
