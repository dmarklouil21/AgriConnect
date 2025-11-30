const express = require('express');
const router = express.Router();
const Order = require('../models/farmer/Order');
const Product = require('../models/farmer/Product');
const Farmer = require('../models/user/Farmer');
const Consumer = require('../models/user/Consumer');
const auth = require('../middleware/auth');

// 1. Get all orders (Query Params)
router.get('/farmer/orders', auth, async (req, res) => {
  try {
    const farmerProfile = await Farmer.findOne({ user: req.user._id });
    if (!farmerProfile) return res.status(404).json({ message: 'Farmer profile not found' });

    const { status } = req.query;
    
    let query = { farmer: farmerProfile._id };
    
    // Map specific frontend tabs to schema statuses if necessary
    if (status && status !== 'all') {
        query.status = status; 
    }

    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'productImage name category unit'
      })
      .populate('user', 'firstName lastName email') 
      .sort({ createdAt: -1 });

    // Map to frontend structure
    const formattedOrders = orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        consumer: {
            firstName: order.user?.firstName || order.shippingAddress.fullName.split(' ')[0],
            lastName: order.user?.lastName || '',
            email: order.user?.email || 'N/A',
            phone: order.shippingAddress.phone
        },
        shippingAddress: order.shippingAddress,
        items: order.items
    }));

    res.json({ orders: formattedOrders });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Get order statistics
router.get('/farmer/orders/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    // Basic stats
    const totalOrders = await Order.countDocuments({ farmer: farmer._id });
    const completedOrders = await Order.countDocuments({ farmer: farmer._id, status: 'Delivered' });
    const pendingOrders = await Order.countDocuments({ farmer: farmer._id, status: 'Pending' });
    
    // Calculate Total Revenue (Only from Delivered orders)
    const revenueAgg = await Order.aggregate([
        { $match: { farmer: farmer._id, status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const recentOrders = await Order.find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .select('orderNumber totalAmount status createdAt');

    res.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue, 
      recentOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. Get order counts by status
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
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Declined: 0 // Include Declined if used
    };

    counts.forEach(item => {
      if (item._id) {
          statusCounts[item._id] = item.count;
      }
      statusCounts.all += item.count;
    });

    res.json(statusCounts);
  } catch (error) {
    console.error('Get order counts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. Get single order details
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
    .populate('user', 'firstName lastName email phoneNumber')
    .populate('items.product', 'name category unit images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderObj = order.toObject();
    orderObj.formattedAddress = order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}` : 'N/A';

    res.json(orderObj);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 5. Update order status
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

    const previousStatus = order.status;

    // --- LOGIC 1: Stock Reservation (Pending -> Processing) ---
    if (status === 'Processing' && previousStatus === 'Pending') {
      // Check stock availability first
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(400).json({ message: `Product ${item.name} no longer exists` });
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${item.name}.` });
        }
      }
      // Deduct stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    // --- LOGIC 2: Stock Return (Processing/Shipped -> Cancelled/Declined) ---
    if ((status === 'Cancelled' || status === 'Declined') && 
        (previousStatus === 'Processing' || previousStatus === 'Shipped')) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    // --- LOGIC 3: Sales Analytics (Any -> Delivered) ---
    // This increments the 'salesCount' in the Product model
    if ((status === 'Delivered' || status === 'Completed') && previousStatus !== 'Delivered') {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { 
                $inc: { salesCount: item.quantity } 
            });
        }
    }

    // Update Order Record
    if (order.updateStatus) {
        await order.updateStatus(status, notes);
    } else {
        order.status = status;
        if(notes) order.farmerNotes = notes;
        await order.save();
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('items.product', 'name category unit images');

    const orderObj = updatedOrder.toObject();
    orderObj.formattedAddress = updatedOrder.shippingAddress ? `${updatedOrder.shippingAddress.address}, ${updatedOrder.shippingAddress.city}` : 'N/A';

    res.json({
      message: `Order ${status} successfully`,
      order: orderObj
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 6. Add farmer notes
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

module.exports = router;