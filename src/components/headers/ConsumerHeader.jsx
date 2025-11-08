// components/headers/ConsumerHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConsumerHeader = ({ onLogout, activeTab, onTabChange, cartItemsCount, user }) => {
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'browse', label: 'Browse Products', icon: '🛍️' },
    { id: 'cart', label: 'Shopping Cart', icon: '🛒' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
  ];

  const handleBack = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              ← Back
            </button> */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🛒</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">Consumer Portal</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm text-gray-600">Welcome, {user?.name}!</div>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Logout
            </button>
            <div className="relative">
              {activeTab !== 'cart' && cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-800">{user?.avatar}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-8 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">
                {tab.label}
                {tab.id === 'cart' && cartItemsCount > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
                    {cartItemsCount}
                  </span>
                )}
              </span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default ConsumerHeader;