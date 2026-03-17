const Activity = require('../models/Activity');

/**
 * Log admin activity
 * @param {Object} params - Activity parameters
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.adminName - Admin name
 * @param {string} params.adminEmail - Admin email
 * @param {string} params.activityType - Type of activity
 * @param {string} params.description - Description of activity
 * @param {string} params.bookingId - Related booking ID (optional)
 * @param {string} params.bookingNumber - Related booking number (optional)
 * @param {string} params.roomId - Related room ID (optional)
 * @param {string} params.roomNumber - Related room number (optional)
 * @param {Object} params.details - Additional details (optional)
 * @param {string} params.ipAddress - IP address (optional)
 * @param {string} params.userAgent - User agent (optional)
 */
async function logActivity(params) {
  try {
    const activity = new Activity({
      admin: params.adminId,
      adminName: params.adminName,
      adminEmail: params.adminEmail,
      activityType: params.activityType,
      description: params.description,
      bookingId: params.bookingId || null,
      bookingNumber: params.bookingNumber,
      roomId: params.roomId || null,
      roomNumber: params.roomNumber,
      staffId: params.staffId || null,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent activity logging from breaking main operations
    return null;
  }
}

/**
 * Get admin activities (primary admin can see all, other admins see only their own by default)
 */
async function getActivities(filters = {}) {
  try {
    let query = {};

    if (filters.adminId) query.admin = filters.adminId;
    if (filters.activityType) query.activityType = filters.activityType;

    // Date range filtering
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        query.createdAt.$lte = endDate;
      }
    }

    const activities = await Activity.find(query)
      .populate('admin', 'name email role')
      .populate('bookingId', 'bookingId visitorCategory status')
      .populate('roomId', 'roomNumber roomType')
      .sort({ createdAt: -1 })
      .limit(parseInt(filters.limit) || 100)
      .skip((parseInt(filters.page) - 1 || 0) * (parseInt(filters.limit) || 100))
      .lean();

    const total = await Activity.countDocuments(query);

    return {
      activities,
      total,
      page: parseInt(filters.page) || 1,
      pages: Math.ceil(total / (parseInt(filters.limit) || 100))
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

module.exports = {
  logActivity,
  getActivities
};
