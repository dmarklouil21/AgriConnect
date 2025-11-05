// components/portals/ConsumerPortal.jsx
import React, { useState } from 'react';
import ConsumerHeader from '../headers/ConsumerHeader';
import ProductBrowsing from '../consumer/ProductBrowsing';
import ShoppingCart from '../consumer/ShoppingCart';
import OrderTracking from '../consumer/OrderTracking';

const ConsumerPortal = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [cartItems, setCartItems] = useState([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <ProductBrowsing onAddToCart={setCartItems} />;
      case 'cart':
        return <ShoppingCart cartItems={cartItems} onUpdateCart={setCartItems} />;
      case 'orders':
        return <OrderTracking />;
      default:
        return <ProductBrowsing onAddToCart={setCartItems} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerHeader 
        onBack={onBack} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        cartItemsCount={cartItems.length}
      />
      
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default ConsumerPortal;