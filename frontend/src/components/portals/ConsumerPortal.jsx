// components/portals/ConsumerPortal.jsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ConsumerHeader from '../headers/ConsumerHeader';
import ProductBrowsing from '../consumer/ProductBrowsing';
import ShoppingCart from '../consumer/ShoppingCart';
import OrderTracking from '../consumer/OrderTracking';

const ConsumerPortal = ({ onLogout, user }) => {
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
  const [cartItems, setCartItems] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/consumer/${tab === 'browse' ? '' : tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerHeader 
        onLogout={onLogout}
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        cartItemsCount={cartItems.length}
        user={user}
      />
      
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<ProductBrowsing onAddToCart={setCartItems} />} />
          <Route path="/browse" element={<ProductBrowsing onAddToCart={setCartItems} />} />
          <Route path="/cart" element={<ShoppingCart cartItems={cartItems} onUpdateCart={setCartItems} />} />
          <Route path="/orders" element={<OrderTracking />} />
        </Routes>
      </main>
    </div>
  );
};

export default ConsumerPortal;