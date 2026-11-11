import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  PackageCheck,
  PackageX,
  ImageOff,
} from 'lucide-react';
import api from '../../api/axios';

function StatsCard({ icon: Icon, title, value, iconBg }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Out of Stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      {stock}
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      console.log("Products API Response:", data.data.products);
      setProducts(data?.data?.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const totalProducts = products.length;
  const totalInStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(`"${name}" deleted successfully`);
      fetchProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete product'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          icon={Package}
          title="Total Products"
          value={totalProducts}
          iconBg="bg-brand-600"
        />
        <StatsCard
          icon={PackageCheck}
          title="Total In Stock"
          value={totalInStock}
          iconBg="bg-green-600"
        />
        <StatsCard
          icon={PackageX}
          title="Out of Stock"
          value={outOfStock}
          iconBg="bg-red-600"
        />
      </div>

      {/* Product Table Card */}
      <div className="card">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 font-medium">Product Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    {products.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-10 w-10 text-gray-300" />
                        <p>No products yet. Add your first product!</p>
                        <Link
                          to="/admin/products/new"
                          className="btn-primary mt-2 inline-flex items-center gap-2 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Link>
                      </div>
                    ) : (
                      'No products match your search.'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <ImageOff className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge stock={product.stock ?? 0} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
