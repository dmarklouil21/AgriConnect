// components/auth/Login.jsx
import React, { useState } from 'react';

const Login = ({ userType, onLogin, onSwitchToRegister, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
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
        type: userType,
        avatar: formData.email.split('@')[0].substring(0, 2).toUpperCase()
      };
      onLogin(userData);
      setIsLoading(false);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getUserTypeDisplay = () => {
    switch (userType) {
      case 'farmer': return 'Farmer';
      case 'consumer': return 'Consumer';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getUserTypeColor = () => {
    switch (userType) {
      case 'farmer': return 'green';
      case 'consumer': return 'blue';
      case 'admin': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            ← Back to Home
          </button> */}
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-10 h-10 bg-${getUserTypeColor()}-600 rounded-full flex items-center justify-center`}>
              <span className="text-white text-lg">
                {userType === 'farmer' ? '👨‍🌾' : 
                 userType === 'consumer' ? '🛒' : '⚙️'}
              </span>
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
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in to your account'
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          {/* <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h4>
            <p className="text-xs text-blue-700">
              <strong>Email:</strong> demo@agriconnect.com<br />
              <strong>Password:</strong> any password will work
            </p>
          </div> */}

          {/* Switch to Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
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