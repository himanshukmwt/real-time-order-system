import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, ShoppingBag, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-brand-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-brand-200" />
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Real-Time Order Processing at Lightning Speed
          </h1>
          <p className="text-brand-200 text-lg leading-relaxed">
            Track, manage, and process orders instantly with our powerful real-time system. Stay
            ahead with live updates and seamless workflows.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <ShoppingBag className="w-6 h-6 text-brand-200 mb-2" />
              <p className="text-sm font-medium">Live Order Tracking</p>
              <p className="text-xs text-brand-300 mt-1">Instant status updates</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <BarChart3 className="w-6 h-6 text-brand-200 mb-2" />
              <p className="text-sm font-medium">Smart Analytics</p>
              <p className="text-xs text-brand-300 mt-1">Real-time dashboards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
