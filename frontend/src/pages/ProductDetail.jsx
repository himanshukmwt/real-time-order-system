import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Package, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Skeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="aspect-square bg-gray-200 rounded-xl" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-12 bg-gray-200 rounded w-48 mt-8" />
      </div>
    </div>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data.product);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load product');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const stock = product ? (product.stock ?? product.countInStock ?? 0) : 0;
  const inStock = stock > 0;

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => Math.min(stock, q + 1));
  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQuantity(Math.max(1, Math.min(stock, val)));
    }
  };

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      // toast.success(`Added ${quantity} × ${product.name} to cart`);
    } catch {
      toast.error('Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Skeleton />;

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="mx-auto w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-brand-600 transition-colors">
          Products
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => navigate('/products')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      {/* Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {product.image || product.imageUrl ? (
            <img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-24 h-24 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category badge */}
          {product.category && (
            <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 mb-3 capitalize">
              {product.category}
            </span>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Price */}
          <p className="text-3xl font-bold text-brand-600 mb-4">
            ${Number(product.price).toFixed(2)}
          </p>

          {/* Stock Status */}
          <div className="mb-6">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                In Stock ({stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="mt-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={stock}
                    value={quantity}
                    onChange={handleQtyChange}
                    className="w-16 text-center border-x border-gray-300 py-2 text-sm font-medium focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={incrementQty}
                    disabled={quantity >= stock}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base disabled:opacity-60"
              >
                <ShoppingCart className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
