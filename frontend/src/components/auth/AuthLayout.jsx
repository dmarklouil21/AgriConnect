import React from 'react';
import { Leaf, Tractor, ShoppingBag, Settings, User } from 'lucide-react';

// --- Color Themes ---
export const THEMES = {
  farmer: {
    primary: 'from-emerald-500 to-lime-500',
    shadow: 'shadow-emerald-200',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'focus:ring-emerald-200',
    border: 'focus:border-emerald-400',
    icon: Tractor
  },
  consumer: {
    primary: 'from-blue-500 to-sky-400',
    shadow: 'shadow-blue-200',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'focus:ring-blue-200',
    border: 'focus:border-blue-400',
    icon: ShoppingBag
  },
  admin: {
    primary: 'from-purple-500 to-fuchsia-500',
    shadow: 'shadow-purple-200',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'focus:ring-purple-200',
    border: 'focus:border-purple-400',
    icon: Settings
  },
  default: {
    primary: 'from-slate-700 to-slate-900',
    shadow: 'shadow-slate-200',
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    ring: 'focus:ring-slate-200',
    border: 'focus:border-slate-400',
    icon: User
  }
};

// --- Reusable Input Component ---
export const InputField = ({ icon: Icon, label, themeObj, error, ...props }) => (
  <div className="group">
    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative transition-all duration-200 focus-within:transform focus-within:-translate-y-0.5">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 text-slate-400 transition-colors group-focus-within:${themeObj.text}`} />
      </div>
      <input
        className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 ${themeObj.ring} ${themeObj.border} ${error ? 'border-red-300 ring-red-100 bg-red-50' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

// --- Main Layout Wrapper ---
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
    {/* Abstract Background Blobs */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl" />
    </div>

    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10 items-center">
      {/* Left Side: Brand/Context (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-lime-200">
            <Leaf size={24} fill="currentColor" />
          </div>
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Agri<span className="text-emerald-500">Connect</span>
          </span>
        </div>
        
        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">
          {title}
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-md">
          {subtitle}
        </p>
        
        {/* Abstract decoration box */}
        <div className="w-full h-64 bg-gradient-to-br from-emerald-50 to-lime-50 rounded-3xl border border-white/50 shadow-inner flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="text-center p-6">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4 transform -rotate-3">
              <span className="text-4xl">🌱</span>
            </div>
            <p className="font-bold text-slate-700">Connecting Farm to Table</p>
          </div>
        </div>
      </div>

      {/* Right Side: The Form */}
      {children}
    </div>
  </div>
);

export default AuthLayout;