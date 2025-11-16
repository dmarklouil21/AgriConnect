// components/auth/Register.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Tractor,
  ShoppingBag,
  Settings,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  CheckSquare,
  Loader2,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = ({ onRegister }) => {
  const { userType } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    farmName: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // If no userType in URL, default to consumer
  const actualUserType = userType || 'consumer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // Validation
    const newErrors = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
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
    try {
      // Prepare data for API
      const registrationData = {
        email: formData.email,
        password: formData.password,
        userType: actualUserType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      };

      // Add farmer-specific fields
      if (actualUserType === 'farmer') {
        registrationData.farmName = formData.farmName;
      }

      const result = await register(registrationData);

      if (result.success) {
        // Registration successful - redirect to dashboard
        navigate(`/${actualUserType}`, { 
          replace: true,
          state: { message: 'Registration successful!' }
        });
      } else {
        setSubmitError(result.error);
      }
    } catch(error) {
      setSubmitError(error.message || 'Registration failed. Please try again.');
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (submitError) {
      setSubmitError('');
    }
  };

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

  const getRegistrationBenefits = () => {
    switch (actualUserType) {
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

  // Helper to get error for a field
  const getFieldError = (fieldName) => {
    return errors[fieldName];
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
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
            <div className={`w-12 h-12 bg-${getUserTypeColor()}-600 rounded-full flex items-center justify-center`}>
              <UserTypeIcon className="w-6 h-6 text-white" />
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

        {/* Error Alert */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Registration failed</p>
              <p className="text-red-700 text-sm mt-1">{submitError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500 ${errors.password ? 'border-red-300' : ''}`}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {actualUserType === 'farmer' && (
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tractor className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="farmName"
                      name="farmName"
                      type="text"
                      value={formData.farmName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                      placeholder="Enter your farm name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-${getUserTypeColor()}-500`}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`h-4 w-4 text-${getUserTypeColor()}-600 focus:ring-${getUserTypeColor()}-500 border-gray-300 rounded mt-1`}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700 flex items-start">
                  <span>
                    I agree to the{' '}
                    <a href="#" className="text-${getUserTypeColor()}-600 hover:text-${getUserTypeColor()}-500 font-medium">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-${getUserTypeColor()}-600 hover:text-${getUserTypeColor()}-500 font-medium">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
              {getFieldError('agreeToTerms') && (
                <p className="text-sm text-red-600">{getFieldError('agreeToTerms')}</p>
              )}
              {/* {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )} */}

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
                <Link 
                  to={`/login/${actualUserType}`}
                  className="font-medium text-${getUserTypeColor()}-600 hover:text-${getUserTypeColor()}-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-${getUserTypeColor()}-600 mr-2" />
                Why join as a {getUserTypeDisplay()}?
              </h3>
              <ul className="space-y-3">
                {getRegistrationBenefits().map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className={`w-3 h-3 text-${getUserTypeColor()}-600`} />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Quick Registration</h4>
                  <p className="text-xs text-blue-700">
                    Fill in your basic details and start using AgriConnect immediately. 
                    You can complete your profile later with additional information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;