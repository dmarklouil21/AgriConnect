// components/headers/FarmerHeader.jsx
import React, { useState } from 'react';

const FarmerHeader = ({ onBack, activeTab, onTabChange }) => {
  const [ user, setUser ] = useState(null);

  const onLogout = () => {
    console.log("Logged Out");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back
            </button> */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              <span className="text-lg font-semibold text-gray-800">Farmer Portal</span>
            </div>
          </div>
          
          {/* <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">Welcome, Farmer John!</div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">FJ</span>
            </div>
          </div> */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">Welcome, {user?.name}!</div>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Logout
            </button>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">{user?.avatar}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-8 -mb-px">
          {[
            { id: 'dashboard', label: 'Sales Dashboard', icon: '📊' },
            { id: 'products', label: 'Product Management', icon: '🌱' },
            { id: 'orders', label: 'Order Management', icon: '📦' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default FarmerHeader;