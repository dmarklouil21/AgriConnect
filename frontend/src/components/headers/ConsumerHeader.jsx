import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Package, 
  User, 
  LogOut, 
  Menu, 
  X,
  Leaf 
} from 'lucide-react';

const ConsumerHeader = ({ onLogout, activeTab, onTabChange, cartItemsCount, user }) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const tabs = [
    { id: 'browse', label: 'Marketplace', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: Package },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section - Matched exactly to Farmer Header size (text-xl) */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Leaf size={20} fill="currentColor" />
            </div>
            <div className="hidden md:block">
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                Agri<span className="text-blue-500">Connect</span>
              </span>
              <span className="text-xs block text-slate-400 font-medium -mt-1 uppercase tracking-wider">Shopper</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 h-full">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all relative ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="relative">
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {/* Badge for Cart Icon */}
                    {tab.id === 'cart' && cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-extrabold px-1 py-0.5 rounded-full min-w-[14px] flex items-center justify-center shadow-sm border border-white">
                        {cartItemsCount}
                      </span>
                    )}
                  </div>
                  <span>{tab.label}</span>
                  
                  {/* Active Underline Highlighting */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User & Mobile Toggle */}
          <div className="flex items-center gap-4">
            
            {/* User Profile Pill */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{user?.firstName || user?.name || 'Shopper'}</p>
                <p className="text-xs text-slate-400 font-medium">Personal Account</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Cart & Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => onTabChange('cart')}
                className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg relative"
              >
                <ShoppingCart size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                {showMobileMenu ? <X size={20}/> : <Menu size={20}/>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top-2">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{user?.firstName || user?.name}</p>
                <p className="text-xs text-blue-600 font-medium">{user?.email}</p>
              </div>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center justify-between w-full p-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                {tab.id === 'cart' && cartItemsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            ))}
            
            <div className="h-px bg-slate-100 my-2" />
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ConsumerHeader;