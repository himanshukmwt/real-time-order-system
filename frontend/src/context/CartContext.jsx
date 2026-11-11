import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const itemCount = cart?.totalItems ?? 0;

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Auto-fetch cart when the user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // User logged out — reset cart state
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      try {
        const { data } = await api.post('/cart/items', { productId, quantity });
        setCart(data.data.cart);
        toast.success('Item added to cart');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add item');
        throw err;
      }
    },
    [],
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      try {
        const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
        setCart(data.data.cart);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update item');
        throw err;
      }
    },
    [],
  );

  const removeItem = useCallback(
    async (itemId) => {
      try {
        const { data } = await api.delete(`/cart/items/${itemId}`);
        setCart(data.data.cart);
        toast.success('Item removed from cart');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove item');
        throw err;
      }
    },
    [],
  );

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart');
      setCart(null);
      toast.success('Cart cleared');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({ cart, loading, itemCount, fetchCart, addItem, updateItem, removeItem, clearCart }),
    [cart, loading, itemCount, fetchCart, addItem, updateItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
