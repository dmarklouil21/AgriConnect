const express = require('express');
const router = express.Router();
// Preserving your specific imports
const Order = require('../models/farmer/Order');
const Product = require('../models/farmer/Product');
const Farmer = require('../models/user/Farmer');
const Consumer = require('../models/user/Consumer');
const auth = require('../middleware/auth');

// 1. Get all orders (Query Params)
// This is fine here because it doesn't use a path parameter
router.get('/farmer/orders', auth, async (req, res) => {
  try {
    // 1. Find the Farmer Profile ID for the logged-in user
    const farmerProfile = await Farmer.findOne({ user: req.user._id });
    if (!farmerProfile) return res.status(404).json({ message: 'Farmer profile not found' });

    const { status } = req.query;
    
    // 2. Find Orders where 'farmer' matches this profile ID
    let query = { farmer: farmerProfile._id };
    
    // Map frontend 'accepted' to backend 'Processing' if needed, or keep simple
    if (status && status !== 'all') {
        // Simple mapping example if your frontend uses lowercase
        const map = { 'accepted': 'Processing', 'ready': 'Shipped', 'completed': 'Delivered', 'pending': 'Pending' };
        query.status = map[status] || status; 
    }

    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'productImage name category unit'
      })
      .populate('user', 'firstName lastName email') // Populate Buyer info from User model
      .sort({ createdAt: -1 });

    // 3. Map to frontend structure
    const formattedOrders = orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        consumer: {
            // Fallback to shipping address name if user profile is missing
            firstName: order.user?.firstName || order.shippingAddress.fullName.split(' ')[0],
            lastName: order.user?.lastName || '',
            email: order.user?.email || 'N/A',
            phone: order.shippingAddress.phone
        },
        shippingAddress: order.shippingAddress, // Contains address, city, zip
        items: order.items
    }));

    res.json({ orders: formattedOrders });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Get order statistics (MOVED UP)
// MUST be before /:id
router.get('/farmer/orders/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    // Assuming you have a static method getFarmerStats on Order model
    // If not, you might need to implement the aggregation here manually
    const stats = await Order.getFarmerStats ? await Order.getFarmerStats(farmer._id) : {};

    const recentOrders = await Order.find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .select('orderNumber totalAmount status createdAt');

    res.json({
      ...stats,
      recentOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. Get order counts by status (MOVED UP)
// MUST be before /:id
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
      // Ensure status key exists or handle unknown statuses
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

// 4. Get single order details (MOVED DOWN)
// This captures /:id, so it must come AFTER specific paths like /stats or /counts
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
    // Ensure formattedAddress exists if the virtual didn't trigger
    orderObj.formattedAddress = order.formattedAddress || (order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : 'N/A');

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

    // Stock Logic: Reserve stock on Accept
    if (status === 'accepted') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(400).json({ message: `Product ${item.name} no longer exists` });
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${item.name}.` });
        }
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    // Stock Logic: Return stock on Decline/Cancel
    if ((status === 'declined' || status === 'cancelled') && 
        (order.status === 'accepted' || order.status === 'preparing')) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    // Assuming your Order model has an updateStatus method, otherwise use standard save
    if (order.updateStatus) {
        await order.updateStatus(status, notes);
    } else {
        order.status = status;
        if(notes) order.farmerNotes = notes; // Adjust field name if different
        await order.save();
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('items.product', 'name category unit images');

    const orderObj = updatedOrder.toObject();
    orderObj.formattedAddress = updatedOrder.formattedAddress || (updatedOrder.deliveryAddress ? `${updatedOrder.deliveryAddress.street}, ${updatedOrder.deliveryAddress.city}` : 'N/A');

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