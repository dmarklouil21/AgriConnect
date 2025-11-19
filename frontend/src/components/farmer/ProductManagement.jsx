// components/farmer/ProductManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, X, Info, RefreshCw, Loader2, Upload, Image as ImageIcon, Eye } from 'lucide-react';
import { apiService } from '../../services/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdateProduct, setStockUpdateProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Loading states for individual actions
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    unit: 'kg',
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFarmerProducts();
      setProducts(response.products || []);
    } catch (error) {
      setError('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      setError('');
      await loadProducts();
      setSuccess('Products refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to refresh products');
    } finally {
      setRefreshLoading(false);
    }
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      setError('');
      const response = await apiService.createProduct(newProduct);
      setProducts(prev => [response.product, ...prev]);
      setShowAddModal(false);
      setNewProduct({ name: '', category: '', price: '', stock: '', description: '', unit: 'kg' });
      setSuccess('Product added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  // Edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setError('');
      const response = await apiService.updateProduct(editingProduct._id, editingProduct);
      setProducts(prev => prev.map(product => 
        product._id === editingProduct._id ? response.product : product
      ));
      setShowEditModal(false);
      setEditingProduct(null);
      setSuccess('Product updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  // Update stock
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      setStockLoading(true);
      setError('');
      const response = await apiService.updateProductStock(stockUpdateProduct._id, parseInt(newStock));
      setProducts(prev => prev.map(product => 
        product._id === stockUpdateProduct._id ? response.product : product
      ));
      setShowStockModal(false);
      setStockUpdateProduct(null);
      setNewStock('');
      setSuccess('Stock updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setStockLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      await apiService.deleteProduct(productToDelete._id);
      setProducts(prev => prev.filter(product => product._id !== productToDelete._id));
      setShowConfirmModal(false);
      setProductToDelete(null);
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
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

  // Clear messages when modals close
  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowStockModal(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-600">Manage your farm products and inventory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{refreshLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product._id}
            product={product}
            onEdit={openEditModal}
            onUpdateStock={openStockModal}
            onDelete={openDeleteConfirmation}
          />
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
        <ProductModal
          title="Add New Product"
          product={newProduct}
          onChange={setNewProduct}
          onSubmit={handleAddProduct}
          onClose={closeModal}
          actionText="Add Product"
          loading={addLoading}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <ProductModal
          title="Edit Product"
          product={editingProduct}
          onChange={setEditingProduct}
          onSubmit={handleEditProduct}
          onClose={closeModal}
          actionText="Update Product"
          loading={editLoading}
        />
      )}

      {/* Update Stock Modal */}
      {showStockModal && stockUpdateProduct && (
        <StockModal
          product={stockUpdateProduct}
          newStock={newStock}
          onStockChange={setNewStock}
          onSubmit={handleUpdateStock}
          onClose={() => setShowStockModal(false)}
          loading={stockLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && productToDelete && (
        <DeleteModal
          product={productToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

// Extract Product Card component for better organization
const ProductCard = ({ product, onEdit, onUpdateStock, onDelete }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
        <Package className="w-8 h-8 text-green-600" />
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onEdit(product)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit product"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(product)}
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
        {product.stock <= 10 && product.stock > 0 && <AlertTriangle className="w-3 h-3" />}
        {product.stock === 0 && <AlertTriangle className="w-3 h-3" />}
        <span>Stock: {product.stock}</span>
      </span>
    </div>
    
    <div className="flex space-x-2">
      <button 
        onClick={() => onEdit(product)}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1"
      >
        <Edit className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button 
        onClick={() => onUpdateStock(product)}
        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
      >
        <Package className="w-4 h-4" />
        <span>Update Stock</span>
      </button>
    </div>
  </div>
);

const ProductModal = ({ title, product, onChange, onSubmit, onClose, actionText, loading }) => {
  const [imagePreview, setImagePreview] = useState(product.images && product.images.length > 0 ? product.images[0] : '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    onChange({
      ...product,
      [field]: value
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // In a real application, you would upload to your server/cloud storage
      // For now, we'll create a local URL for preview and simulate upload
      const imageUrl = URL.createObjectURL(file);
      
      // Update product with new image
      const updatedImages = [imageUrl]; // Replace with actual uploaded URL in production
      handleChange('images', updatedImages);
      setImagePreview(imageUrl);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    handleChange('images', []);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImagePreview(url);
    handleChange('images', [url]);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading || isUploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            
            {/* Image Preview */}
            {imagePreview ? (
              <div className="mb-4">
                <div className="relative group">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading || isUploading}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click the upload button to change image
                </p>
              </div>
            ) : (
              /* Upload Placeholder */
              <div 
                onClick={openFileSelector}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors mb-4"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    <p className="text-sm text-gray-600">Uploading image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload image</p>
                    <p className="text-xs text-gray-500">JPEG, PNG, WebP (max 5MB)</p>
                  </div>
                )}
              </div>
            )}

            {/* File Input (Hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={loading || isUploading}
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={openFileSelector}
              disabled={loading || isUploading}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>
                {isUploading ? 'Uploading...' : (imagePreview ? 'Change Image' : 'Upload Image')}
              </span>
            </button>

            {/* OR Separator */}
            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={imagePreview}
                  onChange={handleImageUrlChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/image.jpg"
                  disabled={loading || isUploading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter image URL or upload a file
              </p>
            </div>
          </div>

          {/* Product Details Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter product name"
              disabled={loading || isUploading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={product.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
              disabled={loading || isUploading}
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
                value={product.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                required
                disabled={loading || isUploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                min="0"
                value={product.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
                required
                disabled={loading || isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={product.unit || 'kg'}
              onChange={(e) => handleChange('unit', e.target.value)}
              disabled={loading || isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="lb">Pound (lb)</option>
              <option value="piece">Piece</option>
              <option value="dozen">Dozen</option>
              <option value="bunch">Bunch</option>
              <option value="pack">Pack</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="organic"
              checked={product.organic || false}
              onChange={(e) => handleChange('organic', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={loading || isUploading}
            />
            <label htmlFor="organic" className="text-sm text-gray-700">
              Organic Product
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={product.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              disabled={loading || isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe your product..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || isUploading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUploading ? 'Uploading...' : 'Processing...'}</span>
                </>
              ) : (
                <span>{actionText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// const ProductModal = ({ title, product, onChange, onSubmit, onClose, actionText, loading }) => {
//   const handleChange = (field, value) => {
//     onChange({
//       ...product,
//       [field]: value
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-semibold text-gray-800">
//             {title}
//           </h3>
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//         <form onSubmit={onSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
//             <input
//               type="text"
//               value={product.name}
//               onChange={(e) => handleChange('name', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               placeholder="Enter product name"
//               disabled={loading}
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
//             <select
//               value={product.category}
//               onChange={(e) => handleChange('category', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               required
//               disabled={loading}
//             >
//               <option value="">Select category</option>
//               <option value="Vegetables">Vegetables</option>
//               <option value="Fruits">Fruits</option>
//               <option value="Dairy">Dairy</option>
//               <option value="Grains">Grains</option>
//               <option value="Herbs">Herbs</option>
//               <option value="Meat">Meat</option>
//               <option value="Eggs">Eggs</option>
//               <option value="Honey">Honey</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 value={product.price}
//                 onChange={(e) => handleChange('price', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 placeholder="0.00"
//                 required
//                 disabled={loading}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
//               <input
//                 type="number"
//                 min="0"
//                 value={product.stock}
//                 onChange={(e) => handleChange('stock', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 placeholder="0"
//                 required
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
//             <select
//               value={product.unit || 'kg'}
//               onChange={(e) => handleChange('unit', e.target.value)}
//               disabled={loading}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//             >
//               <option value="kg">Kilogram (kg)</option>
//               <option value="g">Gram (g)</option>
//               <option value="lb">Pound (lb)</option>
//               <option value="piece">Piece</option>
//               <option value="dozen">Dozen</option>
//               <option value="bunch">Bunch</option>
//               <option value="pack">Pack</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <textarea
//               value={product.description}
//               onChange={(e) => handleChange('description', e.target.value)}
//               rows="3"
//               disabled={loading}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               placeholder="Describe your product..."
//             />
//           </div>

//           <div className="flex space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading}
//               className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {/* {actionText} */}
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   <span>Processing...</span>
//                 </>
//               ) : (
//                 <span>{actionText}</span>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

const StockModal = ({ product, newStock, onStockChange, onSubmit, onClose, loading }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Update Stock</span>
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-300">
              <span className="text-gray-800 font-medium">{product.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-300">
              <span className="text-gray-800 font-medium">{product.stock} units</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Stock Quantity *</label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => onStockChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter new stock quantity"
              required
              disabled={loading}
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                This will replace the current stock quantity. Use negative numbers to subtract from current stock.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Update Stock */}
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Update Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ product, onConfirm, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete Product</h3>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>"{product.name}"</strong>? This action cannot be undone.
          </p>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-800">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm text-green-600 font-semibold">${product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock} units</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Product</span>
                </>
              )}
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
  );
};

export default ProductManagement;