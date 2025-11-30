import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  Loader2, Search, RefreshCw, UserPlus, Eye, EyeOff, AlertCircle, 
  Users, Tractor, ShoppingBag, Clock, MoreHorizontal, Check, X, Shield, Ban
} from 'lucide-react';

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
  const [refreshLoading, setRefreshLoading] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '', email: '', type: 'Consumer', phone: '', address: '', farmName: '', password: '', confirmPassword: ''
  });

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    if (!refreshLoading) setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        apiService.getAllUsers({ type: filterType === 'all' ? '' : filterType, search: searchTerm }),
        apiService.getUserStats()
      ]);
      setUsers(usersData || []); // Ensure array
      setStats(statsData || { totalUsers: 0, activeFarmers: 0, activeConsumers: 0, pendingUsers: 0 });
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await loadData();
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
      // Optimistically update stats if needed
      setShowConfirmModal(false);
      setActionUser(null);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = async (formData) => {
    setActionLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await apiService.createAdminUser(dataToSend);
      setShowAddModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- UI Helpers ---
  const filteredUsers = users.filter(user => {
     if (filterType !== 'all' && user.type.toLowerCase() !== filterType.toLowerCase()) return false;
     if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
  });

  const openViewModal = (user) => { setSelectedUser(user); setShowViewModal(true); };
  const openConfirmModal = (user, action) => { setActionUser(user); setActionType(action); setShowConfirmModal(true); };

  if (loading) return <div className="flex justify-center h-96 items-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Oversee farmers, consumers, and administrators.</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleRefresh} 
                disabled={refreshLoading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center gap-2"
            >
                <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : ''}`}/>
                <span>Sync</span>
            </button>
            <button 
                onClick={() => setShowAddModal(true)} 
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <UserPlus className="w-5 h-5"/> 
                <span>Add User</span>
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="purple" />
        <StatCard label="Farmers" value={stats.activeFarmers} icon={Tractor} color="emerald" />
        <StatCard label="Consumers" value={stats.activeConsumers} icon={ShoppingBag} color="blue" />
        <StatCard label="Pending Approval" value={stats.pendingUsers} icon={Clock} color="amber" />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-72 flex-shrink-0 ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
            <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

        <div className="w-full overflow-x-auto no-scrollbar flex items-center gap-2">
            {['all', 'Farmer', 'Consumer', 'Admin'].map((type) => (
                <button
                    key={type}
                    onClick={() => setFilterType(type.toLowerCase())}
                    className={`px-5 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all relative ${
                        filterType === type.toLowerCase()
                        ? 'text-purple-700 bg-purple-50/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {type === 'all' ? 'All Users' : type + 's'}
                    {filterType === type.toLowerCase() && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                        <UserRow 
                            key={user.id} 
                            user={user} 
                            onView={() => openViewModal(user)} 
                            onAction={openConfirmModal} 
                        />
                    ))}
                </tbody>
            </table>
        </div>
        {filteredUsers.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 opacity-50"/>
                </div>
                <p>No users found matching your criteria.</p>
            </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal 
            onClose={() => setShowAddModal(false)} 
            onSubmit={handleAddUser} 
            loading={actionLoading} 
        />
      )}

      {showViewModal && selectedUser && (
        <ViewUserModal 
            user={selectedUser} 
            onClose={() => setShowViewModal(false)} 
        />
      )}

      {showConfirmModal && actionUser && (
        <ConfirmActionModal 
            user={actionUser} 
            type={actionType} 
            onConfirm={handleStatusChange} 
            onCancel={() => setShowConfirmModal(false)} 
            loading={actionLoading} 
        />
      )}
    </div>
  );
};

// --- Sub-Component: Stats Card ---
const StatCard = ({ label, value, icon: Icon, color }) => {
    const colors = {
        purple: 'bg-purple-50 text-purple-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-800">{value}</p>
                <p className="text-sm font-medium text-slate-500">{label}</p>
            </div>
        </div>
    );
};

// --- Sub-Component: User Row ---
const UserRow = ({ user, onView, onAction }) => {
    const getRoleStyle = (type) => {
        switch(type) {
            case 'Farmer': return 'bg-emerald-100 text-emerald-700';
            case 'Admin': return 'bg-purple-100 text-purple-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Active': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Suspended': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Logic to determine available actions based on status
    const renderActions = () => {
        if (user.type === 'Admin') return null; // No actions on admins

        if (user.status === 'Pending') {
            return (
                <>
                    <button onClick={() => onAction(user, 'approve')} className="p-1.5 text-green-600 hover:bg-green-50 rounded tooltip" title="Approve"><Check size={16}/></button>
                    <button onClick={() => onAction(user, 'reject')} className="p-1.5 text-red-600 hover:bg-red-50 rounded tooltip" title="Reject"><X size={16}/></button>
                </>
            );
        }
        if (user.status === 'Active') {
            return (
                <button onClick={() => onAction(user, 'suspend')} className="p-1.5 text-red-600 hover:bg-red-50 rounded tooltip" title="Suspend"><Ban size={16}/></button>
            );
        }
        if (user.status === 'Suspended') {
            return (
                <button onClick={() => onAction(user, 'activate')} className="p-1.5 text-green-600 hover:bg-green-50 rounded tooltip" title="Activate"><Check size={16}/></button>
            );
        }
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getRoleStyle(user.type).replace('text-', 'bg-opacity-20 text-')}`}>
                        {initials}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getRoleStyle(user.type)}`}>
                    {user.type}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center w-fit gap-1 ${getStatusStyle(user.status)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                    {user.status}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                {user.joinDate || new Date().toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    {renderActions()}
                    <button onClick={onView} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded tooltip" title="View Details"><Eye size={16}/></button>
                </div>
            </td>
        </tr>
    );
};

// --- Modals ---

const ModalLayout = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                    <X size={18}/>
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

const AddUserModal = ({ onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', type: 'Consumer', phone: '', address: '', farmName: '', password: '', confirmPassword: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password.length < 6) return setError('Password must be at least 6 characters');
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        onSubmit(formData);
    };

    return (
        <ModalLayout title="Add New User" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Consumer', 'Farmer', 'Admin'].map(t => (
                            <button 
                                key={t} type="button" 
                                onClick={() => setFormData({...formData, type: t})}
                                className={`py-2 rounded-lg text-sm font-bold border transition-all ${formData.type === t ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <input required placeholder="Full Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input required type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input required type="tel" placeholder="Phone Number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    
                    {formData.type === 'Farmer' && (
                        <input required placeholder="Farm Business Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500" value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} />
                    )}
                    
                    <input required placeholder="Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                <div className="pt-2 space-y-3">
                    <div className="relative">
                        <input required type={showPass ? "text" : "password"} placeholder="Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"><Eye size={18}/></button>
                    </div>
                    <input required type="password" placeholder="Confirm Password" className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-purple-500 ${error ? 'border-red-300' : 'border-slate-200'}`} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                    {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex justify-center">
                    {loading ? <Loader2 className="animate-spin"/> : 'Create User'}
                </button>
            </form>
        </ModalLayout>
    );
};

const ViewUserModal = ({ user, onClose }) => (
    <ModalLayout title="User Profile" onClose={onClose}>
        <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400 mb-3">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <h4 className="text-xl font-bold text-slate-800">{user.name}</h4>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mt-1">{user.type}</span>
        </div>
        
        <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Email</span>
                <span className="font-medium text-slate-800">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Phone</span>
                <span className="font-medium text-slate-800">{user.phone}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Status</span>
                <span className={`font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>{user.status}</span>
            </div>
            {user.farmName && (
                <div className="flex justify-between py-3 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Farm Name</span>
                    <span className="font-medium text-slate-800">{user.farmName}</span>
                </div>
            )}
            <div className="pt-2">
                <span className="block text-slate-500 text-sm mb-1">Address</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl text-sm">{user.address}</p>
            </div>
        </div>
    </ModalLayout>
);

const ConfirmActionModal = ({ user, type, onConfirm, onCancel, loading }) => {
    const config = {
        approve: { title: 'Approve User', text: 'This will grant the user full access to the platform.', color: 'bg-green-600' },
        suspend: { title: 'Suspend User', text: 'The user will no longer be able to log in.', color: 'bg-red-600' },
        activate: { title: 'Reactivate User', text: 'Access will be restored immediately.', color: 'bg-green-600' },
        reject: { title: 'Reject User', text: 'The registration request will be denied.', color: 'bg-red-600' },
    }[type] || { title: 'Confirm Action', text: 'Are you sure?', color: 'bg-blue-600' };

    return (
        <ModalLayout title={config.title} onClose={onCancel}>
            <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-slate-400"/>
                </div>
                <p className="text-slate-600 mb-2">Are you sure you want to <strong>{type}</strong> <span className="font-bold text-slate-800">{user.name}</span>?</p>
                <p className="text-xs text-slate-400 mb-6">{config.text}</p>
                
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${config.color} hover:opacity-90 flex justify-center`}>
                        {loading ? <Loader2 className="animate-spin"/> : 'Confirm'}
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};

export default UserManagement;