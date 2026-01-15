const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestDetails: {
    fullName: {
      type: String,
      required: [true, 'Full name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  rooms: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    roomNumber: String,
    roomType: String,
    pricePerNight: Number
  }],
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkInTime: {
    type: String,
    default: '12:00'
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  checkOutTime: {
    type: String,
    default: '12:00'
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: 1
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1
  },
  foodRequirement: {
    required: {
      type: Boolean,
      default: false
    },
    numberOfDays: {
      type: Number,
      default: 0
    },
    meals: [{
      date: Date,
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false }
    }]
  },
  additionalRequirements: {
    type: String,
    trim: true
  },
  approvalDocument: {
    data: Buffer,        // File binary data
    contentType: String, // MIME type (e.g., 'application/pdf', 'image/jpeg')
    fileName: String     // Original file name
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Checked-In', 'Checked-Out', 'Cancelled'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  actualCheckIn: {
    type: Date
  },
  actualCheckOut: {
    type: Date
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate booking ID before saving (Format: VH-YYYYMM-XXXX)
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // Count bookings in current month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);
    
    const count = await mongoose.model('Booking').countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }) + 1;
    
    this.bookingId = `VH-${yearMonth}-${count.toString().padStart(4, '0')}`;
  }
  next();
});

// Calculate number of nights
bookingSchema.methods.calculateNights = function() {
  const checkIn = new Date(this.checkInDate);
  const checkOut = new Date(this.checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};

// Index for queries
bookingSchema.index({ status: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ guest: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
