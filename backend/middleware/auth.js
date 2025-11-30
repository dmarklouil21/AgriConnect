const jwt = require('jsonwebtoken');
const User = require('../models/user/User');

const auth = async (req, res, next) => {
  try {
    // 1. Get the token from the raw headers object (lowercase)
    // This matches the "authorization" key seen in your Railway logs
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];

    if (!authHeader) {
      console.log('Auth Error: Header is missing completely');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 2. Extract the token string (Handle "Bearer " prefix)
    // This handles "Bearer <token>" or just "<token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7, authHeader.length).trimLeft() 
      : authHeader;

    if (!token) {
      console.log('Auth Error: Header exists but token is empty');
      return res.status(401).json({ message: 'No token found' });
    }

    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Get the user
    const userId = decoded.userId || (decoded.user && decoded.user.id);
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('Auth Error: User not found in database');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;