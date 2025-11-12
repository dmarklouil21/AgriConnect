// components/farmer/OrderManagement.jsx
import React, { useState } from 'react';
import { Clock, CheckCircle, Truck, XCircle, Eye, X, AlertTriangle } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([
    { 
      id: 'ORD-001', 
      customer: 'Sarah Johnson', 
      date: '2024-03-15', 
      status: 'Pending', 
      total: 45.98, 
      items: [
        { name: 'Organic Tomatoes', quantity: 2, price: 4.99 },
        { name: 'Fresh Carrots', quantity: 3, price: 3.49 }
      ],
      customerPhone: '+1 (555) 123-4567',
      deliveryAddress: '123 Main St, City, State 12345'
    },
    { 
      id: 'ORD-002', 
      customer: 'Mike Wilson', 
      date: '2024-03-14', 
      status: 'Accepted', 
      total: 32.47, 
      items: [
        { name: 'Green Lettuce', quantity: 4, price: 2.99 },
        { name: 'Sweet Corn', quantity: 2, price: 3.49 }
      ],
      customerPhone: '+1 (555) 987-6543',
      deliveryAddress: '456 Oak Ave, City, State 12345'
    },
    { 
      id: 'ORD-003', 
      customer: 'Lisa Brown', 
      date: '2024-03-13', 
      status: 'Completed', 
      total: 28.99, 
      items: [
        { name: 'Organic Tomatoes', quantity: 3, price: 4.99 },
        { name: 'Farm Eggs', quantity: 1, price: 6.99 }
      ],
      customerPhone: '+1 (555) 456-7890',
      deliveryAddress: '789 Pine Rd, City, State 12345'
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return Clock;
      case 'Accepted': return CheckCircle;
      case 'Completed': return Truck;
      case 'Declined': return XCircle;
      default: return Eye;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setSelectedOrder(null);
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    accepted: orders.filter(o => o.status === 'Accepted').length,
    completed: orders.filter(o => o.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Orders', count: statusCounts.all },
            { id: 'pending', label: 'Pending', count: statusCounts.pending },
            { id: 'accepted', label: 'Accepted', count: statusCounts.accepted },
            { id: 'completed', label: 'Completed', count: statusCounts.completed },
          ].map((filter) => {
            const FilterIcon = getStatusIcon(filter.id === 'all' ? 'all' : filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                  filterStatus === filter.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {/* <FilterIcon className="w-4 h-4" /> */}
                <span>{filter.label} ({filter.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{order.id}</h3>
                  <p className="text-gray-600 text-sm">{order.customer}</p>
                  <p className="text-gray-500 text-xs">{order.date}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-gray-800 font-medium">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center border-t pt-3 mb-4">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-lg font-bold text-green-600">${order.total}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(order.id, 'Accepted')}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'Declined')}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </>
                )}
                
                {order.status === 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'Completed')}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
          <p className="text-gray-500">No orders match the current filter</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                {/* <Eye className="w-5 h-5" /> */}
                <span>Order Details</span>
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Order Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedOrder.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;