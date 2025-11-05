// components/farmer/SalesDashboard.jsx
import React from 'react';

const SalesDashboard = () => {
  const stats = [
    { label: 'Total Sales', value: '$12,450', change: '+12%', icon: '💰' },
    { label: 'Orders This Month', value: '89', change: '+8%', icon: '📦' },
    { label: 'Active Products', value: '24', change: '+2', icon: '🌱' },
    { label: 'Customer Rating', value: '4.8/5', change: '+0.2', icon: '⭐' },
  ];

  const topProducts = [
    { name: 'Organic Tomatoes', sales: 45, revenue: '$890' },
    { name: 'Fresh Carrots', sales: 38, revenue: '$570' },
    { name: 'Green Lettuce', sales: 32, revenue: '$480' },
    { name: 'Sweet Corn', sales: 28, revenue: '$420' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} units sold</p>
                </div>
                <p className="font-semibold text-green-600">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New order received', time: '2 hours ago', type: 'order' },
              { action: 'Product "Organic Tomatoes" updated', time: '5 hours ago', type: 'update' },
              { action: 'Order #1234 completed', time: '1 day ago', type: 'complete' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'order' ? 'bg-blue-500' : 
                  activity.type === 'update' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;