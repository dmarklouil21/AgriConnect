// components/headers/AdminHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ onLogout, activeTab, onTabChange, user }) => {
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'products', label: 'Product Monitoring', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
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
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⚙️</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">Admin Portal</span>
            </div>
          </div>
          {/* Stop here for now */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <div className="text-sm text-gray-600">Welcome, {user?.name}!</div>
              {/* <div className="text-xs text-gray-500">Last login: Today, 09:42 AM</div> */}
            </div>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Logout
            </button>
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-purple-800">{user?.avatar}</span>
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
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;