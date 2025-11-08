// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FarmerPortal from './components/portals/FarmerPortal';
import ConsumerPortal from './components/portals/ConsumerPortal';
import AdminPortal from './components/portals/AdminPortal';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Main App Component with Router
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('agriConnect_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    // Save to localStorage
    localStorage.setItem('agriConnect_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('agriConnect_user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:userType?" element={<Login onLogin={handleLogin} />} />
          <Route path="/register/:userType?" element={<Register onRegister={handleLogin} />} />
          
          {/* Protected Routes */}
          <Route 
            path="/farmer/*" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userType="farmer" currentUser={currentUser}>
                <FarmerPortal onLogout={handleLogout} user={currentUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer/*" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userType="consumer" currentUser={currentUser}>
                <ConsumerPortal onLogout={handleLogout} user={currentUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userType="admin" currentUser={currentUser}>
                <AdminPortal onLogout={handleLogout} user={currentUser} />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated, userType, currentUser }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (currentUser && currentUser.type !== userType) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default App;