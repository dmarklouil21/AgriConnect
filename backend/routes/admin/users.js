const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../../models/user/User');
const Admin = require('../../models/user/Admin');
const Farmer = require('../../models/user/Farmer');
const Consumer = require('../../models/user/Consumer');
const Order = require('../../models/farmer/Order'); // Unified Order model
const auth = require('../../middleware/auth');

// Middleware to ensure admin
const adminAuth = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// GET /api/admin/users
// Fetch all users with their profile details
router.get('/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const { type, status, search } = req.query;
    
    // Removed the { $ne: 'admin' } restriction so Admins show up
    let query = {}; 
    
    if (type && type !== 'all') {
        query.userType = { $regex: new RegExp(`^${type}$`, 'i') };
    }
    if (status && status !== 'all') {
        query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }
    
    const users = await User.find(query).sort({ createdAt: -1 });

    const populatedUsers = await Promise.all(users.map(async (user) => {
      let profile = null;
      let stats = { products: 0, totalSales: 0, orders: 0, totalSpent: 0 };

      const userType = user.userType.toLowerCase();

      if (userType === 'farmer') {
        profile = await Farmer.findOne({ user: user._id });
        if (profile) {
            stats.products = await mongoose.connection.collection('products').countDocuments({ farmer: profile._id });
            const orders = await Order.find({ farmer: profile._id, status: 'Completed' });
            stats.totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        }
      } else if (userType === 'consumer') {
        profile = await Consumer.findOne({ user: user._id });
        if (profile) {
            const orders = await Order.find({ consumer: profile._id });
            stats.orders = orders.length;
            const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
            stats.totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        }
      } else if (userType === 'admin') {
        profile = await Admin.findOne({ user: user._id });
        // Admins don't strictly have sales/orders stats in this context
      }

      // Search Logic
      if (search) {
        const searchStr = search.toLowerCase();
        const name = profile ? `${profile.firstName} ${profile.lastName}`.toLowerCase() : '';
        const email = user.email.toLowerCase();
        if (!name.includes(searchStr) && !email.includes(searchStr)) return null;
      }

      return {
        id: user._id,
        name: profile ? `${profile.firstName} ${profile.lastName}` : 'Incomplete Profile',
        email: user.email,
        type: user.userType.charAt(0).toUpperCase() + user.userType.slice(1),
        status: user.status || 'Active',
        joinDate: user.createdAt.toISOString().split('T')[0],
        lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A',
        phone: profile?.phoneNumber || 'N/A',
        address: profile?.address || 'N/A',
        farmName: profile?.farmName || null,
        ...stats
      };
    }));

    res.json(populatedUsers.filter(u => u !== null));

  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/stats
router.get('/admin/users/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({}); // Count everyone including admins
    
    const activeFarmers = await User.countDocuments({ 
        userType: { $regex: /^farmer$/i }, 
        status: { $regex: /^active$/i } 
    });
    
    const activeConsumers = await User.countDocuments({ 
        userType: { $regex: /^consumer$/i }, 
        status: { $regex: /^active$/i } 
    });
    
    const pendingUsers = await User.countDocuments({ 
        status: { $regex: /^pending$/i } 
    });

    res.json({
      totalUsers,
      activeFarmers,
      activeConsumers,
      pendingUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/admin/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/users/create', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, type, phone, address, farmName, password } = req.body;
    
    // 0. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 1. Create Auth User
    // Use provided password or fallback (though UI should enforce it now)
    const finalPassword = password || 'Password123!'; 
    
    const user = await User.create({
      email,
      password: finalPassword, 
      userType: type.toLowerCase(),
      status: 'Active'
    });

    // 2. Handle Name Splitting
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '.'; 

    // 3. Create Profile based on Type
    const userType = type.toLowerCase();

    if (userType === 'farmer') {
      await Farmer.create({
        user: user._id,
        firstName, lastName,
        phoneNumber: phone,
        address,
        farmName: farmName || `${firstName}'s Farm`,
        profilePhoto: null
      });
    } else if (userType === 'consumer') {
      await Consumer.create({
        user: user._id,
        firstName, lastName,
        phoneNumber: phone,
        address,
        profilePhoto: null
      });
    } else if (userType === 'admin') {
      await Admin.create({
        user: user._id,
        firstName, lastName,
        phoneNumber: phone,
        address,
        profilePhoto: null
      });
    }

    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error('Create User Error:', error);
    const message = error.name === 'ValidationError' ? Object.values(error.errors).map(val => val.message).join(', ') : 'Error creating user';
    res.status(500).json({ message });
  }
});

module.exports = router;