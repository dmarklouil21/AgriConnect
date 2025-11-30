import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsumerHeader from '../headers/ConsumerHeader';
import ProductBrowsing from '../consumer/ProductBrowsing';
import ShoppingCart from '../consumer/ShoppingCart';
import OrderTracking from '../consumer/OrderTracking';

const ConsumerPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/cart')) return 'cart';
    if (path.includes('/orders')) return 'orders';
    return 'browse';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  
  // Simple cart state lifting (In a real app, use Context or Redux)
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/consumer/${tab === 'browse' ? '' : tab}`);
  };

  const handleLogout = () => {
    const type = user?.userType || 'consumer';
    navigate(`/login/${type}`);
    logout();
  };

  const updateCartCount = (count) => {
    setCartItemsCount(count);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <ConsumerHeader 
        onLogout={handleLogout}
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        cartItemsCount={cartItemsCount}
        user={user}
      />
      
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<ProductBrowsing onCartUpdate={updateCartCount} />} />
          <Route path="/browse" element={<ProductBrowsing onCartUpdate={updateCartCount} />} />
          {/* Pass cart update function to ShoppingCart so it can clear count on purchase */}
          <Route path="/cart" element={<ShoppingCart onCartUpdate={updateCartCount} />} />
          <Route path="/orders" element={<OrderTracking />} />
        </Routes>
      </main>
    </div>
  );
};

export default ConsumerPortal;