const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms with optional filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { roomType, category, minPrice, maxPrice, checkIn, checkOut, available } = req.query;
    
    let query = {};

    if (roomType) query.roomType = roomType;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    let rooms = await Room.find(query).sort({ roomNumber: 1 });

    // If dates provided, check availability
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Get bookings that overlap with requested dates
      const overlappingBookings = await Booking.find({
        status: { $in: ['Approved', 'Checked-In'] },
        $or: [
          { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
        ]
      }).select('rooms');

      // Get room IDs that are booked
      const bookedRoomIds = new Set();
      overlappingBookings.forEach(booking => {
        booking.rooms.forEach(r => bookedRoomIds.add(r.room.toString()));
      });

      // Add availability status to each room
      rooms = rooms.map(room => {
        const roomObj = room.toObject();
        roomObj.isCurrentlyAvailable = !bookedRoomIds.has(room._id.toString()) && 
                                        room.isAvailable && 
                                        !room.isBlocked;
        return roomObj;
      });
    }

    // Filter by availability if requested
    if (available === 'true') {
      rooms = rooms.filter(room => room.isCurrentlyAvailable !== false && room.isAvailable && !room.isBlocked);
    }

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.find({
      'rooms.room': room._id,
      status: { $in: ['Pending', 'Approved', 'Checked-In'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
    }

    await room.deleteOne();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
});

// @route   PUT /api/rooms/:id/block
// @desc    Block/Unblock room
// @access  Private/Admin
router.put('/:id/block', protect, authorize('admin'), async (req, res) => {
  try {
    const { isBlocked, blockReason } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isBlocked, blockReason: isBlocked ? blockReason : '' },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: isBlocked ? 'Room blocked successfully' : 'Room unblocked successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room status',
      error: error.message
    });
  }
});

// @route   GET /api/rooms/availability/check
// @desc    Check room availability for dates
// @access  Public
router.get('/availability/check', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    let query = {
      status: { $in: ['Approved', 'Checked-In'] },
      $or: [
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
      ]
    };

    if (roomId) {
      query['rooms.room'] = roomId;
    }

    const overlappingBookings = await Booking.find(query);

    const bookedRoomIds = new Set();
    overlappingBookings.forEach(booking => {
      booking.rooms.forEach(r => bookedRoomIds.add(r.room.toString()));
    });

    let availableRooms;
    if (roomId) {
      const room = await Room.findById(roomId);
      const isAvailable = !bookedRoomIds.has(roomId) && room.isAvailable && !room.isBlocked;
      availableRooms = isAvailable ? [room] : [];
    } else {
      availableRooms = await Room.find({
        _id: { $nin: Array.from(bookedRoomIds) },
        isAvailable: true,
        isBlocked: false
      });
    }

    res.json({
      success: true,
      count: availableRooms.length,
      data: availableRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
});

module.exports = router;
