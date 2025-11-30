const express = require('express');
const Order = require('../models/farmer/Order');
const Product = require('../models/farmer/Product');
const Farmer = require('../models/user/Farmer');
const auth = require('../middleware/auth');
const router = express.Router();

// Get farmer dashboard statistics
router.get('/farmer/dashboard/stats', auth, async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    // Find farmer profile
    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get total sales (lifetime)
    const totalSalesResult = await Order.aggregate([
      { 
        $match: { 
          farmer: farmer._id, 
          status: 'completed',
          paymentStatus: 'paid'
        } 
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get current month sales
    const currentMonthSales = await Order.aggregate([
      { 
        $match: { 
          farmer: farmer._id, 
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: { $gte: currentMonthStart }
        } 
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Get last month sales
    const lastMonthSales = await Order.aggregate([
      { 
        $match: { 
          farmer: farmer._id, 
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        } 
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Get active products count
    const activeProducts = await Product.countDocuments({ 
      farmer: farmer._id, 
      isActive: true,
      stock: { $gt: 0 }
    });

    // Get total products count
    const totalProducts = await Product.countDocuments({ farmer: farmer._id });

    // Get average rating
    const ratingStats = await Order.aggregate([
      { 
        $match: { 
          farmer: farmer._id,
          'rating.score': { $exists: true, $ne: null }
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.score' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    // Calculate changes
    const currentMonthAmount = currentMonthSales[0]?.amount || 0;
    const lastMonthAmount = lastMonthSales[0]?.amount || 0;
    const salesChange = lastMonthAmount === 0 ? 100 : 
      ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100;

    const currentMonthOrders = currentMonthSales[0]?.orders || 0;
    const lastMonthOrders = lastMonthSales[0]?.orders || 0;
    const ordersChange = lastMonthOrders === 0 ? 100 : 
      ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

    const totalSales = totalSalesResult[0]?.totalSales || 0;
    const totalCompletedOrders = totalSalesResult[0]?.totalOrders || 0;

    const averageRating = ratingStats[0]?.averageRating || 0;
    const totalRatings = ratingStats[0]?.totalRatings || 0;

    // Format the response
    const stats = {
      totalSales: {
        value: totalSales.toFixed(2),
        change: salesChange.toFixed(0),
        currentMonth: currentMonthAmount,
        lastMonth: lastMonthAmount
      },
      monthlyOrders: {
        value: currentMonthOrders,
        change: ordersChange.toFixed(0),
        currentMonth: currentMonthOrders,
        lastMonth: lastMonthOrders
      },
      activeProducts: {
        value: activeProducts,
        change: '+0', // We don't track product change for now
        total: totalProducts
      },
      customerRating: {
        value: averageRating.toFixed(1),
        change: '+0.0', // We don't track rating change for now
        totalRatings: totalRatings
      },
      totalCompletedOrders: totalCompletedOrders
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top selling products
router.get('/farmer/dashboard/top-products', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const limit = parseInt(req.query.limit) || 5;
    const period = req.query.period || 'month'; // month, week, all

    let dateFilter = {};
    const currentDate = new Date();
    
    if (period === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      dateFilter = { createdAt: { $gte: monthStart } };
    } else if (period === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekStart } };
    }

    const topProducts = await Order.aggregate([
      {
        $match: {
          farmer: farmer._id,
          status: 'completed',
          ...dateFilter
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          averagePrice: { $avg: '$items.price' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          name: 1,
          totalSold: 1,
          totalRevenue: 1,
          averagePrice: 1,
          category: { $arrayElemAt: ['$productDetails.category', 0] },
          unit: { $arrayElemAt: ['$productDetails.unit', 0] }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);

    // Format the response
    const formattedProducts = topProducts.map(product => ({
      name: product.name,
      sales: product.totalSold,
      revenue: `$${product.totalRevenue.toFixed(2)}`,
      averagePrice: product.averagePrice,
      category: product.category,
      unit: product.unit
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent activity
router.get('/farmer/dashboard/recent-activity', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const limit = parseInt(req.query.limit) || 10;

    // Get recent orders
    const recentOrders = await Order.find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'firstName lastName')
      .select('orderNumber status totalAmount createdAt customerName');

    // Get recent product updates (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentProductUpdates = await Product.find({
      farmer: farmer._id,
      updatedAt: { $gte: oneWeekAgo },
      $or: [
        { stock: { $exists: true } },
        { price: { $exists: true } }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('name stock price updatedAt');

    // Format activities
    const activities = [];

    // Add order activities
    recentOrders.forEach(order => {
      let action = '';
      let type = 'order';
      let icon = 'ShoppingCart';

      switch (order.status) {
        case 'pending':
          action = `New order received - ${order.orderNumber}`;
          break;
        case 'accepted':
          action = `Order accepted - ${order.orderNumber}`;
          break;
        case 'completed':
          action = `Order completed - ${order.orderNumber}`;
          type = 'complete';
          icon = 'DollarSign';
          break;
        default:
          action = `Order ${order.status} - ${order.orderNumber}`;
      }

      activities.push({
        action,
        time: order.createdAt,
        type,
        icon,
        orderId: order._id,
        amount: order.totalAmount
      });
    });

    // Add product update activities
    recentProductUpdates.forEach(product => {
      activities.push({
        action: `Product "${product.name}" updated`,
        time: product.updatedAt,
        type: 'update',
        icon: 'Package',
        productId: product._id
      });
    });

    // Sort all activities by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, limit);

    // Format time ago
    const formattedActivities = limitedActivities.map(activity => {
      const now = new Date();
      const activityTime = new Date(activity.time);
      const diffMs = now - activityTime;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = '';
      if (diffHours < 1) {
        timeAgo = 'Just now';
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      }

      return {
        ...activity,
        time: timeAgo,
        timestamp: activity.time
      };
    });

    res.json(formattedActivities);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales chart data
router.get('/farmer/dashboard/sales-chart', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const period = req.query.period || 'month'; // month, week, year
    let groupByFormat = '';
    let dateRange = {};

    const currentDate = new Date();
    
    if (period === 'week') {
      // Last 7 days
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - 6);
      dateRange = { createdAt: { $gte: weekStart } };
      groupByFormat = '%Y-%m-%d';
    } else if (period === 'month') {
      // Last 30 days
      const monthStart = new Date(currentDate);
      monthStart.setDate(currentDate.getDate() - 29);
      dateRange = { createdAt: { $gte: monthStart } };
      groupByFormat = '%Y-%m-%d';
    } else if (period === 'year') {
      // Last 12 months
      const yearStart = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
      dateRange = { createdAt: { $gte: yearStart } };
      groupByFormat = '%Y-%m';
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          farmer: farmer._id,
          status: 'completed',
          paymentStatus: 'paid',
          ...dateRange
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupByFormat,
              date: '$createdAt'
            }
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with zero values
    const filledData = fillMissingDates(salesData, period, groupByFormat);

    res.json(filledData);
  } catch (error) {
    console.error('Get sales chart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to fill missing dates in chart data
function fillMissingDates(data, period, format) {
  const filledData = [];
  const currentDate = new Date();
  
  let count = 0;
  let dateIterator = new Date();

  if (period === 'week') {
    count = 7;
    dateIterator.setDate(currentDate.getDate() - 6);
  } else if (period === 'month') {
    count = 30;
    dateIterator.setDate(currentDate.getDate() - 29);
  } else if (period === 'year') {
    count = 12;
    dateIterator.setFullYear(currentDate.getFullYear() - 1);
    dateIterator.setMonth(currentDate.getMonth());
  }

  for (let i = 0; i < count; i++) {
    const dateKey = dateIterator.toISOString().slice(0, format === '%Y-%m' ? 7 : 10);
    const existingData = data.find(item => item._id === dateKey);
    
    filledData.push({
      date: dateKey,
      sales: existingData ? existingData.sales : 0,
      orders: existingData ? existingData.orders : 0
    });

    if (period === 'year') {
      dateIterator.setMonth(dateIterator.getMonth() + 1);
    } else {
      dateIterator.setDate(dateIterator.getDate() + 1);
    }
  }

  return filledData;
}

// Get comprehensive dashboard data (all in one call)
router.get('/farmer/dashboard/overview', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    // Run all dashboard queries in parallel
    const [stats, topProducts, recentActivity, salesChart] = await Promise.all([
      // Stats
      (async () => {
        const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/farmer/dashboard/stats`, {
          headers: { Authorization: req.headers.authorization }
        });
        return response.json();
      })(),
      
      // Top products
      (async () => {
        const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/farmer/dashboard/top-products?limit=5`, {
          headers: { Authorization: req.headers.authorization }
        });
        return response.json();
      })(),
      
      // Recent activity
      (async () => {
        const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/farmer/dashboard/recent-activity?limit=5`, {
          headers: { Authorization: req.headers.authorization }
        });
        return response.json();
      })(),
      
      // Sales chart
      (async () => {
        const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/farmer/dashboard/sales-chart?period=month`, {
          headers: { Authorization: req.headers.authorization }
        });
        return response.json();
      })()
    ]);

    res.json({
      stats,
      topProducts,
      recentActivity,
      salesChart
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;