const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Admin who performed the action
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: String,
  adminEmail: String,

  // Activity type
  activityType: {
    type: String,
    enum: [
      'BOOKING_APPROVED',
      'BOOKING_REJECTED',
      'BOOKING_CHECKIN',
      'BOOKING_CHECKOUT',
      'ROOM_CREATED',
      'ROOM_UPDATED',
      'ROOM_BLOCKED',
      'ROOM_UNBLOCKED',
      'STAFF_CREATED',
      'STAFF_UPDATED',
      'STAFF_DELETED',
      'ADMIN_ROLE_TRANSFER'
    ],
    required: true
  },

  // Description of activity
  description: {
    type: String,
    required: true
  },

  // Related entities
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  bookingNumber: String,

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  roomNumber: String,

  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },

  // Changes made (for comparison)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // More details
  details: mongoose.Schema.Types.Mixed,

  ipAddress: String,
  userAgent: String,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activitySchema.index({ admin: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ bookingId: 1 });
activitySchema.index({ roomId: 1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
