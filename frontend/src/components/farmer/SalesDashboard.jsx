import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Loader2,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { apiService } from '../../services/api';

const SalesDashboard = () => {
  // --- 1. Original State & Logic Restored ---
  const [stats, setStats] = useState({
    totalSales: { value: '$0.00', change: '0%', isPositive: true },
    monthlyOrders: { value: '0', change: '0%', isPositive: true },
    activeProducts: { value: '0', change: '+0', isPositive: true },
    customerRating: { value: '0.0/5', change: '+0.0', isPositive: true }
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState('');

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Only show full page loader on initial load
      if (!refreshLoading) setLoading(true);
      setError('');
      
      const [statsData, topProductsData, activityData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getTopProducts(4),
        apiService.getRecentActivity(3)
      ]);

      setStats(formatStats(statsData));
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

  // Helper to format API data for the UI
  const formatStats = (data) => {
    if (!data) return stats;

    return {
      totalSales: {
        value: `$${parseFloat(data.totalSales?.value || 0).toLocaleString()}`,
        change: `${data.totalSales?.change || 0}%`,
        isPositive: parseFloat(data.totalSales?.change || 0) >= 0
      },
      monthlyOrders: {
        value: data.monthlyOrders?.value?.toString() || '0',
        change: `${data.monthlyOrders?.change || 0}%`,
        isPositive: parseFloat(data.monthlyOrders?.change || 0) >= 0
      },
      activeProducts: {
        value: data.activeProducts?.value?.toString() || '0',
        change: data.activeProducts?.change || '+0',
        isPositive: true
      },
      customerRating: {
        value: `${data.customerRating?.value || '0.0'}/5`,
        change: data.customerRating?.change || '+0.0',
        isPositive: true
      }
    };
  };

  // --- 2. New UI Rendering ---

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
          <TrendingDown className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={stats.totalSales.value} 
          change={stats.totalSales.change} 
          isPositive={stats.totalSales.isPositive} 
          icon={DollarSign} 
          color="emerald" 
        />
        <StatCard 
          title="Monthly Orders" 
          value={stats.monthlyOrders.value} 
          change={stats.monthlyOrders.change} 
          isPositive={stats.monthlyOrders.isPositive} 
          icon={ShoppingCart} 
          color="blue" 
        />
        <StatCard 
          title="Active Products" 
          value={stats.activeProducts.value} 
          change={stats.activeProducts.change} 
          isPositive={stats.activeProducts.isPositive} 
          icon={Package} 
          color="orange" 
        />
        <StatCard 
          title="Rating" 
          value={stats.customerRating.value} 
          change={stats.customerRating.change} 
          isPositive={stats.customerRating.isPositive} 
          icon={Star} 
          color="purple" 
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products Table (Takes up 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Top Produce</h3>
              <p className="text-sm text-slate-400">Highest earning items this month</p>
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
                  <th className="px-6 py-3">Sales</th>
                  <th className="px-6 py-3 rounded-r-xl text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {product.sales} {product.unit || 'units'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-slate-800">{product.revenue}</div>
                      <div className="text-xs text-slate-400">
                         ${product.averagePrice?.toFixed(2) || '0.00'} avg
                      </div>
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

        {/* Recent Activity Timeline (Takes up 1 col) */}
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
                // Determine icon and color based on activity type
                // Note: Ensure your API returns 'type' or adapt this logic
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
const StatCard = ({ title, value, change, isPositive, icon: Icon, color }) => {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorStyles[color]} transition-transform group-hover:scale-110`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-bold tracking-wide uppercase mb-1">{title}</h4>
        <p className="text-3xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default SalesDashboard;