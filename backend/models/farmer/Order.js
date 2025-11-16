const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'ready', 'completed', 'declined', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Nigeria' }
  },
  deliveryInstructions: {
    type: String,
    maxLength: 500
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'transfer', 'cash_on_delivery', 'wallet'],
    default: 'cash_on_delivery'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  farmerNotes: {
    type: String,
    maxLength: 500
  },
  customerNotes: {
    type: String,
    maxLength: 500
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxLength: 500 },
    createdAt: { type: Date }
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((total, item) => total + item.total, 0);
  }
  next();
});

// Calculate item totals before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.items.forEach(item => {
      item.total = item.quantity * item.price;
    });
  }
  next();
});

// Index for better query performance
orderSchema.index({ farmer: 1, createdAt: -1 });
orderSchema.index({ consumer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

// Virtual for formatted address
orderSchema.virtual('formattedAddress').get(function() {
  const addr = this.deliveryAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Method to update status
orderSchema.methods.updateStatus = async function(newStatus, notes = '') {
  const validTransitions = {
    pending: ['accepted', 'declined'],
    accepted: ['ready', 'declined'],
    // preparing: ['ready', 'declined'],
    ready: ['completed', 'declined'],
    declined: [],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  
  if (notes) {
    this.farmerNotes = notes;
  }

  if (newStatus === 'completed') {
    this.actualDelivery = new Date();
  }

  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getFarmerStats = async function(farmerId) {
  const stats = await this.aggregate([
    { $match: { farmer: farmerId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        acceptedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  const monthlyStats = await this.aggregate([
    { $match: { farmer: farmerId, status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 }
  ]);

  return {
    ...(stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      acceptedOrders: 0,
      completedOrders: 0
    }),
    monthlyStats
  };
};

module.exports = mongoose.model('Order', orderSchema);