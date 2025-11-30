const jwt = require('jsonwebtoken');
const User = require('../models/user/User');

const auth = async (req, res, next) => {
  try {
    // 1. Debug Log (View this in Railway Logs)
    console.log('Auth Middleware Headers:', req.headers);

    // 2. Try to find the token in multiple places
    let token = 
      req.header('Authorization') || 
      req.header('authorization') || 
      req.header('x-auth-token');

    // 3. Remove "Bearer " prefix if it exists
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    if (!token) {
      console.log('Auth Error: Token is missing');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 4. Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both { userId: "..." } and { user: { id: "..." } } payload structures
    const userId = decoded.userId || (decoded.user && decoded.user.id);

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('Auth Error: User not found in DB');
      return res.status(401).json({ message: 'Token is not valid (User not found)' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;