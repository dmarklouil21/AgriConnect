import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Tractor,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout, { InputField, THEMES } from './AuthLayout';

const Register = () => {
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

  // Determine Theme
  const actualUserType = userType || 'consumer';
  const theme = THEMES[actualUserType] || THEMES.default;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // --- Validation Logic ---
    const newErrors = {};
    
    // Email Validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
    }

    // Phone Validation (Matches Mongoose Schema)
    // Regex: Optional +, then at least 10 characters of digits, spaces, dashes, or parens
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number (min 10 digits)';
    }

    // Password Validation
    if (formData.password.length < 6) {
        newErrors.password = 'Min 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms Validation
    if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'Required';
    }

    // If errors exist, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        userType: actualUserType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      };

      if (actualUserType === 'farmer') {
        registrationData.farmName = formData.farmName;
      }

      const result = await register(registrationData);

      if (result.success) {
        navigate(`/${actualUserType}`, { 
          replace: true,
          state: { message: 'Registration successful!' }
        });
      } else {
        setSubmitError(result.error);
      }
    } catch(error) {
      setSubmitError(error.message || 'Registration failed.');
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
    // Clear errors as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const getBenefits = () => {
    if (actualUserType === 'farmer') return [
      'Sell directly to local consumers', 'Set your own prices', 'Access sales analytics'
    ];
    return [
      'Fresh locally grown produce', 'Support sustainable agriculture', 'Transparent farm origins'
    ];
  };

  return (
    <AuthLayout 
      title={<span>Join the <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>Revolution</span>.</span>}
      subtitle={`Create your ${actualUserType} account to start building a better food system.`}
    >
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${theme.primary}`} />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 text-sm mt-1">Join the community today</p>
        </div>

        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First Name"
              icon={User}
              name="firstName"
              themeObj={theme}
              placeholder="John"
              required
              value={formData.firstName}
              onChange={handleChange}
            />
            <InputField
              label="Last Name"
              icon={User}
              name="lastName"
              themeObj={theme}
              placeholder="Doe"
              required
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="Email Address"
            icon={Mail}
            type="email"
            name="email"
            themeObj={theme}
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Phone"
              icon={Phone}
              type="tel"
              name="phoneNumber"
              themeObj={theme}
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber} // Pass error here
            />
            <InputField
              label="Address"
              icon={MapPin}
              type="text"
              name="address"
              themeObj={theme}
              placeholder="City, State"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          {actualUserType === 'farmer' && (
            <InputField
              label="Farm Name"
              icon={Tractor}
              name="farmName"
              themeObj={theme}
              placeholder="Green Valley Farms"
              required
              value={formData.farmName}
              onChange={handleChange}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Password"
              icon={Lock}
              type="password"
              name="password"
              themeObj={theme}
              placeholder="Min 6 chars"
              required
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            <InputField
              label="Confirm"
              icon={Lock}
              type="password"
              name="confirmPassword"
              themeObj={theme}
              placeholder="Re-type password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          {/* Terms Checkbox */}
          <div>
            <div className={`flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 ${errors.agreeToTerms ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="flex h-6 items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer`}
                />
              </div>
              <label htmlFor="agreeToTerms" className="text-sm text-slate-600 cursor-pointer select-none">
                I agree to the <a href="#" className={`font-bold ${theme.text} hover:underline`}>Terms</a> and <a href="#" className={`font-bold ${theme.text} hover:underline`}>Privacy Policy</a>.
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1 ml-1">You must agree to continue</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${theme.primary} ${theme.shadow} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : `Create ${actualUserType === 'admin' ? 'Admin' : actualUserType === 'farmer' ? 'Farmer' : 'Consumer'} Account`}
          </button>
        </form>

        {/* Mini Benefits Section */}
        <div className={`mt-8 p-4 rounded-xl ${theme.bg} border border-transparent`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.text} opacity-80`}>Included with your account</p>
          <div className="space-y-2">
            {getBenefits().map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className={`w-4 h-4 ${theme.text}`} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to={`/login/${actualUserType}`} className={`font-bold ${theme.text} hover:underline`}>
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;