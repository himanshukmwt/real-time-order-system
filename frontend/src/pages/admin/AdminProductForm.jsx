import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  stock: '',
  description: '',
  imageUrl: '',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Fetch existing product for edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const { data } = await api.get(`/products/${id}`);
        const product = data?.data?.product || {};
        setForm({
          name: product.name ?? '',
          category: product.category ?? '',
          price: product.price ?? '',
          stock: product.stock ?? '',
          description: product.description ?? '',
          imageUrl: product.imageUrl ?? '',
        });
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/admin/products');
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Price must be greater than 0');
      return false;
    }
    if (form.stock === '' || Number(form.stock) < 0) {
      toast.error('Stock must be 0 or greater');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit
            ? 'Update the product details below.'
            : 'Fill in the details to create a new product.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Image Preview — left column */}
          <div className="lg:col-span-2">
            <div className="card space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Image Preview</h3>
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`flex-col items-center gap-2 text-gray-400 ${form.imageUrl ? 'hidden' : 'flex'}`}
                >
                  <ImagePlus className="h-12 w-12" />
                  <span className="text-sm">Paste an image URL to preview</span>
                </div>
              </div>
              <div>
                <label htmlFor="imageUrlPreview" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  id="imageUrlPreview"
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field mt-1"
                />
              </div>
            </div>
          </div>

          {/* Form Fields — right column */}
          <div className="lg:col-span-3">
            <div className="card space-y-5">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Wireless Headphones"
                  className="input-field mt-1"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="input-field mt-1"
                />
              </div>

              {/* Price & Stock — side by side */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    step="1"
                    min="0"
                    placeholder="0"
                    className="input-field mt-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the product…"
                  className="input-field mt-1"
                />
              </div>

              {/* Image URL (synced with the left column) */}
              <div>
                <label htmlFor="imageUrlForm" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  id="imageUrlForm"
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? 'Update Product' : 'Create Product'}
                </button>
                <Link to="/admin/products" className="btn-secondary">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
