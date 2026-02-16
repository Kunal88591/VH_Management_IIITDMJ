const mongoose = require('mongoose');

const mealOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Person details
  personName: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  numberOfPersons: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },

  // Meal selections (array of daily meals)
  meals: [{
    date: { type: Date, required: true },
    breakfast: { type: Number, default: 0, min: 0 },
    lunch: { type: Number, default: 0, min: 0 },
    dinner: { type: Number, default: 0, min: 0 },
    tea: { type: Number, default: 0, min: 0 },
    milk: { type: Number, default: 0, min: 0 }
  }],

  // Charges
  totalMealCharges: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },

  // Payment
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  amountPaid: {
    type: Number,
    default: 0
  },

  additionalNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate order ID before saving
mealOrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('MealOrder').countDocuments();
    this.orderId = `MO-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MealOrder', mealOrderSchema);
