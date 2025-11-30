const express = require('express');
const router = express.Router();
const Review = require('../models/farmer/Reviews');
const Product = require('../models/farmer/Product');
const Order = require('../models/farmer/Order');
const Consumer = require('../models/user/Consumer');
const User = require('../models/user/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// POST /api/reviews
// Add a review
router.post('/add/reviews', auth, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    
    // 1. Verify Consumer
    const user = await User.findById(req.user._id);
    if (!user) return res.status(403).json({ message: 'Access denied.' });

    // 2. Verify Purchase
    const hasPurchased = await Order.findOne({
      _id: orderId,
      user: user._id,
      status: { $in: ['Delivered', 'Completed'] },
      'items.product': productId
    });

    if (!hasPurchased) {
      return res.status(400).json({ message: 'Verified purchase required.' });
    }

    // 3. Create Review
    const consumer = await Consumer.findOne({ user: user._id });
    const review = await Review.create({
      product: productId,
      consumer: consumer._id,
      order: orderId,
      rating,
      comment
    });

    // 4. Update Product Rating (Aggregation)
    // Note: Use mongoose.Types.ObjectId if using raw aggregation
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: stats[0].avgRating.toFixed(1),
        reviewsCount: stats[0].numReviews
      });
    }

    res.status(201).json({ message: 'Review added', review });

  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Already reviewed' });
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/:productId
// Get all reviews for a product
router.get('/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('consumer', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;