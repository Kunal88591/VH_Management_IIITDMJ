const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    method: {
      type: String,
      enum: ['Biometric', 'Manual', 'System'],
      default: 'Manual'
    }
  },
  checkOut: {
    time: Date,
    method: {
      type: String,
      enum: ['Biometric', 'Manual', 'System'],
      default: 'Manual'
    }
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday'],
    default: 'Present'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per staff per day
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

// Calculate working hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const diffMs = this.checkOut.time - this.checkIn.time;
    this.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    
    // Calculate overtime (if more than 8 hours)
    if (this.workingHours > 8) {
      this.overtime = Math.round((this.workingHours - 8) * 100) / 100;
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
