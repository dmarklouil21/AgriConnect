const express = require('express');
const Product = require('../../models/farmer/Product');
const Consumer = require('../../models/user/Consumer');
const auth = require('../../middleware/auth');
const router = express.Router();

// Get all products for the authenticated farmer
router.get('/products', auth, async (req, res) => {
  try {
    // Check if user is a consumer
    if (req.user.userType !== 'consumer') {
      return res.status(403).json({ message: 'Access denied. Consumer account required.' });
    }

    // Find consumer profile
    const consumer = await Consumer.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer profile not found' });
    }
    
    // --- THE FIX IS HERE ---
    // We add status: 'Approved' to the query
    const products = await Product.find({ 
        isActive: true, 
        status: 'Approved',
        stock: { $gt: 0 } // Optional: Also hide out-of-stock items if you want
    })
      .populate('farmer', 'businessName farmName') // Only fetch necessary farmer fields
      .sort({ createdAt: -1 }); 

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

module.exports = router;