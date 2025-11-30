import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, X, 
  RefreshCw, Loader2, Upload, Clock, XCircle, Search, 
  Image as ImageIcon, Star, TrendingUp, MessageSquare, User, Calendar
} from 'lucide-react';
import { apiService } from '../../services/api';

// Safe fallback to prevent infinite network loops if an image URL is broken
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200' fill='%23f1f5f9'%3E%3Crect width='300' height='200' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  
  // Selection States
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdateProduct, setStockUpdateProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productForReviews, setProductForReviews] = useState(null);
  
  // Data States
  const [reviews, setReviews] = useState([]);
  
  // Form States
  const [newStock, setNewStock] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Loading States
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', stock: '', description: '', unit: 'kg', productImage: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      if (!refreshLoading) setLoading(true);
      const response = await apiService.getFarmerProducts();
      setProducts(response.products || []);
    } catch (error) {
      setError('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    setError('');
    await loadProducts();
    setSuccess('Refreshed!');
    setTimeout(() => setSuccess(''), 2000);
  };

  // --- CRUD Operations ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newProduct).forEach(key => formData.append(key, newProduct[key]));

    try {
      setAddLoading(true);
      const response = await apiService.createProduct(formData);
      setProducts(prev => [response.product, ...prev]);
      setShowAddModal(false);
      setNewProduct({ name: '', category: '', price: '', stock: '', description: '', unit: 'kg', productImage: '' });
      setSuccess('Product submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(editingProduct).forEach(key => {
        if (key === 'productImage') {
            if (editingProduct[key] instanceof File) {
                formData.append(key, editingProduct[key]);
            }
        } else {
            formData.append(key, editingProduct[key]);
        }
    });

    try {
      setEditLoading(true);
      const response = await apiService.updateProduct(editingProduct._id, formData);
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? response.product : p));
      setShowEditModal(false);
      setEditingProduct(null);
      setSuccess('Product updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      setStockLoading(true);
      const response = await apiService.updateProductStock(stockUpdateProduct._id, parseInt(newStock));
      setProducts(prev => prev.map(p => p._id === stockUpdateProduct._id ? response.product : p));
      setShowStockModal(false);
      setStockUpdateProduct(null);
      setNewStock('');
      setSuccess('Stock updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError('Failed to update stock');
    } finally {
      setStockLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await apiService.deleteProduct(productToDelete._id);
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
      setShowConfirmModal(false);
      setProductToDelete(null);
      setSuccess('Product removed.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewReviews = async (product) => {
      setProductForReviews(product);
      setShowReviewsModal(true);
      setReviewsLoading(true);
      setReviews([]); 
      
      try {
          const fetchedReviews = await apiService.getProductReviews(product._id);
          setReviews(fetchedReviews);
      } catch (error) {
          console.error("Failed to fetch reviews", error);
      } finally {
          setReviewsLoading(false);
      }
  };

  // --- Helpers ---
  const openEditModal = (product) => { setEditingProduct({ ...product }); setShowEditModal(true); };
  const openStockModal = (product) => { setStockUpdateProduct(product); setNewStock(product.stock.toString()); setShowStockModal(true); };
  const openDeleteConfirmation = (product) => { setProductToDelete(product); setShowConfirmModal(true); };
  const closeModal = () => { 
      setShowAddModal(false); 
      setShowEditModal(false); 
      setShowStockModal(false); 
      setShowReviewsModal(false);
      setError(''); 
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Meat', 'Eggs', 'Honey'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3"/>
        <p>Loading your inventory...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Harvest</h1>
          <p className="text-slate-500 mt-1">Manage products, track ratings, and update stock.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={handleRefresh} 
                disabled={refreshLoading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-2"
                title="Refresh List"
            >
                <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : ''}`}/>
                <span className="hidden sm:inline">Sync</span>
            </button>

            <button 
                onClick={() => setShowAddModal(true)} 
                className="flex-1 md:flex-none bg-gradient-to-r from-emerald-500 to-lime-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5"/> 
                <span>Add Product</span>
            </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5"/> {success}
          </div>
      )}
      {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5"/> {error}
          </div>
      )}

      {/* Search & Tabs Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        
        {/* Shorter Search Bar */}
        <div className="relative w-full md:w-72 flex-shrink-0 ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
            <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Divider (Desktop Only) */}
        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

        {/* Tabs Filter - Exact Style Requested */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar md:pb-0 w-full">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-5 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all relative ${
                        filterCategory === cat 
                        ? 'text-emerald-700 bg-emerald-50/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {cat}
                    {filterCategory === cat && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            onEdit={openEditModal} 
            onUpdateStock={openStockModal} 
            onDelete={openDeleteConfirmation} 
            onViewReviews={handleViewReviews}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No products found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your filters or add a new product.</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
          <ProductModal 
            title="Add New Product" 
            product={newProduct} 
            onChange={setNewProduct} 
            onSubmit={handleAddProduct} 
            onClose={closeModal} 
            actionText="Submit Product" 
            loading={addLoading} 
          />
      )}
      {showEditModal && editingProduct && (
          <ProductModal 
            title="Edit Product" 
            product={editingProduct} 
            onChange={setEditingProduct} 
            onSubmit={handleEditProduct} 
            onClose={closeModal} 
            actionText="Save Changes" 
            loading={editLoading} 
          />
      )}
      {showStockModal && stockUpdateProduct && (
          <StockModal 
            product={stockUpdateProduct} 
            newStock={newStock} 
            onStockChange={setNewStock} 
            onSubmit={handleUpdateStock} 
            onClose={closeModal} 
            loading={stockLoading} 
          />
      )}
      {showConfirmModal && productToDelete && (
          <DeleteModal 
            product={productToDelete} 
            onConfirm={handleConfirmDelete} 
            onCancel={() => setShowConfirmModal(false)} 
            loading={deleteLoading} 
          />
      )}
      {showReviewsModal && productForReviews && (
          <ReviewsModal
            product={productForReviews}
            reviews={reviews}
            loading={reviewsLoading}
            onClose={closeModal}
          />
      )}
    </div>
  );
};

// --- Sub-Component: Product Card ---
const ProductCard = ({ product, onEdit, onUpdateStock, onDelete, onViewReviews }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Approved': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, text: 'Approved' };
      case 'Rejected': return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, text: 'Rejected' };
      default: return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, text: 'In Review' };
    }
  };

  const statusConfig = getStatusConfig(product.status || 'Pending');
  const StatusIcon = statusConfig.icon;
  
  const rating = product.rating || 0;
  const reviewCount = product.reviewsCount || 0;
  const sales = product.salesCount || 0;

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Area */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img 
            src={product.productImage || PLACEHOLDER_IMAGE} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = PLACEHOLDER_IMAGE;
            }}
        />
        <div className="absolute top-3 right-3">
             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md ${statusConfig.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusConfig.text}</span>
            </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Title & Description */}
        <div className="mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{product.category}</div>
            <h3 className="font-bold text-slate-800 text-xl leading-tight mb-2 line-clamp-1" title={product.name}>{product.name}</h3>
            
            {/* Review & Sales Stats */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3 flex-wrap">
               <div 
                 onClick={() => onViewReviews(product)}
                 className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md cursor-pointer hover:bg-yellow-100 transition-colors"
                 title="View Reviews"
               >
                 <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                 <span>{rating.toFixed(1)}</span>
                 <span className="text-slate-400">({reviewCount})</span>
               </div>
               <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                 {/* <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> */}
                 <span>{sales} Sold</span>
               </div>
            </div>

            <p className="text-slate-500 text-sm line-clamp-2">{product.description || 'No description provided.'}</p>
        </div>

        {product.status === 'Rejected' && product.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-xs text-red-700">
             <span className="font-bold block mb-1">Reason for Rejection:</span>
             {product.rejectionReason}
          </div>
        )}

        {/* Price & Stock Row */}
        <div className="mt-auto flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
            <div>
                <span className="block text-xs text-slate-400 font-bold uppercase">Price</span>
                <span className="text-lg font-bold text-emerald-600">${product.price}<span className="text-sm text-slate-400 font-normal">/{product.unit}</span></span>
            </div>
            <div className="text-right">
                <span className="block text-xs text-slate-400 font-bold uppercase">Stock</span>
                <span className={`text-lg font-bold ${product.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                    {product.stock}
                </span>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-50">
            <button onClick={() => onEdit(product)} className="col-span-2 py-2 px-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                <Edit className="w-4 h-4"/> Edit
            </button>
            <button onClick={() => onUpdateStock(product)} className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center" title="Update Stock">
                <Package className="w-4 h-4"/>
            </button>
            <button onClick={() => onDelete(product)} className="py-2 px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center" title="Delete">
                <Trash2 className="w-4 h-4"/>
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Modern Modal Layout ---
const ModalLayout = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="w-5 h-5 text-slate-500"/>
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

// --- Reviews Modal ---
const ReviewsModal = ({ product, reviews, loading, onClose }) => {
    return (
        <ModalLayout title={`Reviews for ${product.name}`} onClose={onClose}>
            {loading ? (
                <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            {review.consumer?.firstName} {review.consumer?.lastName}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={12} 
                                                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm pl-10 leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet for this product.</p>
                </div>
            )}
        </ModalLayout>
    );
};

// --- Form Modal ---
const ProductModal = ({ title, product, onChange, onSubmit, onClose, actionText, loading }) => {
  const [preview, setPreview] = useState(product.productImage);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if(file) {
        onChange(prev => ({ ...prev, productImage: file }));
        setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <ModalLayout title={title} onClose={onClose}>
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Image Uploader */}
            <div 
                onClick={() => fileRef.current.click()} 
                className="group relative h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all overflow-hidden bg-slate-50"
            >
                {preview ? (
                    <>
                        <img 
                            src={typeof preview === 'string' && preview.startsWith('blob') ? preview : `${preview}`} 
                            className="w-full h-full object-cover" 
                            alt="Preview"
                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold flex items-center gap-2"><Upload className="w-5 h-5"/> Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                            <ImageIcon className="w-6 h-6"/>
                        </div>
                        <span className="font-bold">Click to upload photo</span>
                        <p className="text-xs mt-1">JPG, PNG up to 5MB</p>
                    </div>
                )}
                <input type="file" ref={fileRef} onChange={handleFile} hidden accept="image/*" />
            </div>

            {/* Inputs */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Product Name</label>
                <input 
                    value={product.name} 
                    onChange={e => onChange({...product, name: e.target.value})} 
                    placeholder="e.g. Sweet Strawberries" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
                    required 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Category</label>
                    <select 
                        value={product.category} 
                        onChange={e => onChange({...product, category: e.target.value})} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                        required
                    >
                        <option value="">Select...</option>
                        {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Meat', 'Eggs', 'Honey', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Unit</label>
                    <select 
                        value={product.unit} 
                        onChange={e => onChange({...product, unit: e.target.value})} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                        required
                    >
                        {['kg', 'g', 'lb', 'piece', 'dozen', 'bunch', 'pack', 'liter'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Price ($)</label>
                    <input 
                        type="number" 
                        value={product.price} 
                        onChange={e => onChange({...product, price: e.target.value})} 
                        placeholder="0.00" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Initial Stock</label>
                    <input 
                        type="number" 
                        value={product.stock} 
                        onChange={e => onChange({...product, stock: e.target.value})} 
                        placeholder="0" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                        required 
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Description</label>
                <textarea 
                    value={product.description} 
                    onChange={e => onChange({...product, description: e.target.value})} 
                    placeholder="Describe your product..." 
                    rows="3" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                ></textarea>
            </div>

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin"/> : actionText}
            </button>
        </form>
    </ModalLayout>
  );
};

// --- Stock Modal ---
const StockModal = ({ product, newStock, onStockChange, onSubmit, onClose, loading }) => (
    <ModalLayout title="Update Inventory" onClose={onClose}>
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Stock</span>
                <p className="text-4xl font-extrabold text-slate-800 mt-1">{product.stock} <span className="text-lg text-slate-400 font-medium">{product.unit}</span></p>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">New Total Quantity</label>
                <input 
                    type="number" 
                    value={newStock} 
                    onChange={e => onStockChange(e.target.value)} 
                    className="w-full p-4 text-center text-2xl font-bold bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    autoFocus 
                />
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Update Stock'}
                </button>
            </div>
        </form>
    </ModalLayout>
);

// --- Delete Modal ---
const DeleteModal = ({ product, onConfirm, onCancel, loading }) => (
    <ModalLayout title="Delete Product" onClose={onCancel}>
        <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-bounce">
                <Trash2 size={32}/>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Are you sure?</h3>
            <p className="text-slate-500 mb-8">
                You are about to delete <span className="font-bold text-slate-800">{product.name}</span>. This action cannot be undone and will remove the item from the marketplace immediately.
            </p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Keep Product</button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Yes, Delete It'}
                </button>
            </div>
        </div>
    </ModalLayout>
);

export default ProductManagement;