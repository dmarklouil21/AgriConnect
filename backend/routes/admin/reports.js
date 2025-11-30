const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Report = require('../../models/admin/Report');
const Order = require('../../models/farmer/Order');
const User = require('../../models/user/User');
const Product = require('../../models/farmer/Product');
const auth = require('../../middleware/auth');

// Middleware to ensure admin
const adminAuth = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// GET /api/admin/reports/stats
// Get live dashboard counts
router.get('/admin/reports/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate Total Sales (Sum of all completed orders)
    const salesAgg = await Order.aggregate([
      { $match: { status: { $in: ['Delivered', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = salesAgg.length > 0 ? salesAgg[0].total : 0;

    res.json({ totalUsers, totalOrders, totalSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// GET /api/admin/reports
// Get history of generated reports
router.get('/admin/reports', auth, adminAuth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// POST /api/admin/reports/generate
// Trigger a new report generation
router.post('/admin/reports/generate', auth, adminAuth, async (req, res) => {
  try {
    const { type, name } = req.body;
    
    // 1. Create Placeholder Report
    const report = await Report.create({
      name,
      type,
      generatedBy: req.user._id,
      status: 'Pending'
    });

    // 2. Generate Data (Simulated Async Process)
    // In a real app, this might go to a job queue (Redis/Bull)
    // Here we await it directly for simplicity
    
    let reportData = {};

    if (type === 'Sales') {
        // Aggregate Sales by Month
        reportData = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    } else if (type === 'Users') {
        // Aggregate User Growth by Month
        reportData = await User.aggregate([
            { $match: { userType: { $ne: 'admin' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    } else if (type === 'Products') {
        // Top Selling Products
        // Note: This requires unwinding orders. Simplified logic here:
        reportData = await Product.find({ status: 'Approved' })
            .select('name salesCount stock price farmer')
            .sort({ salesCount: -1 })
            .limit(10);
    }

    // 3. Update Report Record
    report.data = reportData;
    report.status = 'Generated';
    await report.save();

    res.status(201).json({ message: 'Report generated successfully', report });

  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

module.exports = router;
