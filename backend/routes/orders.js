const express = require('express');
const Order = require('../models/farmer/Order');
const Product = require('../models/farmer/Product');
const Farmer = require('../models/user/Farmer');
const Consumer = require('../models/user/Consumer');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all orders for the authenticated farmer
router.get('/farmer/orders', auth, async (req, res) => {
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
    
    // Status filter
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { customerName: { $regex: req.query.search, $options: 'i' } },
        { 'deliveryAddress.city': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('consumer', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filter);

    // Add virtual fields
    const ordersWithVirtuals = orders.map(order => ({
      ...order,
      formattedAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
    }));

    res.json({
      orders: ordersWithVirtuals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order details
router.get('/farmer/orders/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const order = await Order.findOne({ 
      _id: req.params.id, 
      farmer: farmer._id 
    })
    .populate('consumer', 'firstName lastName email phoneNumber')
    .populate('items.product', 'name category unit images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderObj = order.toObject();
    orderObj.formattedAddress = order.formattedAddress;

    res.json(orderObj);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/farmer/orders/:id/status', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findOne({ 
      _id: req.params.id, 
      farmer: farmer._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If accepting order, check product stock
    if (status === 'accepted') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ 
            message: `Product ${item.name} no longer exists` 
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
      }

      // Reserve stock by decreasing it
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // If declining or cancelling an accepted order, restore stock
    if ((status === 'declined' || status === 'cancelled') && 
        (order.status === 'accepted' || order.status === 'preparing')) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.updateStatus(status, notes);

    const updatedOrder = await Order.findById(order._id)
      .populate('consumer', 'firstName lastName email phoneNumber')
      .populate('items.product', 'name category unit images');

    const orderObj = updatedOrder.toObject();
    orderObj.formattedAddress = updatedOrder.formattedAddress;

    res.json({
      message: `Order ${status} successfully`,
      order: orderObj
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add farmer notes to order
router.patch('/farmer/orders/:id/notes', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const { notes } = req.body;

    const order = await Order.findOne({ 
      _id: req.params.id, 
      farmer: farmer._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.farmerNotes = notes;
    await order.save();

    res.json({
      message: 'Notes updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order notes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order statistics for dashboard
router.get('/farmer/orders/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const stats = await Order.getFarmerStats(farmer._id);

    // Get recent orders
    const recentOrders = await Order.find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('consumer', 'firstName lastName')
      .select('orderNumber customerName totalAmount status createdAt');

    res.json({
      ...stats,
      recentOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order counts by status
router.get('/farmer/orders/counts', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const counts = await Order.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      all: 0,
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      declined: 0
    };

    counts.forEach(item => {
      statusCounts[item._id] = item.count;
      statusCounts.all += item.count;
    });

    res.json(statusCounts);
  } catch (error) {
    console.error('Get order counts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;