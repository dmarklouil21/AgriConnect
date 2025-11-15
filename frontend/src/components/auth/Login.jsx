// components/auth/Login.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Tractor, 
  ShoppingBag, 
  Settings, 
  Mail, 
  Lock, 
  CheckSquare, 
  Eye, 
  EyeOff,
  Loader2,
  Search
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const { userType } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const userData = {
        id: 1,
        name: formData.email.split('@')[0],
        email: formData.email,
        type: actualUserType,
        avatar: formData.email.split('@')[0].substring(0, 2).toUpperCase()
      };
      onLogin(userData);
      let redirectLink = userType === 'farmer' ? '/farmer' : userType === 'consumer' ? '/consumer' : '/admin'
      navigate(redirectLink)
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // If no userType in URL, default to consumer
  const actualUserType = userType || 'consumer';

  const getUserTypeDisplay = () => {
    switch (actualUserType) {
      case 'farmer': return 'Farmer';
      case 'consumer': return 'Consumer';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getUserTypeColor = () => {
    switch (actualUserType) {
      case 'farmer': return 'green';
      case 'consumer': return 'blue';
      case 'admin': return 'purple';
      default: return 'gray';
    }
  };

  const getUserTypeIcon = () => {
    switch (actualUserType) {
      case 'farmer': return Tractor;
      case 'consumer': return ShoppingBag;
      case 'admin': return Settings;
      default: return ShoppingBag;
    }
  };

  const UserTypeIcon = getUserTypeIcon();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-10 h-10 bg-${getUserTypeColor()}-600 rounded-full flex items-center justify-center`}>
              <UserTypeIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {getUserTypeDisplay()} Login
            </h2>
          </div>
          
          <p className="text-gray-600">
            Sign in to your {getUserTypeDisplay().toLowerCase()} account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email} 
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-${getUserTypeColor()}-600 focus:ring-${getUserTypeColor()}-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-${getUserTypeColor()}-600 hover:text-${getUserTypeColor()}-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-${getUserTypeColor()}-600 hover:bg-${getUserTypeColor()}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${getUserTypeColor()}-500 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Signing in...
                </div>
              ) : (
                'Sign in to your account'
              )}
            </button>
          </div>

          {/* Switch to Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to={`/register/${actualUserType}`}
                className="font-medium text-${getUserTypeColor()}-600 hover:text-${getUserTypeColor()}-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-${getUserTypeColor()}-100 rounded-full flex items-center justify-center`} >
                <Lock className={`w-4 h-4 text-${getUserTypeColor()}-600`} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Secure Login</h4>
                <p className="text-xs text-gray-600">Your data is protected with encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;