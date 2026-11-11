import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { id, name, description, price, stock, category, imageUrl } = product;
  const outOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    addItem(id, 1);
  };

  return (
    <div className="card group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      {/* Image */}
      <Link to={`/products/${id}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {category}
          </span>
        )}

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${id}`} className="group-hover:text-brand-600 transition-colors">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{name}</h3>
        </Link>

        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">${Number(price).toFixed(2)}</span>
          <span
            className={`text-xs font-medium ${outOfStock ? 'text-red-500' : stock <= 5 ? 'text-amber-500' : 'text-green-600'
              }`}
          >
            {outOfStock ? 'Unavailable' : stock <= 5 ? `Only ${stock} left` : 'In Stock'}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="btn-primary flex-1 text-xs py-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link
            to={`/products/${id}`}
            className="btn-secondary text-xs py-2 px-3"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
