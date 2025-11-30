import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../headers/AdminHeader';
import UserManagement from '../admin/UserManagement';
import ProductMonitoring from '../admin/ProductMonitoring';
import ReportGeneration from '../admin/ReportGeneration';
import Announcements from '../admin/Announcements';

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive active tab from URL to keep UI in sync with Route
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/announcements')) return 'announcements';
    return 'users';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab === 'users' ? '' : tab}`);
  };

  const handleLogout = () => {
    const type = user?.userType || 'admin';
    navigate(`/login/${type}`);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900">
      <AdminHeader 
        onLogout={handleLogout}
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user}
      />
      
      {/* Main Content Container 
        - max-w-7xl: Prevents content from stretching too wide on large screens
        - px-4 lg:px-6: Consistent horizontal padding
        - py-8: Vertical breathing room
      */}
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
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