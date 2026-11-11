import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, Package, ChevronRight, Home, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }

    setPlacingOrder(true);
    try {
      const response = await api.post('/orders');
      const order = response.data.data.order;
      const orderId = order.id;

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('shopflow_orders') || '[]');
      existingOrders.push({
        orderId,
        totalAmount,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('shopflow_orders', JSON.stringify(existingOrders));

      toast.success('Order placed successfully!');
      await fetchCart();
      navigate(`/orders/${orderId}/status`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart items skeleton */}
          <div className="lg:col-span-8 space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="card p-6 space-y-4">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-px bg-gray-200" />
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" strokeWidth={1} />
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary inline-flex items-center mt-8">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 mx-2" />
        <span className="text-gray-900 font-medium">Cart</span>
      </nav>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Shopping Cart</h1>
              <p className="mt-1 text-sm text-gray-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors hidden sm:block"
            >
              Continue Shopping →
            </Link>
          </div>

          <div className="space-y-0">
            {items.map((item, index) => (
              <div key={item.id}>
                <div className="card rounded-none first:rounded-t-xl last:rounded-b-xl p-4 sm:p-6 border-b-0 last:border-b">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.productId}`}
                      className="flex-shrink-0"
                    >
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product?.name || 'Product'}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-100"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-sm sm:text-base font-medium text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
                          >
                            {item.product?.name || 'Product'}
                          </Link>
                          <p className="mt-0.5 text-sm text-gray-500">
                            ${Number(item.product?.price || 0).toFixed(2)} each
                          </p>
                        </div>

                        {/* Remove button - desktop */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="hidden sm:flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 sm:px-4 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock || 99)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            ${Number(item.subtotal || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Remove button - mobile */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="sm:hidden flex items-center gap-1 mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                {index < items.length - 1 && (
                  <div className="border-b border-gray-100" />
                )}
              </div>
            ))}
          </div>

          {/* Clear Cart */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={clearCart}
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
            <Link
              to="/products"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors sm:hidden"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({items.length})</span>
                <span>${Number(totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ${Number(totalAmount).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || items.length === 0}
              className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <p className="mt-3 text-xs text-center text-gray-400">
              By placing your order, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
