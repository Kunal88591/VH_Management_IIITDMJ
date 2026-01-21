const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Bill = require('../models/Bill');
const Staff = require('../models/Staff');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Bookings stats
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
    const checkedInBookings = await Booking.countDocuments({ status: 'Checked-In' });
    
    // Room stats
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true, isBlocked: false });
    const blockedRooms = await Room.countDocuments({ isBlocked: true });
    
    // Get currently occupied rooms
    const now = new Date();
    const occupiedBookings = await Booking.find({
      status: 'Checked-In',
      checkInDate: { $lte: now },
      checkOutDate: { $gte: now }
    });
    const occupiedRoomIds = new Set();
    occupiedBookings.forEach(b => b.rooms.forEach(r => occupiedRoomIds.add(r.room.toString())));
    const occupiedRooms = occupiedRoomIds.size;
    
    // Revenue stats
    const revenueData = await Bill.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
          collectedRevenue: { $sum: '$paidAmount' },
          pendingRevenue: { $sum: { $subtract: ['$grandTotal', '$paidAmount'] } }
        }
      }
    ]);
    
    const revenue = revenueData[0] || { totalRevenue: 0, collectedRevenue: 0, pendingRevenue: 0 };
    
    // Staff stats
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ isActive: true });

    // Occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          approved: approvedBookings,
          checkedIn: checkedInBookings
        },
        rooms: {
          total: totalRooms,
          available: availableRooms - occupiedRooms,
          occupied: occupiedRooms,
          blocked: blockedRooms,
          occupancyRate
        },
        revenue: {
          total: revenue.totalRevenue,
          collected: revenue.collectedRevenue,
          pending: revenue.pendingRevenue
        },
        staff: {
          total: totalStaff,
          active: activeStaff
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/recent-bookings
// @desc    Get recent booking requests
// @access  Private/Admin
router.get('/recent-bookings', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guest', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent bookings',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/revenue-chart
// @desc    Get revenue data for chart
// @access  Private/Admin
router.get('/revenue-chart', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    let groupBy;
    if (period === 'monthly') {
      groupBy = { $month: '$createdAt' };
    } else if (period === 'daily') {
      groupBy = { $dayOfMonth: '$createdAt' };
    }

    const revenueData = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$grandTotal' },
          collected: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/occupancy-chart
// @desc    Get occupancy data for chart
// @access  Private/Admin
router.get('/occupancy-chart', protect, authorize('admin'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const occupiedBookings = await Booking.find({
        status: { $in: ['Approved', 'Checked-In', 'Checked-Out'] },
        checkInDate: { $lte: nextDate },
        checkOutDate: { $gt: date }
      });

      const occupiedRoomCount = new Set();
      occupiedBookings.forEach(b => b.rooms.forEach(r => occupiedRoomCount.add(r.room.toString())));

      const totalRooms = await Room.countDocuments({ isAvailable: true });
      
      data.push({
        date: date.toISOString().split('T')[0],
        occupied: occupiedRoomCount.size,
        total: totalRooms,
        rate: totalRooms > 0 ? Math.round((occupiedRoomCount.size / totalRooms) * 100) : 0
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching occupancy data',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/booking-status-chart
// @desc    Get booking status distribution
// @access  Private/Admin
router.get('/booking-status-chart', protect, authorize('admin'), async (req, res) => {
  try {
    const statusData = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: statusData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking status data',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/food-billing-summary
// @desc    Get food billing summary
// @access  Private/Admin
router.get('/food-billing-summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const foodSummary = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFoodRevenue: { $sum: '$foodCharges.subtotal' },
          totalBills: { $sum: 1 },
          billsWithFood: {
            $sum: { $cond: [{ $gt: ['$foodCharges.subtotal', 0] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: foodSummary[0] || { totalFoodRevenue: 0, totalBills: 0, billsWithFood: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food billing summary',
      error: error.message
    });
  }
});

module.exports = router;
