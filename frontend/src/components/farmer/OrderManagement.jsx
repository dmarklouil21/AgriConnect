import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, Truck, XCircle, Eye, X, AlertTriangle, 
  Loader2, RefreshCw, Package, MapPin, User, Calendar, Filter,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/api';

// Safe fallback for images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f1f5f9'%3E%3Crect width='100' height='100' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusLoading, setStatusLoading] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    loadOrders();
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
    } finally {
      setLoading(false);
    }
  };
  console.log(orders);
  const handleRefresh = async () => {
    setRefreshLoading(true);
    await loadOrders();
    setRefreshLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusLoading(prev => ({ ...prev, [orderId]: true }));
      await apiService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSuccess(`Order marked as ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedOrder(null); // Close modal if open
    } catch (error) {
      setError(error.response?.data?.message || 'Update failed');
    } finally {
      setStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // --- UI Helpers ---
  const statuses = ['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (loading && !refreshLoading) return (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3"/>
        <p>Loading orders...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 mt-1">Manage and fulfill your customer orders.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshLoading} 
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : ''}`}/>
          <span>Sync Orders</span>
        </button>
      </div>

      {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5"/> {success}
          </div>
      )}
      {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5"/> {error}
          </div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all relative ${
              filterStatus === status 
                ? 'text-emerald-700 bg-emerald-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status === 'all' ? 'All Orders' : status}
            {filterStatus === status && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {orders.map((order) => (
          <OrderCard 
            key={order._id} 
            order={order} 
            onStatusChange={handleStatusChange}
            onViewDetails={() => setSelectedOrder(order)}
            loading={statusLoading[order._id]}
          />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No orders found</h3>
          <p className="text-slate-500 mt-2">There are no orders with this status.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          loading={statusLoading[selectedOrder._id]}
        />
      )}
    </div>
  );
};

// --- Sub-Component: Order Card ---
const OrderCard = ({ order, onStatusChange, onViewDetails, loading }) => {
  const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Processing: 'bg-blue-100 text-blue-700 border-blue-200',
    Shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      {/* Top Row: ID & Status */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-slate-800">#{order.orderNumber}</span>
            <span className="text-slate-400 text-sm">•</span>
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
               <Calendar size={14}/> {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-1">
             <User size={14} /> 
             {order.consumer?.firstName || order.user?.firstName} {order.consumer?.lastName || order.user?.lastName}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </div>
      </div>

      {/* Middle Row: Product Preview Images */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items ({order.items.length})</p>
        
        {/* Fixed: Removed overflow-hidden and added padding to accommodate badges */}
        <div className="flex items-center gap-3 pt-2 pl-1 flex-wrap"> 
          {order.items.slice(0, 4).map((item, idx) => {
            const imageSrc = item.product?.productImage || item.productImage || PLACEHOLDER_IMAGE;
            
            return (
              <div key={idx} className="relative group">
                <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                  <img 
                    src={imageSrc} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                </div>
                {/* Badge is positioned absolutely relative to this div */}
                <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                  {item.quantity}
                </div>
              </div>
            );
          })}
          {order.items.length > 4 && (
            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
              +{order.items.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Total & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
          <p className="text-xl font-extrabold text-emerald-600">${order.totalAmount.toFixed(2)}</p>
        </div>
        
        <div className="flex gap-2">
          {order.status === 'Pending' ? (
            <>
              <button 
                onClick={() => onStatusChange(order._id, 'Cancelled')}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={() => onStatusChange(order._id, 'Processing')}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin"/>} Accept
              </button>
            </>
          ) : (
            <button 
              onClick={onViewDetails}
              className="px-5 py-2 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              Manage Order <ArrowRight size={16}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Order Details Modal ---
const OrderDetailsModal = ({ order, onClose, onStatusChange, loading }) => {
  const getStatusDisplay = (status) => {
    const map = {
      Pending: 'Pending Approval',
      Processing: 'Processing',
      Shipped: 'Out for Delivery',
      Delivered: 'Completed',
      Cancelled: 'Cancelled'
    };
    return map[status] || status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Order #{order.orderNumber}</h2>
            <p className="text-slate-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X size={20}/>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Status & Actions Bar */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium text-sm">Current Status:</span>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full font-bold text-slate-700 shadow-sm">
                {getStatusDisplay(order.status)}
              </span>
            </div>
            
            <div className="flex gap-2">
              {order.status === 'Processing' && (
                <button 
                  onClick={() => onStatusChange(order._id, 'Shipped')} 
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin"/>} Mark as Shipped <Truck size={18}/>
                </button>
              )}
              {order.status === 'Shipped' && (
                <button 
                  onClick={() => onStatusChange(order._id, 'Delivered')} 
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin"/>} Complete Order <CheckCircle size={18}/>
                </button>
              )}
            </div>
          </div>

          {/* Items List (With Images) */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="text-emerald-500"/> Order Items
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-center">Unit Price</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => {
                    const imageSrc = item.product?.productImage || item.productImage || PLACEHOLDER_IMAGE;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                              <img 
                                src={imageSrc} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-700">{item.name}</p>
                              {item.product?.category && <p className="text-xs text-slate-400">{item.product.category}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{item.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
               <div className="text-right">
                 <span className="text-slate-500 text-sm font-medium mr-4">Order Total</span>
                 <span className="text-2xl font-extrabold text-emerald-600">${order.totalAmount.toFixed(2)}</span>
               </div>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="text-blue-500"/> Customer Details
              </h3>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-sm">Name</span>
                  <span className="font-medium text-slate-800">{order.consumer?.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-sm">Email</span>
                  <span className="font-medium text-slate-800">{order.consumer?.email || order.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Phone</span>
                  <span className="font-medium text-slate-800">{order.consumer?.phone || order.shippingAddress?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="text-purple-500"/> Delivery Address
              </h3>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="font-medium text-slate-800 leading-relaxed">
                  {order.shippingAddress?.address}
                </p>
                <p className="text-slate-600 mt-1">
                  {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    Home Delivery
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Payment: {order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderManagement;