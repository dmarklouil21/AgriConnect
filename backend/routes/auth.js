const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user/User');
const Farmer = require('../models/user/Farmer');
const Consumer = require('../models/user/Consumer');
const Admin = require('../models/user/Admin');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, userType, ...profileData } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate user type
    const validUserTypes = ['farmer', 'consumer', 'admin'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // --- CHANGE 1: Determine Initial Status ---
    // Farmers must be approved. Consumers are auto-active. Admins usually auto-active (or pending depending on your security preference)
    let initialStatus = 'Active';
    if (userType === 'farmer') {
      initialStatus = 'Pending';
    }

    // Create new user with specific status
    user = new User({ 
      email, 
      password, 
      userType, 
      status: initialStatus // Explicitly set status
    });
    
    await user.save();

    let userProfile;

    // Create profile based on user type
    switch (userType) {
      case 'farmer':
        userProfile = new Farmer({
          user: user._id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          farmName: profileData.farmName,
          address: profileData.address,
          ...profileData
        });
        break;

      case 'consumer':
        userProfile = new Consumer({
          user: user._id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          address: profileData.address,
          ...profileData
        });
        break;

      case 'admin':
        userProfile = new Admin({
          user: user._id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          address: profileData.address,
          ...profileData
        });
        break;
    }

    if (userProfile) {
      await userProfile.save();
    }

    // --- CHANGE 2: Handle Response based on Status ---
    
    // If pending, do NOT return token. User cannot login yet.
    if (initialStatus === 'Pending') {
      return res.status(201).json({
        message: 'Registration successful! Your account is pending approval from an administrator.',
        user: {
          id: user._id,
          email: user.email,
          userType: user.userType,
          status: 'Pending'
        }
      });
    }

    // If Active, generate token immediately
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        status: 'Active'
      }
    });

  } catch (error) {
    // Cleanup if profile creation failed
    // if (user) await User.findByIdAndDelete(user._id);
    
    res.status(500).json({ message: 'Server error', error: error.message });
    console.error("Registration Error:", error);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Account not supported for this portal
    if (userType !== user.userType) {
      return res.status(400).json({ message: 'Account not supported for this portal' });
    }

    // --- CHANGE 3: Check User Status ---
    if (user.status !== 'Active') {
        if (user.status === 'Pending') {
            return res.status(403).json({ message: 'Your account is currently pending approval. Please wait for admin verification.' });
        }
        if (user.status === 'Suspended') {
            return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
        }
        if (user.status === 'Rejected') {
            return res.status(403).json({ message: 'Your account application was rejected.' });
        }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: email,
        userType: user.userType,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.error("Login Error:", error);
  }
});

// Get current user with profile
router.get('/me', auth, async (req, res) => {
  try {
    let profile = null;

    // Get user profile based on user type
    switch (req.user.userType) {
      case 'farmer':
        profile = await Farmer.findOne({ user: req.user._id });
        break;
      case 'consumer':
        profile = await Consumer.findOne({ user: req.user._id });
        break;
      case 'admin':
        profile = await Admin.findOne({ user: req.user._id });
        break;
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        userType: req.user.userType,
        status: req.user.status // It's helpful to send status back too
      },
      profile: profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;