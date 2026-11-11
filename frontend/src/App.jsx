import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';

import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';

// Layout with standard Navbar and Footer for customer-facing pages
function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Customer-Facing Store Layout */}
      <Route element={<StoreLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders/:id/status" element={<OrderStatus />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Protected Routes with Admin Sidebar Layout */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
        </Route>
      </Route>
    </Routes>
  );
}

