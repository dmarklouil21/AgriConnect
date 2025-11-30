import React, { useState, useEffect } from 'react';
import { 
  Search, Package, Star, ShoppingCart, Plus, Minus, X, 
  CheckCircle, AlertTriangle, Eye, User, Loader2, Check,
  Filter, ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/api';

// Safe fallback image
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200' fill='%23f1f5f9'%3E%3Crect width='300' height='200' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductBrowsing = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Meat', 'Eggs', 'Honey'];

  useEffect(() => {
    loadProducts();
  }, []);

  // Auto-hide success toast
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(); 
      // Handle response structure differences if any
      const productList = Array.isArray(response) ? response : (response.products || []);
      setProducts(productList);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, quantity) => {
    try {
        await apiService.addToCart(product._id, quantity);
        setSuccessMsg(`Added ${quantity} ${product.name} to cart!`);
        setShowDetailModal(false);
        
        if(onCartUpdate) {
            // onCartUpdate(prev => prev + quantity); // Optional
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Error adding to cart');
    }
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(product => {
    const farmerName = product.farmer?.farmName || '';
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'name': default: return a.name.localeCompare(b.name);
    }
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3"/>
        <p>Stocking the shelves...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      {successMsg && 
        <div className="fixed top-20 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4"/></div>
          <span className="font-medium">{successMsg}</span>
        </div>
      }

      {/* Header Section (Font size matched to Farmer Portal: text-3xl font-bold) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Fresh Market</h1>
            <p className="text-slate-500 mt-1">Support local farmers, eat fresh, live healthy.</p>
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative group">
            <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="appearance-none bg-white border border-slate-200 text-slate-600 pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer hover:border-blue-300 transition-colors font-medium"
            >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Filter size={16} />
            </div>
        </div>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80 flex-shrink-0 ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
            <input 
                type="text" 
                placeholder="Search fruits, veggies..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Divider (Desktop Only) */}
        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

        {/* Horizontal Filters (Blue Underline Style) */}
        <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 md:gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all relative ${
                            selectedCategory === cat 
                            ? 'text-blue-700 bg-blue-50/50' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg'
                        }`}
                    >
                        {cat}
                        {selectedCategory === cat && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map(product => (
            <ProductCard 
                key={product._id} 
                product={product} 
                onClick={() => openProductDetails(product)} 
            />
        ))}
      </div>

      {!loading && sortedProducts.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
             <Package size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-700">Shelf Empty</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">We couldn't find any products matching your search. Try a different category.</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
            className="mt-6 text-blue-600 font-bold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setShowDetailModal(false)}
            onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

// --- Sub-Component: Product Card ---
const ProductCard = ({ product, onClick }) => {
    const isOutOfStock = product.stock === 0;

    return (
        <div 
            onClick={onClick}
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full relative"
        >
            {/* Image Area */}
            <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img 
                    src={product.productImage || PLACEHOLDER_IMAGE} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                        {product.category}
                    </span>
                </div>

                {isOutOfStock ? (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg transform -rotate-6">Out of Stock</span>
                    </div>
                ) : (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="bg-white text-blue-600 p-2.5 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors">
                            <Plus size={20} strokeWidth={3} />
                        </div>
                    </div>
                )}
            </div>

            {/* Info Area */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {product.rating || 'New'}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{product.farmer?.farmName || 'Local Farm'}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
                    <div>
                        <span className="text-xs text-slate-400 font-bold uppercase block mb-0.5">Price</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-slate-800">${product.price}</span>
                            <span className="text-sm text-slate-400 font-medium">/{product.unit}</span>
                        </div>
                    </div>
                    {/* Hover text "View" */}
                    <div className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Detailed Product Modal ---
const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('details');
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (activeTab === 'reviews') {
            const fetchReviews = async () => {
                setLoadingReviews(true);
                try {
                    const data = await apiService.getProductReviews(product._id);
                    setReviews(data || []);
                } catch (err) {
                    console.error("Failed to load reviews", err);
                } finally {
                    setLoadingReviews(false);
                }
            };
            fetchReviews();
        }
    }, [product, activeTab]);

    const handleAddToCartClick = async () => {
        setIsAdding(true);
        await onAddToCart(product, quantity);
        setIsAdding(false);
    };

    const increment = () => { if(quantity < product.stock) setQuantity(q => q + 1); }
    const decrement = () => { if(quantity > 1) setQuantity(q => q - 1); }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">
                
                {/* Left: Image Side */}
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative">
                    <img 
                        src={product.productImage || PLACEHOLDER_IMAGE} 
                        className="w-full h-full object-cover"
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-slate-800 md:hidden shadow-lg">
                        <X size={20}/>
                    </button>
                </div>

                {/* Right: Details Side */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide">
                                    {product.category}
                                </span>
                                {product.stock <= 5 && product.stock > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                        <AlertTriangle size={10} /> Low Stock
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{product.name}</h2>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                Sold by <span className="font-semibold text-slate-700 border-b border-slate-300 pb-0.5">{product.farmer?.farmName}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24}/>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10 px-6 md:px-8">
                            {['details', 'reviews'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-4 text-sm font-bold capitalize relative transition-colors ${
                                        activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"/>}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 md:p-8">
                            {activeTab === 'details' ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <p className="text-slate-600 leading-relaxed text-base">
                                        {product.description || "Fresh from the farm! No additional description provided by the seller."}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Unit Type</span>
                                            <span className="font-bold text-slate-800 capitalize">{product.unit}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Stock</span>
                                            <span className={`font-bold ${product.stock > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                                                {product.stock > 0 ? `${product.stock} available` : 'Sold Out'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {loadingReviews ? (
                                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500"/></div>
                                    ) : reviews.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">No reviews yet.</div>
                                    ) : (
                                        reviews.map((r, i) => (
                                            <div key={i} className="pb-4 border-b border-slate-100 last:border-0">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-bold text-slate-800">{r.consumer?.firstName}</span>
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < r.rating ? "currentColor" : "none"} className={j >= r.rating ? "text-slate-200" : ""} />)}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm">{r.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Add to Cart */}
                    <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="block text-xs font-bold text-slate-400 uppercase">Total Price</span>
                                <div className="text-3xl font-extrabold text-slate-800">
                                    ${(product.price * quantity).toFixed(2)}
                                </div>
                            </div>
                            
                            {/* Quantity Stepper */}
                            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                                <button onClick={decrement} disabled={quantity <= 1} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors">
                                    <Minus size={18} />
                                </button>
                                <span className="w-10 text-center font-bold text-lg text-slate-800">{quantity}</span>
                                <button onClick={increment} disabled={quantity >= product.stock} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleAddToCartClick}
                            disabled={product.stock === 0 || isAdding}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAdding ? <Loader2 className="animate-spin" /> : <ShoppingCart strokeWidth={2.5} />}
                            <span>{product.stock === 0 ? 'Notify Me' : 'Add to Cart'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductBrowsing;