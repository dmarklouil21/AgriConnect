require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path');

const app = express();

// --- FIXED CORS MIDDLEWARE ---
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://agri-connect-coral.vercel.app" 
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "authorization", "x-auth-token"] 
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/products'));
// Keep this for backward compatibility, but new images go to Cloudinary
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/api', require('./routes/orders'));
app.use('/api', require('./routes/dashboard'));

// Consumers API Routes
app.use('/api', require('./routes/consumer/productBrowsing'));
app.use('/api', require('./routes/consumer/cart'));
app.use('/api', require('./routes/consumer/orders'));

// Admin API Routes
app.use('/api', require('./routes/admin/users'));
app.use('/api', require('./routes/admin/products'));
app.use('/api', require('./routes/admin/reports'));

// Reviews Management
app.use('/api', require('./routes/reviews'));

// Basic route (Health Check)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to my app backend!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- CRITICAL FIX: Async Startup ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log("Database connected successfully.");

    // 2. Start Server ONLY after DB matches
    // We explicitly bind to '0.0.0.0' for Railway/Docker compatibility
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to Database:", error);
    process.exit(1); // Exit with failure so Railway knows to restart
  }
};

startServer();