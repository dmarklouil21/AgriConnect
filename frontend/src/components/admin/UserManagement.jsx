import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Loader2, Search, RefreshCw, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, activeFarmers: 0, activeConsumers: 0, pendingUsers: 0 });
  
  // Filters
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Selection
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionUser, setActionUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '', 
    email: '', 
    type: 'Consumer', 
    phone: '', 
    address: '', 
    farmName: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passError, setPassError] = useState('');

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        apiService.getAllUsers({ type: filterType, search: searchTerm }),
        apiService.getUserStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async () => {
    let newStatus = actionUser.status;
    switch (actionType) {
      case 'approve': case 'activate': newStatus = 'Active'; break;
      case 'suspend': newStatus = 'Suspended'; break;
      case 'reject': newStatus = 'Rejected'; break;
      default: break;
    }

    setActionLoading(true);
    try {
      await apiService.updateUserStatus(actionUser.id, newStatus);
      setUsers(users.map(u => u.id === actionUser.id ? { ...u, status: newStatus } : u));
      apiService.getUserStats().then(setStats);
      setShowConfirmModal(false);
      setActionUser(null);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setPassError('');

    // Validation
    if (newUser.password.length < 6) {
        setPassError('Password must be at least 6 characters');
        return;
    }
    if (newUser.password !== newUser.confirmPassword) {
        setPassError('Passwords do not match');
        return;
    }

    setActionLoading(true);
    try {
      // Send data (excluding confirmPassword)
      const { confirmPassword, ...dataToSend } = newUser;
      await apiService.createAdminUser(dataToSend);
      
      alert('User created successfully');
      setShowAddModal(false);
      
      // Reset form
      setNewUser({ name: '', email: '', type: 'Consumer', phone: '', address: '', farmName: '', password: '', confirmPassword: '' });
      loadData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create user.';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openViewModal = (user) => { setSelectedUser(user); setShowViewModal(true); };
  const openConfirmModal = (user, action) => { setActionUser(user); setActionType(action); setShowConfirmModal(true); };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (user) => {
    // Don't allow changing own status or other admins if needed
    if (user.type === 'Admin') return []; 

    switch (user.status) {
      case 'Pending': return [{ type: 'approve', label: 'Approve', color: 'text-green-600 hover:text-green-900' }, { type: 'reject', label: 'Reject', color: 'text-red-600 hover:text-red-900' }];
      case 'Suspended': return [{ type: 'activate', label: 'Activate', color: 'text-green-600 hover:text-green-900' }];
      case 'Active': return [{ type: 'suspend', label: 'Suspend', color: 'text-red-600 hover:text-red-900' }];
      case 'Rejected': return [{ type: 'approve', label: 'Approve', color: 'text-green-600 hover:text-green-900' }];
      default: return [];
    }
  };

  const getActionDetails = () => {
    const btnMap = {
        approve: { text: 'Approve', color: 'bg-green-600' },
        suspend: { text: 'Suspend', color: 'bg-red-600' },
        activate: { text: 'Activate', color: 'bg-green-600' },
        reject: { text: 'Reject', color: 'bg-red-600' },
    };
    const details = btnMap[actionType] || { text: 'Confirm', color: 'bg-blue-600' };
    return { 
        title: `${details.text} User`, 
        message: `Are you sure you want to ${actionType} ${actionUser?.name}?`,
        buttonText: details.text,
        buttonColor: details.color
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600">Manage farmer, consumer, and admin accounts</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={loadData} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" /> <span>Refresh</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
            <UserPlus className="w-4 h-4" /> <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
          <div className="text-gray-600 text-sm">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeFarmers}</div>
          <div className="text-gray-600 text-sm">Active Farmers</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.activeConsumers}</div>
          <div className="text-gray-600 text-sm">Active Consumers</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingUsers}</div>
          <div className="text-gray-600 text-sm">Pending Approval</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border">
        <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"/>
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </form>
        <div className="flex gap-2">
            {['all', 'Farmer', 'Consumer', 'Admin'].map(type => (
                <button 
                    key={type}
                    onClick={() => setFilterType(type.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === type.toLowerCase() ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-purple-600"/></div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.type === 'Farmer' ? 'bg-green-100 text-green-800' : user.type === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.joinDate}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-3">
                        {getAvailableActions(user).map((action) => (
                            <button key={action.type} onClick={() => openConfirmModal(user, action.type)} className={action.color}>
                            {action.label}
                            </button>
                        ))}
                        <button onClick={() => openViewModal(user)} className="text-blue-600 hover:text-blue-900">View</button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select value={newUser.type} onChange={(e) => setNewUser({...newUser, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white">
                  <option value="Consumer">Consumer</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="John Doe" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="john@example.com" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input required type="tel" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="+1234567890" />
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-3 bg-gray-50 p-3 rounded-lg border">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        value={newUser.password} 
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg pr-10" 
                        placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input 
                        required 
                        type="password" 
                        value={newUser.confirmPassword} 
                        onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})} 
                        className={`w-full px-3 py-2 border rounded-lg ${passError ? 'border-red-500' : ''}`} 
                        placeholder="Re-enter password"
                    />
                </div>
                {passError && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {passError}
                    </div>
                )}
              </div>

              {/* Conditional Fields */}
              {newUser.type === 'Farmer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                  <input required type="text" value={newUser.farmName} onChange={(e) => setNewUser({...newUser, farmName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input required type="text" value={newUser.address} onChange={(e) => setNewUser({...newUser, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="123 Main St, City" />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} disabled={actionLoading} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 bg-purple-600 text-white py-3 rounded-lg flex justify-center items-center hover:bg-purple-700">
                    {actionLoading ? <Loader2 className="animate-spin"/> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Confirm Modals (Reuse logic from previous code) */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div><h3 className="text-xl font-semibold">User Details</h3><p className="text-gray-600">{selectedUser.email}</p></div>
              <button onClick={() => setShowViewModal(false)} className="text-2xl hover:text-gray-600">×</button>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-500">Name</label><div className="font-medium">{selectedUser.name}</div></div>
                    <div><label className="text-sm text-gray-500">Phone</label><div className="font-medium">{selectedUser.phone}</div></div>
                    <div><label className="text-sm text-gray-500">Type</label><div className="font-medium">{selectedUser.type}</div></div>
                    <div><label className="text-sm text-gray-500">Status</label><div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(selectedUser.status)}`}>{selectedUser.status}</div></div>
                    <div className="col-span-2"><label className="text-sm text-gray-500">Address</label><div className="font-medium">{selectedUser.address}</div></div>
                    {/* Only show Farm Name if it exists */}
                    {selectedUser.farmName && (
                        <div><label className="text-sm text-gray-500">Farm Name</label><div className="font-medium">{selectedUser.farmName}</div></div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && actionUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">{getActionDetails().title}</h3>
            <p className="text-gray-600 mb-6">{getActionDetails().message}</p>
            <div className="flex space-x-3">
                <button onClick={() => setShowConfirmModal(false)} disabled={actionLoading} className="flex-1 bg-gray-100 py-3 rounded-lg">Cancel</button>
                <button onClick={handleStatusChange} disabled={actionLoading} className={`flex-1 text-white py-3 rounded-lg flex justify-center items-center ${getActionDetails().buttonColor}`}>
                    {actionLoading ? <Loader2 className="animate-spin"/> : getActionDetails().buttonText}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;