import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout, { InputField, THEMES } from './AuthLayout';

const Login = () => {
  const { userType } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Determine Theme based on User Type
  const actualUserType = userType || 'consumer';
  const theme = THEMES[actualUserType] || THEMES.default;
  const UserIcon = theme.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password, actualUserType);
      
      if (result.success) {
        let redirectLink = actualUserType === 'farmer' ? '/farmer' : actualUserType === 'consumer' ? '/consumer' : '/admin';
        navigate(redirectLink);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <AuthLayout 
      title={<span>Welcome Back, <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>{capitalize(actualUserType)}</span>.</span>}
      subtitle="Sign in to manage your harvest, browse the market, or connect with your community."
    >
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        {/* Top Decorative Line */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${theme.primary}`} />

        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center`}>
            <UserIcon className={`w-7 h-7 ${theme.text}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
            <p className="text-slate-500 text-sm">Enter your details to proceed</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Email Address"
            icon={Mail}
            type="email"
            name="email"
            themeObj={theme}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="space-y-1">
            <div className="relative">
               <InputField
                label="Password"
                icon={Lock}
                themeObj={theme}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute top-[34px] right-4 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className={`h-4 w-4 rounded border-slate-300 text-${actualUserType === 'farmer' ? 'emerald' : 'blue'}-600 focus:ring-${actualUserType === 'farmer' ? 'emerald' : 'blue'}-500`}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-600 font-medium">
                  Remember me
                </label>
              </div>
              <a href="#" className={`text-sm font-bold ${theme.text} hover:opacity-80`}>
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${theme.primary} ${theme.shadow} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {actualUserType !== 'admin' ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            {/* {actualUserType !== 'admin' ? ( */}
            <Link to={`/register/${actualUserType}`} className={`font-bold ${theme.text} hover:underline`}>
              Create Account
            </Link>
            {/* ) : null} */}
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
};

export default Login;