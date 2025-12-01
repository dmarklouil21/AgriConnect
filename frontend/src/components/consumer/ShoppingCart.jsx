import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart as CartIcon, Plus, Minus, Trash2, Truck, Package, ArrowRight, 
  CreditCard, AlertCircle, Loader2, X, CheckCircle, Store, MapPin, Phone, User,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../../services/api';

// Safe fallback for images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f1f5f9'%3E%3Crect width='100' height='100' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const ShoppingCart = ({ onCartUpdate }) => {
  const [carts, setCarts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Checkout State
  const [activeCheckout, setActiveCheckout] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState(null); // stores productId
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { 
    fetchCarts(); 
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCart();
      const cartList = data.carts || [];
      setCarts(cartList);
      
      const totalItems = cartList.reduce((acc, cart) => acc + cart.items.length, 0);
      if(onCartUpdate) onCartUpdate(totalItems);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      setUpdatingId(productId);
      await apiService.updateCart(productId, newQuantity);
      await fetchCarts();
    } catch (err) {
      alert('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // 1. Open Modal
  const promptRemoveItem = (productId) => {
    setItemToDelete(productId);
  };

  // 2. Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiService.removeFromCart(itemToDelete);
      await fetchCarts();
      setItemToDelete(null); // Close modal on success
    } catch (err) {
      alert('Remove failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCheckoutSubmit = async (shippingData, cartId) => {
    setIsSubmitting(true);
    try {
      await apiService.checkout(shippingData, 'COD', cartId);
      setActiveCheckout(null);
      await fetchCarts(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && carts.length === 0) return (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3"/>
        <p>Loading your cart...</p>
    </div>
  );

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <CartIcon size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Your cart is empty</h3>
        <p className="text-slate-500 mt-2">Looks like you haven't added any produce yet.</p>
        <a href="/consumer/browse" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Shopping Cart</h1>
            <p className="text-slate-500 mt-1">You have items from <span className="font-bold text-blue-600">{carts.length}</span> different farmers.</p>
          </div>
      </div>
      
      <div className="grid gap-8">
        {carts.map(cart => {
            const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const shipping = subtotal > 50 ? 0 : 5.99;
            const tax = subtotal * 0.08; 
            const total = subtotal + shipping + tax;

            return (
            <div key={cart._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Cart Header */}
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <Store className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg leading-none">
                                {cart.farmer?.farmName || 'Local Farmer'}
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">Fulfilled by Farmer</span>
                        </div>
                    </div>
                    <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {cart.items.length} Items
                    </span>
                </div>

                <div className="p-6">
                    {/* Items List */}
                    <div className="space-y-6 mb-8">
                        {cart.items.map(item => {
                            const imageUrl = item.product?.productImage || PLACEHOLDER_IMAGE;

                            return (
                                <div key={item.product._id} className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                        <img 
                                            src={imageUrl} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                                        />
                                    </div>
                                    
                                    {/* Details */}
                                    <div className="flex-1 w-full text-center sm:text-left">
                                        <h4 className="font-bold text-slate-800 text-lg">{item.product.name}</h4>
                                        <p className="text-sm text-slate-500 mb-2">{item.product.category} • Sold per {item.product.unit}</p>
                                        <p className="text-emerald-600 font-bold text-lg">${item.product.price}</p>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} 
                                                disabled={item.quantity <= 1 || updatingId === item.product._id}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                                            >
                                                <Minus size={14} strokeWidth={3}/>
                                            </button>
                                            <span className="w-10 text-center font-bold text-slate-800">
                                                {updatingId === item.product._id ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)} 
                                                disabled={item.quantity >= item.product.stock || updatingId === item.product._id} 
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                                            >
                                                <Plus size={14} strokeWidth={3}/>
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => promptRemoveItem(item.product._id)} 
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Item"
                                        >
                                            <Trash2 size={20}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="w-full md:w-1/2 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Delivery Fee</span>
                                    <span className={shipping === 0 ? "text-emerald-600 font-bold" : ""}>
                                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Tax (Est.)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-2 flex justify-between items-center mt-2">
                                    <span className="font-bold text-slate-800 text-lg">Total</span>
                                    <span className="font-extrabold text-slate-900 text-2xl">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setActiveCheckout({ 
                                    cartId: cart._id, 
                                    total: total.toFixed(2), 
                                    farmerName: cart.farmer?.farmName 
                                })}
                                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Secure Checkout</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                        {shipping > 0 && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 w-fit">
                                <Truck size={14}/>
                                Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for Free Shipping
                            </div>
                        )}
                    </div>
                </div>
            </div>
            );
        })}
      </div>

      {/* Checkout Modal */}
      {activeCheckout && (
        <CheckoutModal 
          onClose={() => setActiveCheckout(null)} 
          onSubmit={handleCheckoutSubmit} 
          total={activeCheckout.total}
          cartId={activeCheckout.cartId}
          farmerName={activeCheckout.farmerName}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteModal 
            onConfirm={handleConfirmDelete}
            onCancel={() => setItemToDelete(null)}
            loading={isDeleting}
        />
      )}
    </div>
  );
};

// --- Checkout Modal ---
const CheckoutModal = ({ onClose, onSubmit, total, cartId, farmerName, isSubmitting }) => {
  const [formData, setFormData] = useState({
    fullName: '', address: '', city: '', zipCode: '', phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, cartId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-xl text-slate-800">Checkout</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
                Buying from <span className="font-semibold text-blue-600">{farmerName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                    <CreditCard size={20}/>
                </div>
                <div>
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Order Total</p>
                    <p className="text-2xl font-extrabold text-blue-900">${total}</p>
                </div>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <User size={18}/> Contact Info
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <input required name="fullName" onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Full Name" />
                        <input required name="phone" onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Phone Number" />
                    </div>
                </div>

                <div className="pt-2 space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <MapPin size={18}/> Shipping Address
                    </h4>
                    <input required name="address" onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Street Address" />
                    <div className="grid grid-cols-2 gap-4">
                        <input required name="city" onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="City" />
                        <input required name="zipCode" onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Zip Code" />
                    </div>
                </div>
            </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
            <button 
                form="checkout-form"
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? <Loader2 className="animate-spin"/> : <>Confirm Order <CheckCircle size={20}/></>}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                <AlertCircle size={12}/> Payment is Cash on Delivery (COD)
            </p>
        </div>
      </div>
    </div>
  );
};

// --- Delete Modal ---
const DeleteModal = ({ onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
                <Trash2 size={32}/>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Remove Item?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={onCancel} 
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm} 
                    disabled={loading} 
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Remove'}
                </button>
            </div>
        </div>
    </div>
);

export default ShoppingCart;