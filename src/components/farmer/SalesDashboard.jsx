// components/farmer/SalesDashboard.jsx
import React from 'react';
import { DollarSign, ShoppingCart, Package, Star, TrendingUp } from 'lucide-react';

const SalesDashboard = () => {
  const stats = [
    { label: 'Total Sales', value: '$12,450', change: '+12%', icon: DollarSign },
    { label: 'Orders This Month', value: '89', change: '+8%', icon: ShoppingCart },
    { label: 'Active Products', value: '24', change: '+2', icon: Package },
    { label: 'Customer Rating', value: '4.8/5', change: '+0.2', icon: Star },
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
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change} from last month
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Top Selling Products
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'New order received', time: '2 hours ago', type: 'order', icon: ShoppingCart },
              { action: 'Product "Organic Tomatoes" updated', time: '5 hours ago', type: 'update', icon: Package },
              { action: 'Order #1234 completed', time: '1 day ago', type: 'complete', icon: DollarSign },
            ].map((activity, index) => {
              const ActivityIcon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                    activity.type === 'update' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;