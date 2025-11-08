// components/consumer/OrderTracking.jsx
import React, { useState } from 'react';

const OrderTracking = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const orders = [
    { 
      id: 'ORD-001', 
      date: '2024-03-15', 
      status: 'Completed', 
      total: 45.98, 
      items: [
        { id: 1, name: 'Organic Tomatoes', quantity: 2, price: 4.99, total: 9.98, farmer: 'Green Valley Farm' },
        { id: 2, name: 'Fresh Carrots', quantity: 3, price: 3.49, total: 10.47, farmer: 'Sunshine Farms' },
        { id: 3, name: 'Green Lettuce', quantity: 4, price: 2.99, total: 11.96, farmer: 'Green Valley Farm' }
      ],
      shippingAddress: '123 Main Street, Apt 4B, New York, NY 10001',
      paymentMethod: 'Credit Card (**** 4242)',
      orderDate: '2024-03-15 10:30 AM',
      deliveryDate: '2024-03-16 2:15 PM',
      farmer: 'Green Valley Farm',
      farmerPhone: '+1 (555) 123-4567',
      deliveryNotes: 'Leave at front door if not home'
    },
    { 
      id: 'ORD-002', 
      date: '2024-03-14', 
      status: 'Accepted', 
      total: 32.47, 
      items: [
        { id: 4, name: 'Sweet Apples', quantity: 2, price: 5.99, total: 11.98, farmer: 'Orchard Fresh' },
        { id: 5, name: 'Farm Eggs', quantity: 1, price: 6.99, total: 6.99, farmer: 'Happy Hens' }
      ],
      shippingAddress: '456 Oak Avenue, Brooklyn, NY 11201',
      paymentMethod: 'PayPal',
      orderDate: '2024-03-14 3:45 PM',
      deliveryDate: 'Estimated: 2024-03-16',
      farmer: 'Orchard Fresh',
      farmerPhone: '+1 (555) 987-6543',
      deliveryNotes: 'Ring bell twice'
    },
    { 
      id: 'ORD-003', 
      date: '2024-03-13', 
      status: 'Pending', 
      total: 28.99, 
      items: [
        { id: 6, name: 'Organic Spinach', quantity: 3, price: 3.99, total: 11.97, farmer: 'Green Valley Farm' },
        { id: 7, name: 'Whole Wheat Bread', quantity: 2, price: 4.49, total: 8.98, farmer: 'Artisan Bakery' }
      ],
      shippingAddress: '789 Pine Road, Queens, NY 11355',
      paymentMethod: 'Credit Card (**** 1234)',
      orderDate: '2024-03-13 9:15 AM',
      deliveryDate: 'Pending acceptance',
      farmer: 'Multiple Farmers',
      farmerPhone: 'Varies by item',
      deliveryNotes: 'Call upon arrival'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return '✅';
      case 'Accepted': return '📦';
      case 'Pending': return '⏳';
      case 'Shipped': return '🚚';
      case 'Cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Completed': return 'Your order has been delivered and completed.';
      case 'Accepted': return 'The farmer has accepted your order and is preparing it for delivery.';
      case 'Pending': return 'Your order is waiting for farmer confirmation.';
      case 'Shipped': return 'Your order is out for delivery.';
      case 'Cancelled': return 'This order has been cancelled.';
      default: return 'Order status unknown.';
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderDetails = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Tracking</h2>
          <p className="text-gray-600">Monitor your orders and their status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{orders.length}</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {orders.filter(order => order.status === 'Completed').length}
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {orders.filter(order => order.status !== 'Completed').length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                    >
                      View Details
                    </button>
                    {/* <button className="text-green-600 hover:text-green-900 font-medium">
                      Track
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Order Details</h3>
                <p className="text-gray-600">Order {selectedOrder.id}</p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Order Status */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(selectedOrder.status)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Order Status</h4>
                    <p className="text-gray-600">{getStatusDescription(selectedOrder.status)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Order Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🌱</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{item.name}</h5>
                        <p className="text-sm text-gray-600">by {item.farmer}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${item.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">$5.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${(selectedOrder.total * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">
                        ${(selectedOrder.total + 5.99 + (selectedOrder.total * 0.08)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Order Information</h4>
                
                {/* Timeline */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Order Timeline</h5>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Order Placed</p>
                        <p className="text-xs text-gray-500">{selectedOrder.orderDate}</p>
                      </div>
                    </div>
                    {selectedOrder.status === 'Completed' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Order Accepted</p>
                            <p className="text-xs text-gray-500">2024-03-15 11:45 AM</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Out for Delivery</p>
                            <p className="text-xs text-gray-500">2024-03-16 1:00 PM</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Delivered</p>
                            <p className="text-xs text-gray-500">{selectedOrder.deliveryDate}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-2">Shipping Address</h5>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">{selectedOrder.shippingAddress}</p>
                    {selectedOrder.deliveryNotes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Notes:</strong> {selectedOrder.deliveryNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Farmer Information */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-2">Farmer Information</h5>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800 font-medium">{selectedOrder.farmer}</p>
                    <p className="text-sm text-gray-600">Phone: {selectedOrder.farmerPhone}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Payment Method</h5>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Contact Farmer
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;