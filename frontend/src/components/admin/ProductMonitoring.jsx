import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  Loader2, Search, Eye, CheckCircle, XCircle, AlertTriangle, 
  Clock, RefreshCw, Package, ArrowUpRight, Filter, X
} from 'lucide-react';

// Safe fallback for images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f1f5f9'%3E%3Crect width='100' height='100' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductMonitoring = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Action State
  const [actionType, setActionType] = useState(''); // approve, reject, pending
  const [actionProduct, setActionProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filterStatus]); 

  const loadProducts = async () => {
    if (!refreshLoading) setLoading(true);
    try {
      const data = await apiService.getAllProducts({ 
          status: filterStatus, 
          search: searchTerm 
      });
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await loadProducts();
  };

  const handleStatusChange = async () => {
    setIsSubmitting(true);
    let newStatus = '';
    
    switch (actionType) {
      case 'approve': newStatus = 'Approved'; break;
      case 'reject': newStatus = 'Rejected'; break;
      case 'pending': newStatus = 'Pending'; break;
      default: break;
    }

    try {
      await apiService.updateProductStatus(actionProduct.id, newStatus, rejectionReason);
      
      setProducts(products.map(p => 
        p.id === actionProduct.id 
          ? { ...p, status: newStatus, rejectionReason: newStatus === 'Rejected' ? rejectionReason : '' } 
          : p
      ));
      
      setShowConfirmModal(false);
      setActionProduct(null);
      setRejectionReason('');
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const openViewModal = (product) => { setSelectedProduct(product); setShowViewModal(true); };
  const openConfirmModal = (product, action) => { 
      setActionProduct(product); 
      setActionType(action); 
      setRejectionReason(product.rejectionReason || ''); 
      setShowConfirmModal(true); 
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActionDetails = () => {
    switch (actionType) {
      case 'approve': return { title: 'Approve Product', message: `Allow "${actionProduct?.name}" to be sold on the marketplace?`, btn: 'Approve', color: 'bg-emerald-600', input: false };
      case 'reject': return { title: 'Reject Product', message: `Deny "${actionProduct?.name}"? Please provide a reason.`, btn: 'Reject', color: 'bg-red-600', input: true };
      case 'pending': return { title: 'Suspend Product', message: `Set "${actionProduct?.name}" back to Pending review?`, btn: 'Suspend', color: 'bg-amber-600', input: false };
      default: return { title: 'Confirm', message: 'Proceed?', btn: 'Confirm', color: 'bg-blue-600' };
    }
  };

  if (loading) return <div className="flex justify-center h-96 items-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Product Monitoring</h1>
          <p className="text-slate-500 mt-1">Review, approve, or reject farmer product listings.</p>
        </div>
        <button 
            onClick={handleRefresh} 
            disabled={refreshLoading}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center gap-2"
        >
            <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : ''}`}/>
            <span>Sync</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80 flex-shrink-0 ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
            <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
            />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

        {/* Status Tabs (Underline Style) */}
        <div className="w-full overflow-x-auto no-scrollbar flex items-center gap-2">
            {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-5 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all relative ${
                        filterStatus === status 
                        ? 'text-purple-700 bg-purple-50/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {status === 'all' ? 'All Products' : status}
                    {filterStatus === status && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Product Details</th>
                        <th className="px-6 py-4">Farmer</th>
                        <th className="px-6 py-4">Price / Stock</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                            {/* Product Info */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                        <img 
                                            src={product.images?.[0] ? `${product.images[0]}` : PLACEHOLDER_IMAGE}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{product.name}</div>
                                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-fit mt-1">{product.category}</div>
                                    </div>
                                </div>
                            </td>
                            
                            {/* Farmer Info */}
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-slate-700">{product.farmer}</div>
                            </td>

                            {/* Price/Stock */}
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">${product.price}</div>
                                <div className="text-xs text-slate-500">{product.stock} {product.unit} left</div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.status)}`}>
                                    {product.status === 'Pending' && <Clock size={12} className="mr-1"/>}
                                    {product.status === 'Approved' && <CheckCircle size={12} className="mr-1"/>}
                                    {product.status === 'Rejected' && <XCircle size={12} className="mr-1"/>}
                                    {product.status}
                                </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openViewModal(product)} 
                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-purple-100 hover:text-purple-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={16}/>
                                    </button>
                                    
                                    {product.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => openConfirmModal(product, 'approve')} 
                                                className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => openConfirmModal(product, 'reject')} 
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Reject"
                                            >
                                                <XCircle size={16}/>
                                            </button>
                                        </>
                                    )}
                                    {product.status === 'Approved' && (
                                        <button 
                                            onClick={() => openConfirmModal(product, 'pending')} 
                                            className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                                            title="Suspend / Re-evaluate"
                                        >
                                            <AlertTriangle size={16}/>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50"/>
                    <p>No products found matching your criteria.</p>
                </div>
            )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg p-0 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            {/* Modal Header/Image */}
            <div className="relative h-56 bg-slate-100">
                <img 
                    src={selectedProduct.images?.[0] ? `${selectedProduct.images[0]}` : PLACEHOLDER_IMAGE} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button 
                    onClick={() => setShowViewModal(false)} 
                    className="absolute top-4 right-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 backdrop-blur-md transition-colors"
                >
                    <X size={20}/>
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{selectedProduct.category}</div>
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                </div>
            </div>
            
            <div className="p-6 space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-400 font-bold uppercase">Price</span>
                        <p className="text-lg font-bold text-slate-800">${selectedProduct.price}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-400 font-bold uppercase">Stock</span>
                        <p className="text-lg font-bold text-slate-800">{selectedProduct.stock} {selectedProduct.unit}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 mb-2">Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.description || "No description provided."}</p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Farmer:</span>
                        <span className="font-medium text-purple-700">{selectedProduct.farmer}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-slate-500">Current Status:</span>
                        <span className={`font-bold ${
                            selectedProduct.status === 'Approved' ? 'text-emerald-600' : 
                            selectedProduct.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                        }`}>{selectedProduct.status}</span>
                    </div>
                </div>

                {selectedProduct.rejectionReason && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                        <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-red-800 uppercase">Rejection Reason</span>
                            <p className="text-sm text-red-700 mt-1">{selectedProduct.rejectionReason}</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && actionProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl animate-in zoom-in-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                actionType === 'approve' ? 'bg-emerald-100 text-emerald-600' : 
                actionType === 'reject' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
                {actionType === 'approve' ? <CheckCircle size={32}/> : 
                 actionType === 'reject' ? <XCircle size={32}/> : <Clock size={32}/>}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{getActionDetails().title}</h3>
            <p className="text-slate-500 mb-6">{getActionDetails().message}</p>
            
            {getActionDetails().input && (
                <textarea 
                    className="w-full border border-slate-200 rounded-xl p-4 mb-6 focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50" 
                    rows="3" 
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            )}

            <div className="flex gap-3">
                <button 
                    onClick={() => setShowConfirmModal(false)} 
                    disabled={isSubmitting} 
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleStatusChange} 
                    disabled={isSubmitting || (getActionDetails().input && !rejectionReason.trim())} 
                    className={`flex-1 text-white py-3 rounded-xl font-bold flex justify-center items-center shadow-lg transition-all hover:scale-[1.02] ${getActionDetails().color}`}
                >
                    {isSubmitting ? <Loader2 className="animate-spin"/> : getActionDetails().btn}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMonitoring;