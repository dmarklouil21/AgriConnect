// components/portals/AdminPortal.jsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminHeader from '../headers/AdminHeader';
import UserManagement from '../admin/UserManagement';
import ProductMonitoring from '../admin/ProductMonitoring';
import ReportGeneration from '../admin/ReportGeneration';
import Announcements from '../admin/Announcements';

const AdminPortal = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/users')) return 'users';
    if (path.includes('/products')) return 'products';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/announcements')) return 'announcements';
    return 'users'; // default tab
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        onLogout={onLogout}
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user}
      />
      
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<UserManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/products" element={<ProductMonitoring />} />
          <Route path="/reports" element={<ReportGeneration />} />
          <Route path="/announcements" element={<Announcements />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPortal;