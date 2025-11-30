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

    // Create new user
    user = new User({ email, password, userType });
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
        // Only allow admin creation if it's from another admin or during setup
        // You might want to add additional security here
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

    // Generate token
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
        userType: user.userType
      }
    });
  } catch (error) {
    // If user was created but profile failed, delete the user
    // if (user) {
    //   await User.findByIdAndDelete(user._id);
    // }
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

    // Account not supported 
    if (userType !== user.userType) {
      return res.status(400).json({ message: 'Account not supported for this portal' });
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
        userType: user.userType
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
        userType: req.user.userType
      },
      profile: profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;