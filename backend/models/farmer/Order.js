const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  // Link to the User (Buyer)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Link to the Farmer (Seller)
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer', // Points to Farmer Profile
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  // Shipping Details
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    zipCode: String,
    phone: String,
    country: { type: String, default: 'Nigeria' }
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Declined'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'COD'
  },
  farmerNotes: String,
  deliveryInstructions: String
}, {
  timestamps: true
});

// Auto-generate Order Number (ORD-123456)
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Simple random number generator for order ID
    this.orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);