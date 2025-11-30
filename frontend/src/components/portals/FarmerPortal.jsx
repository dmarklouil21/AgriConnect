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

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/farmer/${tab === 'dashboard' ? '' : tab}`);
  };

  const handleLogout = () => {
    const type = user?.userType || 'consumer';
    navigate(`/login/${type}`); // Improved redirect to specific login type
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <FarmerHeader 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user}
      />
      
      {/* The main content area uses max-w-7xl for a wide but contained view,
         and we removed the generic white background to let components 
         define their own cards.
      */}
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
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