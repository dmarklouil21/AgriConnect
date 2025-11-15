// components/farmer/ProductManagement.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, X, Info } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Organic Tomatoes', 
      category: 'Vegetables', 
      price: 4.99, 
      stock: 45, 
      description: 'Fresh organic tomatoes grown without pesticides',
      image: '/api/placeholder/80/80' 
    },
    { 
      id: 2, 
      name: 'Fresh Carrots', 
      category: 'Vegetables', 
      price: 3.49, 
      stock: 32, 
      description: 'Sweet and crunchy carrots harvested daily',
      image: '/api/placeholder/80/80' 
    },
    { 
      id: 3, 
      name: 'Green Lettuce', 
      category: 'Vegetables', 
      price: 2.99, 
      stock: 28, 
      description: 'Crisp green lettuce perfect for salads',
      image: '/api/placeholder/80/80' 
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdateProduct, setStockUpdateProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newStock, setNewStock] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });

  // Add new product
  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      id: products.length + 1,
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      image: '/api/placeholder/80/80'
    };
    setProducts([...products, product]);
    setShowAddModal(false);
    setNewProduct({ name: '', category: '', price: '', stock: '', description: '' });
  };

  // Edit product
  const handleEditProduct = (e) => {
    e.preventDefault();
    setProducts(products.map(product => 
      product.id === editingProduct.id 
        ? { ...editingProduct, price: parseFloat(editingProduct.price), stock: parseInt(editingProduct.stock) }
        : product
    ));
    setShowEditModal(false);
    setEditingProduct(null);
  };

  // Update stock
  const handleUpdateStock = (e) => {
    e.preventDefault();
    setProducts(products.map(product => 
      product.id === stockUpdateProduct.id 
        ? { ...product, stock: parseInt(newStock) }
        : product
    ));
    setShowStockModal(false);
    setStockUpdateProduct(null);
    setNewStock('');
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    setProducts(products.filter(product => product.id !== productToDelete.id));
    setShowConfirmModal(false);
    setProductToDelete(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setProductToDelete(null);
  };

  // Open edit modal
  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setShowEditModal(true);
  };

  // Open stock update modal
  const openStockModal = (product) => {
    setStockUpdateProduct(product);
    setNewStock(product.stock.toString());
    setShowStockModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-600">Manage your farm products and inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => openEditModal(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openDeleteConfirmation(product)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-800 text-lg mb-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.category}</p>
            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-green-600">${product.price}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                product.stock > 20 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock <= 10 && <AlertTriangle className="w-3 h-3" />}
                <span>Stock: {product.stock}</span>
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => openEditModal(product)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => openStockModal(product)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
              >
                <Package className="w-4 h-4" />
                <span>Update Stock</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h3>
          <p className="text-gray-500">Add your first product to get started</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                {/* <Plus className="w-5 h-5" /> */}
                <span>Add New Product</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grains">Grains</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Meat">Meat</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Honey">Honey</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                {/* <Edit className="w-5 h-5" /> */}
                <span>Edit Product</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  required
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grains">Grains</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Meat">Meat</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Honey">Honey</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showStockModal && stockUpdateProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                {/* <Package className="w-5 h-5" /> */}
                <span>Update Stock</span>
              </h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-300">
                  <span className="text-gray-800 font-medium">{stockUpdateProduct.stock} units</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-green-500"
                  placeholder="Enter new stock quantity"
                  required
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Info className="w-8 h-8 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    This will replace the current stock quantity. Use negative numbers to subtract from current stock.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && productToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete Product</h3>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? This action cannot be undone.
              </p>

              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">{productToDelete.name}</h4>
                    <p className="text-sm text-gray-600">{productToDelete.category}</p>
                    <p className="text-sm text-green-600 font-semibold">${productToDelete.price}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Product</span>
                </button>
              </div>

              {/* Warning Note */}
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 text-left">
                    This will permanently remove the product from your inventory. Any active orders containing this product may be affected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;