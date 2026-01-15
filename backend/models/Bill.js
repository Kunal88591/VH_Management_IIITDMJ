const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String
  },
  guestPhone: {
    type: String
  },
  guestAddress: {
    type: String
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfNights: {
    type: Number,
    required: true
  },
  roomCharges: {
    items: [{
      roomNumber: String,
      roomType: String,
      nights: Number,
      pricePerNight: Number,
      total: Number
    }],
    subtotal: {
      type: Number,
      default: 0
    }
  },
  foodCharges: {
    items: [{
      date: Date,
      breakfast: { quantity: Number, rate: Number, total: Number },
      lunch: { quantity: Number, rate: Number, total: Number },
      dinner: { quantity: Number, rate: Number, total: Number },
      dayTotal: Number
    }],
    subtotal: {
      type: Number,
      default: 0
    }
  },
  extras: [{
    description: String,
    quantity: Number,
    rate: Number,
    total: Number
  }],
  extrasSubtotal: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  separateFoodBill: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'],
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate bill number before saving (Format: INV-YYYYMM-XXXX)
billSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // Count bills in current month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);
    
    const count = await mongoose.model('Bill').countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }) + 1;
    
    this.billNumber = `INV-${yearMonth}-${count.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
