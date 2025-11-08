// components/auth/Register.jsx
import React, { useState } from 'react';

const Register = ({ userType, onRegister, onSwitchToLogin, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const userData = {
        id: Math.floor(Math.random() * 1000),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        type: userType,
        avatar: (formData.firstName[0] + formData.lastName[0]).toUpperCase()
      };
      onRegister(userData);
      setIsLoading(false);
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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

  const getRegistrationBenefits = () => {
    switch (userType) {
      case 'farmer':
        return [
          'Sell your produce directly to consumers',
          'Set your own prices and manage inventory',
          'Access sales analytics and insights',
          'Connect with local restaurants and businesses'
        ];
      case 'consumer':
        return [
          'Access fresh, locally grown produce',
          'Support local farmers and sustainable agriculture',
          'Convenient online ordering and delivery',
          'Transparent pricing and farm origins'
        ];
      case 'admin':
        return [
          'Manage platform users and content',
          'Monitor platform activity and reports',
          'Send announcements and updates',
          'Ensure platform guidelines are followed'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            ← Back to Home
          </button> */}
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-12 h-12 bg-${getUserTypeColor()}-600 rounded-full flex items-center justify-center`}>
              <span className="text-white text-xl">
                {userType === 'farmer' ? '👨‍🌾' : 
                 userType === 'consumer' ? '🛒' : '⚙️'}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Join as {getUserTypeDisplay()}
              </h2>
              <p className="text-gray-600 mt-1">
                Create your {getUserTypeDisplay().toLowerCase()} account on AgriConnect
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

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
                  placeholder="john@example.com"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="At least 6 characters"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-red-300' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )}

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
                    Creating account...
                  </div>
                ) : (
                  `Create ${getUserTypeDisplay()} Account`
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why join as a {getUserTypeDisplay()}?
              </h3>
              <ul className="space-y-3">
                {getRegistrationBenefits().map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Registration</h4>
              <p className="text-xs text-blue-700">
                Fill in your basic details and start using AgriConnect immediately. 
                You can complete your profile later with additional information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;