// App.jsx
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import FarmerPortal from './components/portals/FarmerPortal';
import ConsumerPortal from './components/portals/ConsumerPortal';
import AdminPortal from './components/portals/AdminPortal';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentView('login');
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    setCurrentView(`${userData.type}-portal`);
  };

  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    setCurrentView(`${userData.type}-portal`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
    setCurrentView('landing');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  const renderPortal = () => {
    if (!isAuthenticated || !currentUser) return null;

    const portalProps = {
      onBack: () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('landing');
      },
      onLogout: handleLogout,
      user: currentUser
    };

    switch (currentUser.type) {
      case 'farmer':
        return <FarmerPortal {...portalProps} />;
      case 'consumer':
        return <ConsumerPortal {...portalProps} />;
      case 'admin':
        return <AdminPortal {...portalProps} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onUserTypeSelect={handleUserTypeSelect} />;
      case 'login':
        return (
          <Login 
            userType={userType}
            onLogin={handleLogin}
            onSwitchToRegister={switchToRegister}
            onBack={() => setCurrentView('landing')}
          />
        );
      case 'register':
        return (
          <Register 
            userType={userType}
            onRegister={handleRegister}
            onSwitchToLogin={switchToLogin}
            onBack={() => setCurrentView('landing')}
          />
        );
      default:
        if (isAuthenticated) {
          return renderPortal();
        }
        return <LandingPage onUserTypeSelect={handleUserTypeSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {renderContent()}
    </div>
  );
}

export default App;