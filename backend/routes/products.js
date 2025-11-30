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
    // Check if user is a farmer
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    // Find farmer profile
    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { farmer: farmer._id };
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Stock status filter
    if (req.query.stockStatus) {
      switch (req.query.stockStatus) {
        case 'in-stock':
          filter.stock = { $gt: 0 };
          break;
        case 'low-stock':
          filter.stock = { $gt: 0, $lte: 10 };
          break;
        case 'out-of-stock':
          filter.stock = 0;
          break;
      }
    }

    // Active status filter
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    // Add virtual fields
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

// Get single product
router.get('/farmer/products/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
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
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const { name, category, description, price, stock, unit } = req.body;

    // Validate required fields
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and stock are required' });
    }

    // Check if product with same name already exists for this farmer
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      farmer: farmer._id 
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this name already exists' });
    }

    // Handle images
    let productImage = '';

    // If file was uploaded
    if (req.file) {
      productImage = `/uploads/productImage/${req.file.filename}`;
    }
      // productImage.push(`/uploads/products/${req.file.filename}`);

    const product = new Product({
      farmer: farmer._id,
      name,
      category,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock),
      unit: unit || 'kg',
      productImage: productImage
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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
    console.error(error);
  }
});

// Update product
router.put('/farmer/products/:id', auth, uploadProductImage, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
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

    const { name, category, description, price, stock, unit, isActive } = req.body;

    // Check if name is being changed and if it conflicts with existing product
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        farmer: farmer._id,
        _id: { $ne: product._id }
      });

      if (existingProduct) {
        return res.status(400).json({ message: 'A product with this name already exists' });
      }
    }

    // Handle image update
    if (req.file) {
      if (product.images && product.images.length > 0) {
        const oldPathRelative = product.productImage;
        
        // Construct the full path on your computer
        const oldPathAbsolute = path.join(__dirname, '..', oldPathRelative);

        // Delete the file if it exists
        if (fs.existsSync(oldPathAbsolute)) {
           fs.unlinkSync(oldPathAbsolute);
        }
      }

      // REPLACE the image array
      product.productImage = `/uploads/productImage/${req.file.filename}`;
    } 

    // Update fields
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (unit !== undefined) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    const productObj = product.toObject();
    productObj.isLowStock = product.stock <= 10;
    productObj.isOutOfStock = product.stock === 0;

    res.json({
      message: 'Product updated successfully',
      product: productObj
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
    console.error(error);
  }
});

// Update product stock
router.patch('/farmer/products/:id/stock', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
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

    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: 'Valid stock quantity is required' });
    }

    product.stock = parseInt(stock);
    await product.save();

    const productObj = product.toObject();
    productObj.isLowStock = product.stock <= 10;
    productObj.isOutOfStock = product.stock === 0;

    res.json({
      message: 'Stock updated successfully',
      product: productObj
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
router.delete('/farmer/products/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
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

    // Instead of deleting, we can soft delete by setting isActive to false
    // Or actually delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product statistics for dashboard
router.get('/farmer/products/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
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
            $sum: {
              $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0]
            }
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

module.exports = router;