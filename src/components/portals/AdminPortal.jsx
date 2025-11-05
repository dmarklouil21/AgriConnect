// components/portals/AdminPortal.jsx
import React, { useState } from 'react';
import AdminHeader from '../headers/AdminHeader';
import UserManagement from '../admin/UserManagement';
// import ProductMonitoring from '../admin/ProductMonitoring';
// import ReportGeneration from '../admin/ReportGeneration';
// import Announcements from '../admin/Announcements';

const AdminPortal = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductMonitoring />;
      case 'reports':
        return <ReportGeneration />;
      case 'announcements':
        return <Announcements />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onBack={onBack} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPortal;