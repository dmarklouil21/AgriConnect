// components/consumer/ProductBrowsing.jsx
import React, { useState } from 'react';
import { 
  Search, 
  Package, 
  Star, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X,
  Truck,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const ProductBrowsing = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const products = [
    { id: 1, name: 'Organic Tomatoes', category: 'Vegetables', price: 4.99, farmer: "Green Valley Farm", rating: 4.8, stock: 45, description: 'Fresh organic tomatoes grown without pesticides' },
    { id: 2, name: 'Fresh Carrots', category: 'Vegetables', price: 3.49, farmer: "Sunshine Farms", rating: 4.6, stock: 32, description: 'Sweet and crunchy carrots harvested daily' },
    { id: 3, name: 'Sweet Apples', category: 'Fruits', price: 5.99, farmer: "Orchard Fresh", rating: 4.9, stock: 28, description: 'Juicy and sweet apples from our orchard' },
    { id: 4, name: 'Farm Eggs', category: 'Dairy', price: 6.99, farmer: "Happy Hens", rating: 4.7, stock: 20, description: 'Free-range eggs from happy, healthy chickens' },
    { id: 5, name: 'Whole Wheat Bread', category: 'Grains', price: 4.49, farmer: "Artisan Bakery", rating: 4.5, stock: 15, description: 'Freshly baked whole wheat bread' },
    { id: 6, name: 'Organic Spinach', category: 'Vegetables', price: 3.99, farmer: "Green Valley Farm", rating: 4.8, stock: 38, description: 'Fresh organic spinach leaves' },
  ];

  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains'];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Open add to cart modal
  const openAddToCartModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowAddToCartModal(true);
  };

  // Handle add to cart confirmation
  const handleConfirmAddToCart = () => {
    if (selectedProduct) {
      onAddToCart(prev => {
        // Check if product already exists in cart
        const existingItem = prev.find(item => item.id === selectedProduct.id);
        if (existingItem) {
          // Update quantity if exists
          return prev.map(item =>
            item.id === selectedProduct.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          return [...prev, { ...selectedProduct, quantity }];
        }
      });
      
      setShowAddToCartModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (selectedProduct && newQuantity > selectedProduct.stock) return;
    setQuantity(newQuantity);
  };

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock > 20) return { text: 'In Stock', class: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (stock > 0) return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { text: 'Out of Stock', class: 'bg-red-100 text-red-800', icon: X };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors flex items-center space-x-1 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {/* <Package className="w-4 h-4" /> */}
                <span>{category}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map(product => {
          const stockStatus = getStockStatus(product.stock);
          const StockIcon = stockStatus.icon;
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                  <span className="text-lg font-bold text-green-600">${product.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">by {product.farmer}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${stockStatus.class}`}>
                    <StockIcon className="w-3 h-3" />
                    <span>{stockStatus.text}</span>
                  </span>
                </div>

                <button
                  onClick={() => openAddToCartModal(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add to Cart Confirmation Modal */}
      {showAddToCartModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Add to Cart</h3>
                  <p className="text-gray-600 text-sm">Confirm quantity and add to your shopping cart</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddToCartModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">{selectedProduct.name}</h4>
                  <p className="text-gray-600 text-sm">by {selectedProduct.farmer}</p>
                </div>
                <span className="text-lg font-bold text-green-600">${selectedProduct.price}</span>
              </div>
              <p className="text-gray-500 text-sm mb-3">{selectedProduct.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{selectedProduct.rating}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                  getStockStatus(selectedProduct.stock).class
                }`}>
                  {(() => {
                    const StockIcon = getStockStatus(selectedProduct.stock).icon;
                    return <StockIcon className="w-3 h-3" />;
                  })()}
                  <span>{getStockStatus(selectedProduct.stock).text}</span>
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Quantity
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="text-xl font-semibold text-gray-800 w-12 text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= selectedProduct.stock}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Available: {selectedProduct.stock}</p>
                  <p className="text-lg font-bold text-green-600">
                    Total: ${(selectedProduct.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddToCartModal(false);
                  setSelectedProduct(null);
                  setQuantity(1);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Quick Add Options */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 3, 5].map(qty => (
                <button
                  key={qty}
                  onClick={() => handleQuantityChange(qty)}
                  disabled={qty > selectedProduct.stock}
                  className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center space-x-1 ${
                    quantity === qty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{qty} {qty === 1 ? 'item' : 'items'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBrowsing;