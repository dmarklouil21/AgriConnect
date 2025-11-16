// components/portals/FarmerPortal.jsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FarmerHeader from '../headers/FarmerHeader';
import ProductManagement from '../farmer/ProductManagement';
import OrderManagement from '../farmer/OrderManagement';
import SalesDashboard from '../farmer/SalesDashboard';

const FarmerPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath())

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/farmer/${tab === 'dashboard' ? '' : tab}`);
  };

  const handleLogout = () => {
    const type = user?.userType || 'consumer';
    navigate(`/${type}`);
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FarmerHeader 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user}
      />
      
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<SalesDashboard />} />
          <Route path="/dashboard" element={<SalesDashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default FarmerPortal;