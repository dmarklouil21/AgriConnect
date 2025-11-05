import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import FarmerPortal from './components/portals/FarmerPortal';
import ConsumerPortal from './components/portals/ConsumerPortal';
import AdminPortal from './components/portals/AdminPortal';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentView(`${type}-portal`);
  };

  const renderPortal = () => {
    switch (userType) {
      case 'farmer':
        return <FarmerPortal onBack={() => setCurrentView('landing')} />;
      case 'consumer':
        return <ConsumerPortal onBack={() => setCurrentView('landing')} />;
      case 'admin':
        return <AdminPortal onBack={() => setCurrentView('landing')} />;
      default:
        return <LandingPage onUserTypeSelect={handleUserTypeSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {renderPortal()}
    </div>
  );
}

export default App;