const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true
  },
  // User who created the booking
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Visitor Category (A/B/C/D)
  visitorCategory: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: [true, 'Visitor category is required']
  },

  // Booking Type
  bookingType: {
    type: String,
    enum: ['self', 'others'],
    required: [true, 'Booking type is required']
  },

  // Multiple Guests Information
  guests: [{
    fullName: {
      type: String,
      required: [true, 'Guest name is required']
    },
    age: {
      type: Number,
      required: [true, 'Guest age is required'],
      min: 0
    },
    mobile: {
      type: String,
      trim: true
    }
  }],

  // Validation Fields for Category-specific Requirements
  employeeId: {
    type: String,
    trim: true
  },
  studentRollNumber: {
    type: String,
    trim: true
  },

  // Document Uploads
  directorApproval: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  guestIdCard: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  studentIdCard: {
    data: Buffer,
    contentType: String,
    fileName: String
  },

  // Indenter Responsibility Acceptance
  indenterAcceptance: {
    type: Boolean,
    required: [true, 'Indenter acceptance is required'],
    validate: {
      validator: function (v) {
        return v === true;
      },
      message: 'You must accept responsibility for the visitor'
    }
  },

  // Room Information
  rooms: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    roomNumber: String,
    roomType: String,
    isSuite: Boolean,
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

  // Detailed Meal Requirements
  mealRequirements: {
    required: {
      type: Boolean,
      default: false
    },
    meals: [{
      date: Date,
      breakfast: { type: Number, default: 0, min: 0 },
      lunch: { type: Number, default: 0, min: 0 },
      dinner: { type: Number, default: 0, min: 0 },
      tea: { type: Number, default: 0, min: 0 },
      milk: { type: Number, default: 0, min: 0 }
    }]
  },

  additionalRequirements: {
    type: String,
    trim: true
  },

  // Booking Status
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

  // Check-in/Check-out
  actualCheckIn: {
    type: Date
  },
  actualCheckOut: {
    type: Date
  },

  // Financial Information
  roomCharges: {
    type: Number,
    default: 0
  },
  mealCharges: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },

  // Cancellation
  cancellationDate: {
    type: Date
  },
  cancellationCharge: {
    type: Number,
    default: 0
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  // Invoice Data
  invoiceGenerated: {
    type: Boolean,
    default: false
  },
  invoiceGeneratedAt: {
    type: Date
  },

  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String
  },
  paymentNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate booking ID before saving (Format: VH-YYYYMM-XXXX)
bookingSchema.pre('save', async function (next) {
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
bookingSchema.methods.calculateNights = function () {
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
