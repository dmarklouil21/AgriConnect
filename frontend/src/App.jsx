import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import FarmerPortal from './components/portals/FarmerPortal';
import ConsumerPortal from './components/portals/ConsumerPortal';
import AdminPortal from './components/portals/AdminPortal';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ScissorsSquare } from 'lucide-react';

// Backup Purpose
// Main App Component with Router
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login/:userType?" element={<Login />} />
            <Route path="/register/:userType?" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/farmer/*" 
              element={
                <ProtectedRoute requiredUserType="farmer">
                  <FarmerPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consumer/*" 
              element={
                <ProtectedRoute requiredUserType="consumer">
                  <ConsumerPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminPortal />
                </ProtectedRoute>
              } 
            />

            {/* Dashboard route (redirects to appropriate portal) */}
            <Route 
              path="/dashboard/:userType?" 
              element={<DashboardRedirect />} 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  const inferUserTypeFromPath = (pathname) => {
    if (pathname.startsWith('/farmer')) return 'farmer';
    if (pathname.startsWith('/admin')) return 'admin';
    return 'consumer';
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login with return url
    const type = inferUserTypeFromPath(location.pathname);
    return <Navigate to={`/login/${type}`} state={{ from: location }} replace />;
  }
  
  if (requiredUserType && user?.userType !== requiredUserType) {
    // Redirect to appropriate portal based on user type
    switch (user?.userType) {
      case 'farmer':
        return <Navigate to="/farmer" replace />;
      case 'consumer':
        return <Navigate to="/consumer" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuth();
  const { userType } = useParams();

  // If userType is specified in URL, use that, otherwise use user's type
  const targetUserType = userType || user?.userType;

  switch (targetUserType) {
    case 'farmer':
      return <Navigate to="/farmer" replace />;
    case 'consumer':
      return <Navigate to="/consumer" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default App;