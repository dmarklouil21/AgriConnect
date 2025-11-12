// components/admin/ProductMonitoring.jsx
import React, { useState } from 'react';

const ProductMonitoring = () => {
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Organic Tomatoes', 
      farmer: 'Green Valley Farm', 
      farmerId: 1,
      price: 4.99, 
      status: 'Approved', 
      category: 'Vegetables',
      description: 'Fresh organic tomatoes grown without pesticides or chemicals. Harvested daily for maximum freshness.',
      stock: 45,
      unit: 'lb',
      createdAt: '2024-02-15',
      updatedAt: '2024-03-10',
      images: ['/api/placeholder/400/300'],
      rating: 4.8,
      reviews: 24,
      sales: 89,
      tags: ['organic', 'fresh', 'local'],
      farmerPhone: '+1 (555) 123-4567',
      farmerEmail: 'john@greenvalley.com'
    },
    { 
      id: 2, 
      name: 'Fresh Carrots', 
      farmer: 'Sunshine Farms', 
      farmerId: 2,
      price: 3.49, 
      status: 'Pending', 
      category: 'Vegetables',
      description: 'Sweet and crunchy carrots, perfect for cooking or snacking. Grown in nutrient-rich soil.',
      stock: 32,
      unit: 'bunch',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-14',
      images: ['/api/placeholder/400/300'],
      rating: 4.6,
      reviews: 18,
      sales: 67,
      tags: ['fresh', 'sweet', 'crunchy'],
      farmerPhone: '+1 (555) 987-6543',
      farmerEmail: 'mike@sunshinefarms.com'
    },
    { 
      id: 3, 
      name: 'Sweet Apples', 
      farmer: 'Orchard Fresh', 
      farmerId: 3,
      price: 5.99, 
      status: 'Approved', 
      category: 'Fruits',
      description: 'Juicy and sweet apples from our family orchard. Perfect for baking or eating fresh.',
      stock: 28,
      unit: 'lb',
      createdAt: '2024-01-20',
      updatedAt: '2024-03-12',
      images: ['/api/placeholder/400/300'],
      rating: 4.9,
      reviews: 32,
      sales: 124,
      tags: ['sweet', 'juicy', 'orchard'],
      farmerPhone: '+1 (555) 456-7890',
      farmerEmail: 'info@orchardfresh.com'
    },
    { 
      id: 4, 
      name: 'Farm Eggs', 
      farmer: 'Happy Hens', 
      farmerId: 4,
      price: 6.99, 
      status: 'Rejected', 
      category: 'Dairy',
      description: 'Free-range eggs from happy, healthy chickens. Rich in flavor and nutrients.',
      stock: 20,
      unit: 'dozen',
      createdAt: '2024-03-05',
      updatedAt: '2024-03-08',
      images: ['/api/placeholder/400/300'],
      rating: 4.7,
      reviews: 15,
      sales: 42,
      tags: ['free-range', 'fresh', 'nutritious'],
      rejectionReason: 'Product images do not meet platform quality standards. Please provide clearer photos of the product and farming environment.',
      farmerPhone: '+1 (555) 234-5678',
      farmerEmail: 'contact@happyhens.com'
    },
  ]);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionProduct, setActionProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Open view product details modal
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Open confirmation modal for actions
  const openConfirmModal = (product, action) => {
    setActionProduct(product);
    setActionType(action);
    setRejectionReason(product.rejectionReason || '');
    setShowConfirmModal(true);
  };

  // Handle product status change after confirmation
  const handleStatusChange = () => {
    let newStatus = actionProduct.status;
    let updatedProduct = { ...actionProduct };
    
    switch (actionType) {
      case 'approve':
        newStatus = 'Approved';
        delete updatedProduct.rejectionReason;
        break;
      case 'reject':
        newStatus = 'Rejected';
        updatedProduct.rejectionReason = rejectionReason;
        break;
      case 'pending':
        newStatus = 'Pending';
        delete updatedProduct.rejectionReason;
        break;
      default:
        break;
    }

    setProducts(products.map(product => 
      product.id === actionProduct.id ? { ...updatedProduct, status: newStatus } : product
    ));
    
    setShowConfirmModal(false);
    setActionProduct(null);
    setActionType('');
    setRejectionReason('');
  };

  // Get action details for confirmation modal
  const getActionDetails = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Product',
          message: `Are you sure you want to approve "${actionProduct?.name}"?`,
          description: 'This will make the product visible to all consumers on the platform.',
          buttonText: 'Approve Product',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✅',
          showReasonInput: false
        };
      case 'reject':
        return {
          title: 'Reject Product',
          message: `Are you sure you want to reject "${actionProduct?.name}"?`,
          description: 'This will remove the product from the platform and notify the farmer.',
          buttonText: 'Reject Product',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '❌',
          showReasonInput: true
        };
      case 'pending':
        return {
          title: 'Set to Pending',
          message: `Are you sure you want to set "${actionProduct?.name}" to pending?`,
          description: 'This will temporarily hide the product while keeping it in the system.',
          buttonText: 'Set to Pending',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: '⏳',
          showReasonInput: false
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          description: 'This action cannot be undone.',
          buttonText: 'Confirm',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          icon: '⚠️',
          showReasonInput: false
        };
    }
  };

  // Get available actions for a product based on status
  const getAvailableActions = (product) => {
    switch (product.status) {
      case 'Pending':
        return [
          { type: 'approve', label: 'Approve', color: 'text-green-600 hover:text-green-900' },
          { type: 'reject', label: 'Reject', color: 'text-red-600 hover:text-red-900' }
        ];
      case 'Approved':
        return [
          { type: 'reject', label: 'Reject', color: 'text-red-600 hover:text-red-900' },
          { type: 'pending', label: 'Set Pending', color: 'text-yellow-600 hover:text-yellow-900' }
        ];
      case 'Rejected':
        return [
          { type: 'approve', label: 'Approve', color: 'text-green-600 hover:text-green-900' },
          { type: 'pending', label: 'Set Pending', color: 'text-yellow-600 hover:text-yellow-900' }
        ];
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return '✅';
      case 'Pending': return '⏳';
      case 'Rejected': return '❌';
      default: return '📋';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Vegetables': return 'bg-green-50 text-green-700 border-green-200';
      case 'Fruits': return 'bg-red-50 text-red-700 border-red-200';
      case 'Dairy': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Grains': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Meat': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Monitoring</h2>
          <p className="text-gray-600">Review and manage all platform products</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Export Products
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-gray-800">{products.length}</div>
          <div className="text-gray-600 text-sm">Total Products</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-green-600">
            {products.filter(product => product.status === 'Approved').length}
          </div>
          <div className="text-gray-600 text-sm">Approved</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {products.filter(product => product.status === 'Pending').length}
          </div>
          <div className="text-gray-600 text-sm">Pending Review</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-red-600">
            {products.filter(product => product.status === 'Rejected').length}
          </div>
          <div className="text-gray-600 text-sm">Rejected</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const availableActions = getAvailableActions(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">Stock: {product.stock} {product.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.farmer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {availableActions.map((action) => (
                          <button 
                            key={action.type}
                            onClick={() => openConfirmModal(product, action.type)}
                            className={action.color}
                          >
                            {action.label}
                          </button>
                        ))}
                        <button 
                          onClick={() => openViewModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Product Details Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Product Details</h3>
                <p className="text-gray-600">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Product Information */}
              <div className="space-y-6">
                {/* Product Image */}
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <span className="text-6xl">🌱</span>
                </div>

                {/* Basic Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Product Name</span>
                      <span className="text-sm text-gray-900">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Category</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedProduct.category)}`}>
                        {selectedProduct.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Price</span>
                      <span className="text-sm font-semibold text-green-600">${selectedProduct.price} per {selectedProduct.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Stock</span>
                      <span className="text-sm text-gray-900">{selectedProduct.stock} {selectedProduct.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.status)}`}>
                        {getStatusIcon(selectedProduct.status)} {selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                </div>

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Additional Information */}
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedProduct.rating}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedProduct.reviews}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedProduct.sales}</div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">{selectedProduct.stock}</div>
                      <div className="text-sm text-gray-600">Current Stock</div>
                    </div>
                  </div>
                </div>

                {/* Farmer Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Farmer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Farm Name</span>
                      <p className="text-sm text-gray-900">{selectedProduct.farmer}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact Email</span>
                      <p className="text-sm text-gray-900">{selectedProduct.farmerEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact Phone</span>
                      <p className="text-sm text-gray-900">{selectedProduct.farmerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Product Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Created</span>
                      <span className="text-sm text-gray-900">{selectedProduct.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Last Updated</span>
                      <span className="text-sm text-gray-900">{selectedProduct.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedProduct.status === 'Rejected' && selectedProduct.rejectionReason && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Rejection Reason</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{selectedProduct.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  {getAvailableActions(selectedProduct).map((action) => (
                    <button
                      key={action.type}
                      onClick={() => {
                        setShowViewModal(false);
                        openConfirmModal(selectedProduct, action.type);
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                        action.type === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' :
                        action.type === 'reject' ? 'bg-red-600 text-white hover:bg-red-700' :
                        'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && actionProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              {/* Action Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <span className="text-2xl">{getActionDetails().icon}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{getActionDetails().title}</h3>
              
              <p className="text-gray-600 mb-4">
                {getActionDetails().message}
              </p>

              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🌱</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">{actionProduct.name}</h4>
                    <p className="text-sm text-gray-600">by {actionProduct.farmer}</p>
                    <div className="flex space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(actionProduct.category)}`}>
                        {actionProduct.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(actionProduct.status)}`}>
                        {actionProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Description */}
              <div className="bg-blue-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-700 text-left">
                  {getActionDetails().description}
                </p>
              </div>

              {/* Rejection Reason Input */}
              {getActionDetails().showReasonInput && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                  <p className="text-xs text-gray-500 text-left mt-1">
                    This reason will be shared with the farmer.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={getActionDetails().showReasonInput && !rejectionReason.trim()}
                  className={`flex-1 text-white py-3 px-4 rounded-lg transition-colors font-medium ${
                    getActionDetails().showReasonInput && !rejectionReason.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : getActionDetails().buttonColor
                  }`}
                >
                  {getActionDetails().buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMonitoring;