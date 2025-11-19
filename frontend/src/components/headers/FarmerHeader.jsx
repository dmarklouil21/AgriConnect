import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Tractor, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  User, 
  LogOut, 
  Menu,
  X 
} from 'lucide-react';

const FarmerHeader = ({ onLogout, activeTab, onTabChange, user }) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleBack = () => {
    onLogout();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Sales Dashboard', icon: BarChart3, shortLabel: 'Sales' },
    { id: 'products', label: 'Product Management', icon: Package, shortLabel: 'Products' },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart, shortLabel: 'Orders' },
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setShowMobileMenu(false);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Tractor className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Farmer Portal</span>
            </div>
          </div>
          
          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-600">Welcome, {user?.firstName}!</div>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-800" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-800" />
            </div>
            {/* <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button> */}
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex space-x-8 -mb-px">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation Tabs */}
        <nav className="flex md:hidden justify-between -mb-px">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-3 px-2 flex-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TabIcon className="w-5 h-5 mb-1" />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {/* {showMobileMenu && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 md:hidden">
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Menu</h3>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-800" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="text-sm font-medium text-gray-500 mb-2">Navigation</div>
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-3 w-full p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TabIcon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <button
                onClick={onLogout}
                className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )} */}
    </header>
  );
};

export default FarmerHeader;