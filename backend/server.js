require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

// Farmers API Routes
// Product Management
app.use('/api', require('./routes/products'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Order Management
app.use('/api', require('./routes/orders'));

// Dashboard
app.use('/api', require('./routes/dashboard'));

// Consumers API Routes
// Consumer Product Browsing
app.use('/api', require('./routes/consumer/productBrowsing'));

// Consumer Cart Management
app.use('/api', require('./routes/consumer/cart'));

// Consumer Order Management
app.use('/api', require('./routes/consumer/orders'));

// Admin API Routes
// User Management
app.use('/api', require('./routes/admin/users'));

// Product Monitoring
app.use('/api', require('./routes/admin/products'));

app.use('/api', require('./routes/admin/reports'));

// Reviews Management
app.use('/api', require('./routes/reviews'));

// Basic route
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});