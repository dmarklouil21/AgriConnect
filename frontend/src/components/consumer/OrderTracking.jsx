import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, CheckCircle, Clock, X, MapPin, Phone, User, 
  Loader2, Eye, Ban, AlertTriangle, Star, Calendar, ChevronRight,
  ShoppingBag, Check, AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';

// Safe fallback for images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f1f5f9'%3E%3Crect width='100' height='100' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Review State
  const [reviewProduct, setReviewProduct] = useState(null); 
  const [reviewOrderId, setReviewOrderId] = useState(null);

  // Cancellation State
  const [orderToCancel, setOrderToCancel] = useState(null); // Stores ID for modal
  const [isCancelling, setIsCancelling] = useState(false);

  // Notification State (Toast)
  const [toast, setToast] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const fetchOrders = async () => {
    try {
      const data = await apiService.getConsumerOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      showToast('error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // 1. Trigger the modal
  const promptCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
  };

  // 2. Perform the API call
  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setIsCancelling(true);
    try {
      await apiService.cancelOrder(orderToCancel);
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order._id === orderToCancel ? { ...order, status: 'Cancelled' } : order
      );
      setOrders(updatedOrders);
      
      // Update the detailed view if it's open
      if (selectedOrder && selectedOrder._id === orderToCancel) {
          setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
      }
      
      showToast('success', 'Order cancelled successfully');
      setOrderToCancel(null); // Close modal
    } catch (err) {
      showToast('error', err.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const openReviewModal = (product, orderId) => {
    setReviewProduct(product);
    setReviewOrderId(orderId);
  };

  const handleReviewSuccess = () => {
    showToast('success', 'Review submitted successfully!');
  };

  const handleReviewError = (msg) => {
    showToast('error', msg);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3"/>
        <p>Loading your orders...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-24 right-4 px-6 py-3 rounded-xl shadow-xl z-[70] flex items-center gap-3 animate-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="bg-white/20 p-1 rounded-full">
            {toast.type === 'success' ? <Check className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
          <p className="text-slate-500 mt-1">Track current deliveries and view purchase history.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            label="Total Orders" 
            value={orders.length} 
            icon={Package} 
            color="blue"
        />
        <StatCard 
            label="In Progress" 
            value={orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length} 
            icon={Truck} 
            color="amber"
        />
        <StatCard 
            label="Completed" 
            value={orders.filter(o => o.status === 'Delivered').length} 
            icon={CheckCircle} 
            color="emerald"
        />
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <ShoppingBag size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-700">No orders yet</h3>
           <p className="text-slate-500 mt-2">Start shopping to fill this page!</p>
           <a href="/consumer/browse" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
             Browse Products
           </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
                <OrderCard 
                    key={order._id}
                    order={order}
                    onViewDetails={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                />
            ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal 
            order={selectedOrder}
            onClose={() => setShowOrderModal(false)}
            onCancelOrder={promptCancelOrder}
            onReview={openReviewModal}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {orderToCancel && (
        <CancelOrderModal 
            onConfirm={confirmCancelOrder}
            onCancel={() => setOrderToCancel(null)}
            loading={isCancelling}
        />
      )}

      {/* Review Modal */}
      {reviewProduct && (
        <LeaveReviewModal 
            product={reviewProduct} 
            orderId={reviewOrderId} 
            onClose={() => setReviewProduct(null)} 
            onSuccess={handleReviewSuccess}
            onError={handleReviewError}
        />
      )}
    </div>
  );
};

// --- Sub-Component: Order Card ---
const OrderCard = ({ order, onViewDetails }) => {
    const statusConfig = {
        Pending: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
        Processing: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package },
        Shipped: { color: 'text-purple-600 bg-purple-50 border-purple-100', icon: Truck },
        Delivered: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle },
        Cancelled: { color: 'text-red-600 bg-red-50 border-red-100', icon: Ban },
    };

    const config = statusConfig[order.status] || statusConfig.Pending;
    const StatusIcon = config.icon;

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={onViewDetails}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color} ${config.bg} ${config.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                    <p className="text-xl font-extrabold text-slate-800">${order.totalAmount.toFixed(2)}</p>
                </div>
            </div>

            {/* Preview Images */}
            <div className="flex items-center gap-2 mb-6">
                {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative">
                        <img 
                            src={item.product?.productImage || item.productImage || PLACEHOLDER_IMAGE}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                        />
                        <div className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] px-1 rounded-tl-md">
                            x{item.quantity}
                        </div>
                    </div>
                ))}
                {order.items.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        +{order.items.length - 4}
                    </div>
                )}
            </div>

            <div className="flex items-center text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                View Details <ChevronRight className="w-4 h-4 ml-1" />
            </div>
        </div>
    );
};

// --- Sub-Component: Stats Card ---
const StatCard = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
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

// --- Order Details Modal ---
const OrderDetailsModal = ({ order, onClose, onCancelOrder, onReview }) => {
    const getStatusDescription = (status) => {
        switch (status) {
          case 'Delivered': return 'Package delivered successfully.';
          case 'Shipped': return 'Your order is on the way.';
          case 'Processing': return 'Farmer is packing your order.';
          case 'Pending': return 'Waiting for farmer confirmation.';
          case 'Cancelled': return 'This order has been cancelled.';
          default: return 'Status update pending.';
        }
    };

    // Timeline logic
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentStep = steps.indexOf(order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Order #{order._id.slice(-6).toUpperCase()}</h2>
                        <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500"/>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Timeline */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{isCancelled ? 'Order Cancelled' : order.status}</h3>
                                <p className="text-sm text-slate-500">{getStatusDescription(order.status)}</p>
                            </div>
                            {['Pending', 'Processing'].includes(order.status) && (
                                <button 
                                    onClick={() => onCancelOrder(order._id)} 
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Ban className="w-4 h-4"/> Cancel Order
                                </button>
                            )}
                        </div>

                        {!isCancelled && (
                            <div className="relative flex justify-between">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded-full"></div>
                                <div 
                                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-500" 
                                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                ></div>

                                {steps.map((step, idx) => {
                                    const isCompleted = idx <= currentStep;
                                    const isCurrent = idx === currentStep;
                                    
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-colors ${
                                                isCompleted 
                                                ? 'bg-blue-500 border-blue-100 text-white' 
                                                : 'bg-white border-slate-100 text-slate-300'
                                            }`}>
                                                {isCompleted ? <CheckCircle size={14} fill="currentColor" className="text-white"/> : <div className="w-2 h-2 bg-slate-300 rounded-full"/>}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-blue-500"/> Items
                        </h4>
                        <div className="space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-100 transition-colors">
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                        <img 
                                            src={item.product?.productImage || item.productImage || PLACEHOLDER_IMAGE}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800">{item.name}</h5>
                                        <p className="text-sm text-slate-500">{item.quantity} x ${item.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800 mb-2">${(item.quantity * item.price).toFixed(2)}</p>
                                        {(order.status === 'Delivered' || order.status === 'Completed') && (
                                            <button 
                                                onClick={() => onReview(item.product, order._id)}
                                                className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-1 ml-auto"
                                            >
                                                <Star size={12}/> Rate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Shipping Address</h5>
                            <p className="font-medium text-slate-700 text-sm">
                                {order.shippingAddress.address}<br/>
                                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                            </p>
                        </div>
                        <div className="text-right">
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Total Amount</h5>
                            <p className="text-2xl font-extrabold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-slate-400 mt-1">Paid via {order.paymentMethod}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Cancel Order Confirmation Modal ---
const CancelOrderModal = ({ onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
                <Ban size={32}/>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Cancel Order?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={onCancel} 
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                    Keep Order
                </button>
                <button 
                    onClick={onConfirm} 
                    disabled={loading} 
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Yes, Cancel'}
                </button>
            </div>
        </div>
    </div>
);

// --- Leave Review Modal ---
const LeaveReviewModal = ({ product, orderId, onClose, onSuccess, onError }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.addReview({
        productId: product._id, 
        orderId: orderId,
        rating,
        comment
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      if (onError) onError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Rate Product</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
        </div>

        <div className="flex items-center gap-4 mb-8 bg-blue-50 p-4 rounded-2xl border border-blue-100">
           <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-blue-200 shadow-sm flex-shrink-0">
              <img 
                src={product.productImage || PLACEHOLDER_IMAGE} 
                className="w-full h-full object-cover"
                onError={(e) => e.target.src=PLACEHOLDER_IMAGE}
              />
           </div>
           <div>
              <p className="font-bold text-slate-800 line-clamp-1">{product.name}</p>
              <p className="text-xs text-blue-600 font-medium">How was the quality?</p>
           </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating) 
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' 
                      : 'text-slate-200 fill-slate-100'
                  }`} 
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Your Review</label>
            <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here... (e.g. Fresh and tasty!)"
                className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px] resize-none text-slate-700 bg-slate-50 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-lg shadow-blue-200"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-6 h-6"/> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderTracking;