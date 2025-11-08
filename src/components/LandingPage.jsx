// components/LandingPage.jsx
import React from 'react';

const LandingPage = ({ onUserTypeSelect }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              <span className="text-xl font-bold text-green-800">AgriConnect</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-green-700">Features</a>
              <a href="#about" className="text-gray-600 hover:text-green-700">About</a>
              <a href="#contact" className="text-gray-600 hover:text-green-700">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Connecting Farmers
            <span className="block text-green-600">Directly to You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Eliminate middlemen, support local agriculture, and get the freshest produce delivered directly from farm to table.
          </p>

          {/* User Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Farmer Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🌾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Farmers</h3>
              <p className="text-gray-600 mb-6">Showcase your produce, set fair prices, and connect directly with buyers.</p>
   
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => window.location.href = `/login/farmer`}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = `/register/farmer`}
                  className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Consumer Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Consumers</h3>
              <p className="text-gray-600 mb-6">Discover fresh, local produce and support sustainable agriculture.</p>
     
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => window.location.href = `/login/consumer`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = `/register/consumer`}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧩</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Administrators</h3>
              <p className="text-gray-600 mb-6">Manage platform operations and ensure smooth community interactions.</p>
    
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => window.location.href = `/login/admin`}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = `/register/admin`}
                  className="flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;