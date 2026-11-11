import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import Footer from '../components/layout/Footer';

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="h-8 bg-gray-200 rounded w-1/3" />
  </div>
);

const steps = [
  {
    icon: ShoppingCart,
    title: 'Browse & Add to Cart',
    description: 'Explore our products and add your favorites to the cart',
  },
  {
    icon: CreditCard,
    title: 'Place Your Order',
    description: 'Checkout securely and your order starts processing instantly',
  },
  {
    icon: Truck,
    title: 'Real-Time Tracking',
    description: 'Track your order status live as it moves from processing to delivery',
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products');
        const products = data?.data?.products || [];
        setFeaturedProducts(products.slice(0, 4));
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-white/[0.03]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Real-Time Order Processing
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-brand-100 leading-relaxed">
            Experience seamless shopping with live order tracking. From cart to doorstep, watch your
            order every step of the way.
          </p>
          <div className="mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-brand-700 font-semibold text-lg shadow-lg hover:bg-brand-50 hover:shadow-xl transition-all duration-200"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-2 text-gray-500">Check out our top picks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
        </div>

        {!loading && featuredProducts.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-lg transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-gray-500">Three simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative text-center p-8 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-100 text-brand-600 mb-5">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 -translate-y-1/2">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer/>
    </div>
    
  );
}
