const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Suite', 'Deluxe'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['AC', 'Non-AC'],
    default: 'AC'
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0
  },
  maxOccupancy: {
    type: Number,
    required: [true, 'Maximum occupancy is required'],
    min: 1,
    max: 10
  },
  amenities: [{
    type: String
  }],
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    trim: true
  },
  floor: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Virtual for display name
roomSchema.virtual('displayName').get(function() {
  return `Room ${this.roomNumber} - ${this.roomType} (${this.category})`;
});

// Index for faster queries
roomSchema.index({ roomType: 1, category: 1, isAvailable: 1 });

module.exports = mongoose.model('Room', roomSchema);
