const express = require('express');
const Activity = require('../models/Activity');
const { protect, authorize } = require('../middleware/auth');
const { getActivities } = require('../utils/activityLogger');

const router = express.Router();

// @route   GET /api/activities
// @desc    Get admin activities (primary admin sees all, others see own)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminId, activityType, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filters = {
      activityType: activityType || null,
      startDate: startDate || null,
      endDate: endDate || null,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Primary admin can see all activities, other admins see only their own
    const primaryAdminEmail = 'vh@iiitdmj.ac.in';
    const userEmail = req.user.email;

    // If requesting specific admin activities and user is not primary admin, verify permission
    if (adminId && userEmail !== primaryAdminEmail) {
      // Only primary admin or the admin themselves can view
      if (req.user.id !== adminId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view other admin activities'
        });
      }
    }

    // Only primary admin can see all activities
    if (userEmail === primaryAdminEmail && adminId) {
      filters.adminId = adminId;
    } else if (userEmail !== primaryAdminEmail) {
      // Other admins only see their own activities
      filters.adminId = req.user.id;
    }

    const result = await getActivities(filters);

    res.json({
      success: true,
      count: result.activities.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
});

// @route   GET /api/activities/summary
// @desc    Get activity summary (for dashboard)
// @access  Private/Admin
router.get('/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const primaryAdminEmail = 'vh@iiitdmj.ac.in';
    const userEmail = req.user.email;

    let query = {};
    if (userEmail !== primaryAdminEmail) {
      query.admin = req.user.id;
    }

    // Get activities from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query.createdAt = { $gte: sevenDaysAgo };

    const activities = await Activity.find(query).lean();

    // Count by activity type
    const summary = {
      totalActivities: activities.length,
      bookingsApproved: activities.filter(a => a.activityType === 'BOOKING_APPROVED').length,
      bookingsRejected: activities.filter(a => a.activityType === 'BOOKING_REJECTED').length,
      checkIns: activities.filter(a => a.activityType === 'BOOKING_CHECKIN').length,
      checkOuts: activities.filter(a => a.activityType === 'BOOKING_CHECKOUT').length,
      roomsCreated: activities.filter(a => a.activityType === 'ROOM_CREATED').length,
      roomsBlocked: activities.filter(a => a.activityType === 'ROOM_BLOCKED').length,
      staffManagement: activities.filter(a => a.activityType.includes('STAFF')).length
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity summary',
      error: error.message
    });
  }
});

// @route   GET /api/activities/:bookingId/booking-activities
// @desc    Get all activities related to a specific booking
// @access  Private/Admin
router.get('/:bookingId/booking-activities', protect, authorize('admin'), async (req, res) => {
  try {
    const activities = await Activity.find({ bookingId: req.params.bookingId })
      .populate('admin', 'name email')
      .sort({ createdAt: 1 }) // Oldest first to see progression
      .lean();

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking activities',
      error: error.message
    });
  }
});

module.exports = router;
