const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  // Optional: Link to specific order to verify purchase
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order' 
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxLength: 500
  },
  farmerReply: { // Allow farmer to reply later
    type: String,
    maxLength: 500
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews from same user on same product
reviewSchema.index({ product: 1, consumer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);