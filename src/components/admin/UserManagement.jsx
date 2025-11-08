// components/admin/UserManagement.jsx
import React, { useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: 'John Farmer', 
      email: 'john@greenvalley.com', 
      type: 'Farmer', 
      status: 'Active', 
      joinDate: '2024-01-15',
      phone: '+1 (555) 123-4567',
      address: '123 Farm Road, Green Valley, CA 90210',
      farmName: 'Green Valley Farm',
      products: 24,
      totalSales: 12450,
      lastLogin: '2024-03-15 09:42 AM'
    },
    { 
      id: 2, 
      name: 'Sarah Consumer', 
      email: 'sarah@email.com', 
      type: 'Consumer', 
      status: 'Active', 
      joinDate: '2024-02-20',
      phone: '+1 (555) 987-6543',
      address: '456 City Street, Urbanville, CA 90211',
      farmName: null,
      orders: 8,
      totalSpent: 345.67,
      lastLogin: '2024-03-15 10:15 AM'
    },
    { 
      id: 3, 
      name: 'Mike Farms', 
      email: 'mike@sunshinefarms.com', 
      type: 'Farmer', 
      status: 'Pending', 
      joinDate: '2024-03-01',
      phone: '+1 (555) 456-7890',
      address: '789 Country Lane, Sunshine Valley, CA 90212',
      farmName: 'Sunshine Farms',
      products: 0,
      totalSales: 0,
      lastLogin: '2024-03-14 02:30 PM'
    },
    { 
      id: 4, 
      name: 'Lisa Shopper', 
      email: 'lisa@email.com', 
      type: 'Consumer', 
      status: 'Suspended', 
      joinDate: '2024-01-10',
      phone: '+1 (555) 234-5678',
      address: '321 Town Avenue, Metro City, CA 90213',
      farmName: null,
      orders: 12,
      totalSpent: 567.89,
      lastLogin: '2024-03-10 11:20 AM',
      suspensionReason: 'Multiple policy violations'
    },
  ]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionUser, setActionUser] = useState(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    type: 'Consumer',
    phone: '',
    address: '',
    farmName: ''
  });

  // Open view user details modal
  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Open confirmation modal for actions
  const openConfirmModal = (user, action) => {
    setActionUser(user);
    setActionType(action);
    setShowConfirmModal(true);
  };

  // Handle status change after confirmation
  const handleStatusChange = () => {
    let newStatus = actionUser.status;
    
    switch (actionType) {
      case 'approve':
        newStatus = 'Active';
        break;
      case 'suspend':
        newStatus = 'Suspended';
        break;
      case 'activate':
        newStatus = 'Active';
        break;
      case 'reject':
        newStatus = 'Rejected';
        break;
      default:
        break;
    }

    setUsers(users.map(user => 
      user.id === actionUser.id ? { ...user, status: newStatus } : user
    ));
    
    setShowConfirmModal(false);
    setActionUser(null);
    setActionType('');
  };

  // Handle add new user
  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      products: 0,
      totalSales: 0,
      orders: 0,
      totalSpent: 0
    };
    
    setUsers([...users, user]);
    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      type: 'Consumer',
      phone: '',
      address: '',
      farmName: ''
    });
  };

  // Get action details for confirmation modal
  const getActionDetails = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve User',
          message: `Are you sure you want to approve ${actionUser?.name}?`,
          description: 'This will activate their account and grant them full access to the platform.',
          buttonText: 'Approve User',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✅'
        };
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${actionUser?.name}?`,
          description: 'This will temporarily disable their account and restrict platform access.',
          buttonText: 'Suspend User',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '⏸️'
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${actionUser?.name}?`,
          description: 'This will restore their account access and platform privileges.',
          buttonText: 'Activate User',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✅'
        };
      case 'reject':
        return {
          title: 'Reject User',
          message: `Are you sure you want to reject ${actionUser?.name}?`,
          description: 'This will permanently reject their registration application.',
          buttonText: 'Reject User',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '❌'
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          description: 'This action cannot be undone.',
          buttonText: 'Confirm',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          icon: '⚠️'
        };
    }
  };

  // Get available actions for a user based on status
  const getAvailableActions = (user) => {
    switch (user.status) {
      case 'Pending':
        return [
          { type: 'approve', label: 'Approve', color: 'text-green-600 hover:text-green-900' },
          { type: 'reject', label: 'Reject', color: 'text-red-600 hover:text-red-900' }
        ];
      case 'Suspended':
        return [
          { type: 'activate', label: 'Activate', color: 'text-green-600 hover:text-green-900' }
        ];
      case 'Active':
        return [
          { type: 'suspend', label: 'Suspend', color: 'text-red-600 hover:text-red-900' }
        ];
      case 'Rejected':
        return [
          { type: 'approve', label: 'Approve', color: 'text-green-600 hover:text-green-900' }
        ];
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Farmer': return 'bg-green-100 text-green-800';
      case 'Consumer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600">Manage farmer and consumer accounts</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Export Users
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-gray-800">{users.length}</div>
          <div className="text-gray-600 text-sm">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(user => user.type === 'Farmer' && user.status === 'Active').length}
          </div>
          <div className="text-gray-600 text-sm">Active Farmers</div>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(user => user.type === 'Consumer' && user.status === 'Active').length}
          </div>
          <div className="text-gray-600 text-sm">Active Consumers</div>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(user => user.status === 'Pending').length}
          </div>
          <div className="text-gray-600 text-sm">Pending Approval</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const availableActions = getAvailableActions(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(user.type)}`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {availableActions.map((action) => (
                          <button 
                            key={action.type}
                            onClick={() => openConfirmModal(user, action.type)}
                            className={action.color}
                          >
                            {action.label}
                          </button>
                        ))}
                        <button 
                          onClick={() => openViewModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type *</label>
                <select
                  value={newUser.type}
                  onChange={(e) => setNewUser({...newUser, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="Consumer">Consumer</option>
                  <option value="Farmer">Farmer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter phone number"
                />
              </div>

              {newUser.type === 'Farmer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    value={newUser.farmName}
                    onChange={(e) => setNewUser({...newUser, farmName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter farm name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter address"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                    <div className="px-3 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedUser.type)}`}>
                        {selectedUser.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="px-3 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.joinDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.lastLogin}</div>
                  </div>
                  {selectedUser.suspensionReason && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Suspension Reason</label>
                      <div className="px-3 py-2 bg-red-50 rounded-lg border text-red-700">
                        {selectedUser.suspensionReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  {selectedUser.type === 'Farmer' ? 'Farm Information' : 'Consumer Information'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.address || 'Not provided'}</div>
                  </div>
                  
                  {selectedUser.type === 'Farmer' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.farmName || 'Not provided'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Active Products</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.products}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Sales</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">${selectedUser.totalSales?.toLocaleString()}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">{selectedUser.orders}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Spent</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border">${selectedUser.totalSpent?.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && actionUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              {/* Action Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <span className="text-2xl">{getActionDetails().icon}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{getActionDetails().title}</h3>
              
              <p className="text-gray-600 mb-4">
                {getActionDetails().message}
              </p>

              {/* User Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">
                      {actionUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">{actionUser.name}</h4>
                    <p className="text-sm text-gray-600">{actionUser.email}</p>
                    <div className="flex space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(actionUser.type)}`}>
                        {actionUser.type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(actionUser.status)}`}>
                        {actionUser.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Description */}
              <div className="bg-blue-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-700 text-left">
                  {getActionDetails().description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  className={`flex-1 text-white py-3 px-4 rounded-lg transition-colors font-medium ${getActionDetails().buttonColor}`}
                >
                  {getActionDetails().buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;