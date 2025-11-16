import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Star, TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';

const SalesDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: { value: '$0.00', change: '0%' },
    monthlyOrders: { value: '0', change: '0%' },
    activeProducts: { value: '0', change: '+0' },
    customerRating: { value: '0.0/5', change: '+0.0' }
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
      setLoading(true);
      setError('');
      
      // Load all data in parallel for better performance
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
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      setError('');
      await loadDashboardData();
    } catch (error) {
      setError('Failed to refresh dashboard');
    } finally {
      setRefreshLoading(false);
    }
  };

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

  const getActivityIcon = (iconName) => {
    const icons = {
      ShoppingCart: ShoppingCart,
      Package: Package,
      DollarSign: DollarSign
    };
    return icons[iconName] || ShoppingCart;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-600';
      case 'update': return 'bg-yellow-100 text-yellow-600';
      case 'complete': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Dashboard</h2>
          <p className="text-gray-600">Overview of your farm business performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshLoading}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{refreshLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            key: 'totalSales', 
            label: 'Total Sales', 
            icon: DollarSign,
            data: stats.totalSales 
          },
          { 
            key: 'monthlyOrders', 
            label: 'Orders This Month', 
            icon: ShoppingCart,
            data: stats.monthlyOrders 
          },
          { 
            key: 'activeProducts', 
            label: 'Active Products', 
            icon: Package,
            data: stats.activeProducts 
          },
          { 
            key: 'customerRating', 
            label: 'Customer Rating', 
            icon: Star,
            data: stats.customerRating 
          },
        ].map((stat) => {
          const IconComponent = stat.icon;
          const { value, change, isPositive } = stat.data;
          
          return (
            <div key={stat.key} className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className={`text-sm mt-1 flex items-center ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {change} from last month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <IconComponent className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Top Selling Products
            </h3>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.sales} {product.unit || 'units'} sold
                    </p>
                    {product.category && (
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{product.revenue}</p>
                    <p className="text-xs text-gray-500">
                      ${product.averagePrice?.toFixed(2) || '0.00'} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No sales data available</p>
              <p className="text-sm text-gray-400 mt-1">Complete some orders to see top products</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <span className="text-sm text-gray-500">Latest updates</span>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.icon);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          ${activity.amount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Activity will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.monthlyOrders.value}</p>
            <p className="text-sm text-blue-800">Monthly Orders</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.activeProducts.value}</p>
            <p className="text-sm text-green-800">Active Products</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.customerRating.value}</p>
            <p className="text-sm text-purple-800">Customer Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;