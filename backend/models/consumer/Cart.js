const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: { // NEW: Link cart to a specific farmer
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }]
}, {
  timestamps: true
});

// Compound Index: A user can only have one cart for a specific farmer
cartSchema.index({ user: 1, farmer: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);