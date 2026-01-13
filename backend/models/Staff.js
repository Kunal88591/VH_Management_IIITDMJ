const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['Reception', 'Housekeeping', 'Security', 'Maintenance', 'Kitchen', 'Manager'],
    required: [true, 'Staff role is required']
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    default: 'Morning'
  },
  shiftTimings: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  salary: {
    type: Number,
    default: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  documents: [{
    type: String,
    description: String
  }],
  biometricId: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate employee ID before saving
staffSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments() + 1;
    this.employeeId = `EMP${count.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
