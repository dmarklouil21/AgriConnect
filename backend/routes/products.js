const express = require('express');
const Product = require('../models/farmer/Product');
const Farmer = require('../models/user/Farmer');
const auth = require('../middleware/auth');
const { uploadProductImage } = require('../utils/upload'); 
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get all products for the authenticated farmer
router.get('/farmer/products', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { farmer: farmer._id };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.stockStatus) {
      switch (req.query.stockStatus) {
        case 'in-stock': filter.stock = { $gt: 0 }; break;
        case 'low-stock': filter.stock = { $gt: 0, $lte: 10 }; break;
        case 'out-of-stock': filter.stock = 0; break;
      }
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    const productsWithVirtuals = products.map(product => ({
      ...product,
      isLowStock: product.stock <= 10,
      isOutOfStock: product.stock === 0
    }));

    res.json({
      products: productsWithVirtuals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- NEW ROUTE: Get Top Selling Products ---
// This must come BEFORE /farmer/products/:id
router.get('/farmer/products/top', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    // Get limit from query or default to 5
    const limit = parseInt(req.query.limit) || 5;

    // Find products sorted by salesCount descending
    const topProducts = await Product.find({ farmer: farmer._id })
      .sort({ salesCount: -1 }) // High to low
      .limit(limit)
      .lean();

    // Format for Dashboard
    const formattedData = topProducts.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      sales: p.salesCount || 0,
      unit: p.unit,
      // Calculate approx revenue based on current price
      revenue: `$${((p.salesCount || 0) * p.price).toFixed(2)}`,
      averagePrice: p.price,
      productImage: p.productImage
    }));

    res.json(formattedData);

  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product statistics for dashboard
router.get('/farmer/products/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const stats = await Product.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStockCount: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };

    result.categoryStats = categoryStats;

    res.json(result);
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product (Must stay AFTER specific paths like /top or /stats)
router.get('/farmer/products/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const product = await Product.findOne({ 
      _id: req.params.id, 
      farmer: farmer._id 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toObject();
    productObj.isLowStock = product.stock <= 10;
    productObj.isOutOfStock = product.stock === 0;

    res.json(productObj);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new product
router.post('/farmer/products', auth, uploadProductImage, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const { name, category, description, price, stock, unit } = req.body;

    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and stock are required' });
    }

    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      farmer: farmer._id 
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this name already exists' });
    }

    let productImage = '';
    if (req.file) {
      productImage = `/uploads/productImage/${req.file.filename}`;
    }

    const product = new Product({
      farmer: farmer._id,
      name,
      category,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock),
      unit: unit || 'kg',
      productImage: productImage,
      // Initialize analytics
      salesCount: 0,
      reviewsCount: 0,
      rating: 0
    });

    await product.save();

    const productObj = product.toObject();
    productObj.isLowStock = product.stock <= 10;
    productObj.isOutOfStock = product.stock === 0;

    res.status(201).json({
      message: 'Product created successfully',
      product: productObj
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/farmer/products/:id', auth, uploadProductImage, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const product = await Product.findOne({ _id: req.params.id, farmer: farmer._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, category, description, price, stock, unit, isActive } = req.body;

    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        farmer: farmer._id,
        _id: { $ne: product._id }
      });
      if (existingProduct) return res.status(400).json({ message: 'Name already taken' });
    }

    if (req.file) {
      if (product.productImage) {
        const oldPath = path.join(__dirname, '..', product.productImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.productImage = `/uploads/productImage/${req.file.filename}`;
    } 

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (unit !== undefined) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product stock
router.patch('/farmer/products/:id/stock', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') return res.status(403).json({ message: 'Access denied' });
    
    const farmer = await Farmer.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, farmer: farmer._id });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { stock } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ message: 'Invalid stock' });

    product.stock = parseInt(stock);
    await product.save();

    res.json({ message: 'Stock updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/farmer/products/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') return res.status(403).json({ message: 'Access denied' });

    const farmer = await Farmer.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, farmer: farmer._id });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Optional: Delete image file
    if (product.productImage) {
       const imgPath = path.join(__dirname, '..', product.productImage);
       if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;