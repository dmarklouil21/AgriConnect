import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, XCircle, Eye, X, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    accepted: 0,
    ready: 0,
    completed: 0,
    declined: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Loading states for individual actions
  const [statusLoading, setStatusLoading] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Load orders and counts on component mount
  useEffect(() => {
    loadOrders();
    loadOrderCounts();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = filterStatus === 'all' ? {} : { status: filterStatus };
      const response = await apiService.getFarmerOrders(params);
      setOrders(response.orders || []);
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderCounts = async () => {
    try {
      const counts = await apiService.getOrderCounts();
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error loading order counts:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      setError('');
      await loadOrders();
      await loadOrderCounts();
      setSuccess('Orders refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to refresh orders');
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusLoading(prev => ({ ...prev, [orderId]: true }));
      setError('');
      
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? response.order : order
      ));
      
      // Reload counts to update the filter numbers
      await loadOrderCounts();
      
      setSelectedOrder(null);
      setSuccess(`Order ${newStatus} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || `Failed to update order status to ${newStatus}`);
    } finally {
      setStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'ready': return Truck;
      case 'completed': return CheckCircle;
      case 'declined': return XCircle;
      default: return Eye;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Pending',
      accepted: 'Accepted',
      ready: 'Ready',
      completed: 'Completed',
      declined: 'Declined'
    };
    return statusMap[status] || status;
  };

  const filteredOrders = orders;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        
        <div className="flex space-x-3">
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
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'ready', label: 'Ready' },
          { id: 'completed', label: 'Completed' },
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
              <FilterIcon className="w-4 h-4" />
              <span>
                {filter.label} ({statusCounts[filter.id] || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          const isLoading = statusLoading[order._id];

          return (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{order.orderNumber}</h3>
                  <p className="text-gray-600 text-sm">
                    {order.consumer?.firstName} {order.consumer?.lastName}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {getStatusDisplay(order.status)}
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
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center border-t pt-3 mb-4">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-lg font-bold text-green-600">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(order._id, 'accepted')}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Processing...' : 'Accept'}</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, 'declined')}
                      disabled={isLoading}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Processing...' : 'Decline'}</span>
                    </button>
                  </>
                )}
                
                {order.status === 'accepted' && (
                  <button
                    onClick={() => handleStatusChange(order._id, 'preparing')}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Processing...' : 'Start Preparing'}</span>
                  </button>
                )}

                {/* {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(order._id, 'ready')}
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Processing...' : 'Mark Ready'}</span>
                  </button>
                )} */}

                {order.status === 'ready' && (
                  <button
                    onClick={() => handleStatusChange(order._id, 'completed')}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Processing...' : 'Complete'}</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(order)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1 disabled:opacity-50"
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
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          getStatusColor={getStatusColor}
          getStatusDisplay={getStatusDisplay}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, getStatusColor, getStatusDisplay }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Order Details - {order.orderNumber}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Order Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusDisplay(order.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-green-600">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {order.consumer?.firstName} {order.consumer?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.consumer?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Delivery Address</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800">{order.formattedAddress}</p>
              {order.deliveryInstructions && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Delivery Instructions:</strong> {order.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-green-600">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Notes */}
          {order.farmerNotes && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Your Notes</h4>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-yellow-800">{order.farmerNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;