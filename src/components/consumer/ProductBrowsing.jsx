// components/consumer/ProductBrowsing.jsx
import React, { useState } from 'react';

const ProductBrowsing = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const products = [
    { id: 1, name: 'Organic Tomatoes', category: 'Vegetables', price: 4.99, farmer: "Green Valley Farm", rating: 4.8, stock: 45 },
    { id: 2, name: 'Fresh Carrots', category: 'Vegetables', price: 3.49, farmer: "Sunshine Farms", rating: 4.6, stock: 32 },
    { id: 3, name: 'Sweet Apples', category: 'Fruits', price: 5.99, farmer: "Orchard Fresh", rating: 4.9, stock: 28 },
    { id: 4, name: 'Farm Eggs', category: 'Dairy', price: 6.99, farmer: "Happy Hens", rating: 4.7, stock: 20 },
    { id: 5, name: 'Whole Wheat Bread', category: 'Grains', price: 4.49, farmer: "Artisan Bakery", rating: 4.5, stock: 15 },
    { id: 6, name: 'Organic Spinach', category: 'Vegetables', price: 3.99, farmer: "Green Valley Farm", rating: 4.8, stock: 38 },
  ];

  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
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
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl">🌱</span>
              </div>
              
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                <span className="text-lg font-bold text-green-600">${product.price}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">by {product.farmer}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.stock > 20 ? 'In Stock' : 'Low Stock'}
                </span>
              </div>

              <button
                onClick={() => onAddToCart(prev => [...prev, { ...product, quantity: 1 }])}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🛒</span>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ProductBrowsing;