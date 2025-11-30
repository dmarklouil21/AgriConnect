import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Loader2, Search, Filter, Eye, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

const ProductMonitoring = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all'); // all, Pending, Approved, Rejected
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
  }, [filterStatus]); // Reload when tab changes

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllProducts({ 
          status: filterStatus, 
          search: searchTerm 
      });
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
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
      
      // Update local state
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
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionDetails = () => {
    switch (actionType) {
      case 'approve': return { title: 'Approve Product', message: `Approve "${actionProduct?.name}"?`, btn: 'Approve', color: 'bg-green-600', input: false };
      case 'reject': return { title: 'Reject Product', message: `Reject "${actionProduct?.name}"?`, btn: 'Reject', color: 'bg-red-600', input: true };
      case 'pending': return { title: 'Set Pending', message: `Set "${actionProduct?.name}" to Pending?`, btn: 'Set Pending', color: 'bg-yellow-600', input: false };
      default: return { title: 'Confirm', message: 'Proceed?', btn: 'Confirm', color: 'bg-blue-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Monitoring</h2>
          <p className="text-gray-600">Review and manage platform products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
            {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
                <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === status ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    {status}
                </button>
            ))}
        </div>
        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4"/>
            <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-600 w-8 h-8"/></div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">Stock: {product.stock} {product.unit}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.farmer}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{product.category}</span></td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${product.price}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium flex gap-2">
                        <button onClick={() => openViewModal(product)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Eye className="w-4 h-4"/></button>
                        {product.status === 'Pending' && (
                            <>
                                <button onClick={() => openConfirmModal(product, 'approve')} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle className="w-4 h-4"/></button>
                                <button onClick={() => openConfirmModal(product, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle className="w-4 h-4"/></button>
                            </>
                        )}
                        {product.status === 'Approved' && (
                             <button onClick={() => openConfirmModal(product, 'pending')} className="text-yellow-600 hover:bg-yellow-50 p-1 rounded" title="Suspend"><Clock className="w-4 h-4"/></button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {products.length === 0 && <div className="p-12 text-center text-gray-500">No products found.</div>}
            </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                <button onClick={() => setShowViewModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <div className="space-y-4">
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    {selectedProduct.images?.[0] ? 
                        <img src={`http://localhost:5000${selectedProduct.images[0]}`} className="h-full w-full object-cover rounded-lg"/> : 
                        <span className="text-4xl">🌱</span>
                    }
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500 block">Category</span>{selectedProduct.category}</div>
                    <div><span className="text-gray-500 block">Price</span>${selectedProduct.price} / {selectedProduct.unit}</div>
                    <div><span className="text-gray-500 block">Farmer</span>{selectedProduct.farmer}</div>
                    <div><span className="text-gray-500 block">Status</span><span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedProduct.status)}`}>{selectedProduct.status}</span></div>
                </div>

                <div><span className="text-gray-500 block text-sm">Description</span><p className="text-gray-700">{selectedProduct.description}</p></div>

                {selectedProduct.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <span className="text-red-800 font-medium block text-xs uppercase">Rejection Reason</span>
                        <p className="text-red-700 text-sm">{selectedProduct.rejectionReason}</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && actionProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{getActionDetails().title}</h3>
            <p className="text-gray-600 mb-4">{getActionDetails().message}</p>
            
            {getActionDetails().input && (
                <textarea 
                    className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500" 
                    rows="3" 
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            )}

            <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} disabled={isSubmitting} className="flex-1 bg-gray-100 py-2 rounded-lg">Cancel</button>
                <button onClick={handleStatusChange} disabled={isSubmitting || (getActionDetails().input && !rejectionReason.trim())} className={`flex-1 text-white py-2 rounded-lg flex justify-center items-center ${getActionDetails().color}`}>
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4"/> : getActionDetails().btn}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMonitoring;