const express = require('express');
const router = express.Router();
const CheckoutOrder = require('../../models/consumer/CheckoutOrder');
const Order = require('../../models/farmer/Order');
const Cart = require('../../models/consumer/Cart');
const Product = require('../../models/farmer/Product');
const auth = require('../../middleware/auth');

// POST /api/orders/checkout
router.post('/consumer/cart/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, cartId } = req.body;
    const userId = req.user._id;

    // 1. Find the specific cart
    const cart = await Cart.findOne({ _id: cartId, user: userId }).populate('items.product');
    
    if (!cart || !cart.items.length) {
      return res.status(404).json({ message: 'Cart not found or empty' });
    }

    // 2. CRITICAL: Identify the Farmer
    // Since we enforce 1 farmer per cart, we grab the farmer from the first product
    const farmerId = cart.items[0].product.farmer;

    if (!farmerId) {
      return res.status(400).json({ message: 'Product does not have a valid farmer linked.' });
    }

    // 3. Prepare Order Items & Calc Total
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const total = item.product.price * item.quantity;
      totalAmount += total;
      return {
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: total
      };
    });

    // Add Shipping logic if needed
    const finalTotal = totalAmount > 50 ? totalAmount : totalAmount + 5.99;

    // 4. Create Order using UNIFIED Model
    const order = new Order({
      user: userId,       // The Buyer
      farmer: farmerId,   // The Seller (So they can see it!)
      items: orderItems,
      totalAmount: finalTotal,
      shippingAddress: shippingAddress, // Contains fullName, phone, etc.
      paymentMethod: paymentMethod || 'COD'
    });

    await order.save();

    // 5. Update Stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // 6. Clear Cart
    await Cart.findByIdAndDelete(cartId);

    res.status(201).json({ message: 'Order placed successfully', orderId: order._id });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

// PUT /api/orders/:id/cancel
// Cancel an order
router.put('/consumer/orders/:id/cancel', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    // 1. Find the order
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Check if cancellable
    // We usually only allow cancellation if it hasn't been shipped yet
    if (order.status === 'Shipped' || order.status === 'Delivered') {
      return res.status(400).json({ message: 'Cannot cancel order that has already been shipped or delivered.' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled.' });
    }

    // 3. RESTOCK ITEMS (Crucial Step)
    // Loop through items and add the quantity back to the Product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // 4. Update Status
    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

// GET /api/orders - Get user's order history
router.get('/consumer/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name productImage unit', // Get image for display
        populate: {
          path: 'farmer',
          select: 'farmName phone' // Get farmer details
        }
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

module.exports = router;