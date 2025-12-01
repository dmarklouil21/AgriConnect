const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Meat', 'Eggs', 'Honey'],
    trim: true
  },
  description: {
    type: String,
    maxLength: 500,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'piece', 'dozen', 'bunch', 'pack', 'liter'],
    default: 'kg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending', // Default to Pending when Farmer creates it
    index: true
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  productImage: {
    type: String,
    default: ''
  },
  images: [{
    type: String,
    default: []
  }],
  // Analytics placeholders
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ farmer: 1, createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for low stock alert
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= 10;
});

// Virtual for out of stock
productSchema.virtual('isOutOfStock').get(function() {
  return this.stock === 0;
});

// Method to update stock
productSchema.methods.updateStock = function(newStock) {
  if (newStock < 0) {
    throw new Error('Stock cannot be negative');
  }
  this.stock = newStock;
  return this.save();
};

// Method to decrease stock (for orders)
productSchema.methods.decreaseStock = function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  return this.save();
};

// Method to increase stock
productSchema.methods.increaseStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);