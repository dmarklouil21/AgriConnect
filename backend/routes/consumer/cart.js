const express = require('express');
const router = express.Router();
const Cart = require('../../models/consumer/Cart');
const Product = require('../../models/farmer/Product');
const auth = require('../../middleware/auth');

// POST /api/cart/add
// Add item to cart
router.post('/consumer/add-cart', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // 1. Validate Product & Stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product unavailable' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const farmerId = product.farmer; // This is the key!

    // 2. Find specific cart for this Farmer
    let cart = await Cart.findOne({ user: userId, farmer: farmerId });

    if (cart) {
      // Cart exists for this farmer -> Update item
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        const newQty = cart.items[itemIndex].quantity + quantity;
        if (newQty > product.stock) return res.status(400).json({ message: 'Stock limit exceeded' });
        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    } else {
      // No cart for this farmer -> Create new one
      cart = await Cart.create({
        user: userId,
        farmer: farmerId,
        items: [{ product: productId, quantity }]
      });
    }

    res.status(200).json({ message: 'Added to cart' });

  } catch (error) {
    console.error('Add cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cart
// Get current user's cart
router.get('/consumer/get-cart', auth, async (req, res) => {
    try {
    // Find ALL carts belonging to user
    const carts = await Cart.find({ user: req.user._id })
      .populate('farmer', 'farmName') // Get Farmer Names
      .populate({
        path: 'items.product',
        select: 'name price productImage stock unit'
      });

    res.json({ carts }); // Return array of carts
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/cart/update
// Update item quantity
router.put('/consumer/update-cart', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // We find the cart containing this product
    const cart = await Cart.findOne({ user: req.user._id, 'items.product': productId });
    
    if (!cart) return res.status(404).json({ message: 'Item not found in any cart' });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/cart/remove/:productId
// Remove item from cart
router.delete('/consumer/remove-cart/:productId', auth, async (req, res) => {
  try {
    const productId = req.params.productId;
    const cart = await Cart.findOne({ user: req.user._id, 'items.product': productId });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Remove item
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    // If cart is empty, delete the cart entirely
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
    } else {
      await cart.save();
    }

    res.json({ message: 'Removed' });
  } catch (error) {
    res.ss(500).json({ message: 'Server error' });
  }
});

module.exports = router;