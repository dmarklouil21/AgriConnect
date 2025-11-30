import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  Package, 
  BarChart3, 
  Megaphone, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

const AdminHeader = ({ onLogout, activeTab, onTabChange, user }) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'products', label: 'Product Monitoring', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    // { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
              <ShieldCheck size={20} fill="currentColor" className="opacity-90" />
            </div>
            <div className="hidden md:block">
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                Agri<span className="text-purple-600">Connect</span>
              </span>
              <span className="text-xs block text-slate-400 font-medium -mt-1 uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>

          {/* Desktop Navigation (Underline Style) */}
          <nav className="hidden lg:flex items-center gap-2 h-full">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 h-full text-sm font-bold transition-all relative ${
                    isActive
                      ? 'text-purple-700 bg-purple-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  
                  {/* Active Underline Highlighting */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User & Mobile Toggle */}
          <div className="flex items-center gap-4">
            
            {/* User Profile Pill */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{user?.name || user?.email || 'Administrator'}</p>
                <p className="text-xs text-slate-400 font-medium">System Admin</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              {showMobileMenu ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top-2">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 mb-6 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm">
                <Settings size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{user?.email || 'Administrator'}</p>
                <p className="text-xs text-purple-600 font-medium">Logged in</p>
              </div>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center justify-between w-full p-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
            
            <div className="h-px bg-slate-100 my-2" />
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;