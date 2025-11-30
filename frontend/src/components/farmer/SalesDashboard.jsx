import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Star, 
  RefreshCw, 
  Loader2,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { apiService } from '../../services/api';

// Safe fallback for images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f1f5f9'%3E%3Crect width='100' height='100' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
const API_BASE_URL = 'http://localhost:5000';

const SalesDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!refreshLoading) setLoading(true);
      setError('');
      
      // Fetch Order Stats (Real Revenue) AND Top Products
      const [orderStats, topProductsData, activityData] = await Promise.all([
        apiService.getOrderStats(), // Returns { totalRevenue, totalOrders, ... }
        apiService.getTopProducts(5),
        apiService.getRecentActivity(3)
      ]);

      setStats(orderStats);
      setTopProducts(topProductsData || []);
      setRecentActivity(activityData || []);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Gathering your harvest data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Here's what's happening on your farm today.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshLoading}
          className="group flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="font-medium text-sm">{refreshLoading ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <MoreHorizontal className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue?.toLocaleString() || '0.00'}`} 
          icon={DollarSign} 
          color="emerald" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders || 0} 
          icon={ShoppingCart} 
          color="blue" 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders || 0} 
          icon={Package} 
          color="orange" 
        />
        <StatCard 
          title="Completed" 
          value={stats.completedOrders || 0} 
          icon={Star} 
          color="purple" 
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Top Produce</h3>
              <p className="text-sm text-slate-400">Highest earning items</p>
            </div>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="p-2 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold text-left">
                <tr>
                  <th className="px-6 py-3 rounded-l-xl">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Sales Count</th> {/* Renamed for clarity */}
                  <th className="px-6 py-3 rounded-r-xl text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            <img 
                                src={product.productImage ? `${API_BASE_URL}${product.productImage}` : PLACEHOLDER_IMAGE}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                        </div>
                        <div className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                            {product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {product.category || 'General'}
                      </span>
                    </td>
                    {/* UPDATED: Showing pure sales count number */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                        {product.sales}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">{product.unit} sold</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-slate-800">{product.revenue}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topProducts.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center">
                 <Package className="w-12 h-12 text-slate-200 mb-3" />
                 <p className="text-slate-500 font-medium">No sales data available yet.</p>
                 <p className="text-slate-400 text-sm">Once you start selling, your top products will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Activity</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="p-6 flex-1">
            <div className="space-y-6 relative">
              {/* Vertical Connector Line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />

              {recentActivity.map((activity, idx) => {
                const isOrder = activity.type === 'order' || activity.icon === 'ShoppingCart';
                const isUpdate = activity.type === 'update' || activity.icon === 'Package';
                const isMoney = activity.type === 'complete' || activity.icon === 'DollarSign';

                return (
                  <div key={idx} className="relative flex gap-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 shrink-0
                      ${isOrder ? 'bg-blue-100 text-blue-600' : ''}
                      ${isUpdate ? 'bg-orange-100 text-orange-600' : ''}
                      ${isMoney ? 'bg-emerald-100 text-emerald-600' : ''}
                      ${!isOrder && !isUpdate && !isMoney ? 'bg-slate-100 text-slate-500' : ''}
                    `}>
                      {isOrder && <ShoppingCart size={14} />}
                      {isUpdate && <Package size={14} />}
                      {isMoney && <DollarSign size={14} />}
                      {!isOrder && !isUpdate && !isMoney && <Star size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                        {activity.amount && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                            +${typeof activity.amount === 'number' ? activity.amount.toFixed(2) : activity.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {recentActivity.length === 0 && (
                 <div className="text-center py-8">
                   <p className="text-slate-400 text-sm">No recent activity.</p>
                 </div>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-b-3xl border-t border-slate-100">
             <button className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
               View Full History
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: Stat Card ---
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${colorStyles[color]} transition-transform group-hover:scale-110`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-bold tracking-wide uppercase mb-1">{title}</h4>
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default SalesDashboard;