const express = require('express');
const router = express.Router();
const Product = require('../../models/farmer/Product');
const Farmer = require('../../models/user/Farmer'); // Need to populate farmer details
const auth = require('../../middleware/auth');

// Middleware to ensure admin
const adminAuth = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// GET /api/admin/products
// Fetch all products with farmer details
router.get('/admin/products', auth, adminAuth, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    let query = {};

    if (status && status !== 'all') {
        // Map frontend "Pending" to backend "Pending" (case sensitive match)
        query.status = status;
    }
    
    if (category && category !== 'all') {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } }
        ];
    }

    const products = await Product.find(query)
      .populate('farmer', 'businessName farmName firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    // Format for frontend
    const formattedProducts = products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        unit: p.unit,
        status: p.status,
        rejectionReason: p.rejectionReason,
        description: p.description,
        images: p.productImage ? [p.productImage] : [],
        createdAt: p.createdAt.toISOString().split('T')[0],
        updatedAt: p.updatedAt.toISOString().split('T')[0],
        rating: p.rating || 0,
        reviews: p.reviewsCount || 0,
        sales: p.salesCount || 0,
        // Map Farmer Details
        farmer: p.farmer?.businessName || p.farmer?.farmName || 'Unknown Farm',
        farmerId: p.farmer?._id,
        farmerEmail: p.farmer?.email,
        farmerPhone: p.farmer?.phoneNumber
    }));

    res.json(formattedProducts);

  } catch (error) {
    console.error('Admin Get Products Error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// PATCH /api/admin/products/:id/status
// Approve or Reject a product
router.patch('/admin/products/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    
    // If rejecting, save reason. If approving, clear reason.
    if (status === 'Rejected') {
        updateData.rejectionReason = rejectionReason || 'Does not meet guidelines.';
    } else {
        updateData.rejectionReason = '';
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id, 
        updateData, 
        { new: true }
    ).populate('farmer', 'businessName farmName email phoneNumber');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ 
        message: `Product ${status} successfully`, 
        product: {
            id: product._id,
            status: product.status,
            rejectionReason: product.rejectionReason
        } 
    });

  } catch (error) {
    console.error('Update Product Status Error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

module.exports = router;