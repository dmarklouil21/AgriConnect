// components/admin/UserManagement.jsx
import React, { useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Farmer', email: 'john@greenvalley.com', type: 'Farmer', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Sarah Consumer', email: 'sarah@email.com', type: 'Consumer', status: 'Active', joinDate: '2024-02-20' },
    { id: 3, name: 'Mike Farms', email: 'mike@sunshinefarms.com', type: 'Farmer', status: 'Pending', joinDate: '2024-03-01' },
    { id: 4, name: 'Lisa Shopper', email: 'lisa@email.com', type: 'Consumer', status: 'Suspended', joinDate: '2024-01-10' },
  ]);

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600">Manage farmer and consumer accounts</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Export Users
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-gray-800">1,247</div>
          <div className="text-gray-600 text-sm">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-green-600">856</div>
          <div className="text-gray-600 text-sm">Active Farmers</div>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-blue-600">391</div>
          <div className="text-gray-600 text-sm">Active Consumers</div>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <div className="text-2xl font-bold text-yellow-600">23</div>
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.type === 'Farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' :
                      user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleStatusChange(user.id, 'Active')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, 'Suspended')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspend
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;