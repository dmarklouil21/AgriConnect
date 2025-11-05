// components/portals/FarmerPortal.jsx
import React, { useState } from 'react';
import FarmerHeader from '../headers/FarmerHeader';
import ProductManagement from '../farmer/ProductManagement';
import OrderManagement from '../farmer/OrderManagement';
import SalesDashboard from '../farmer/SalesDashboard';

const FarmerPortal = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SalesDashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FarmerHeader onBack={onBack} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default FarmerPortal;