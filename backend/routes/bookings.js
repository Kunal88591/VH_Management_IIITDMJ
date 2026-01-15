const express = require('express');
const path = require('path');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (admin) or user's bookings (guest)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {};

    // If guest, only show their bookings
    if (req.user.role === 'guest') {
      query.guest = req.user.id;
    }

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.checkInDate = {};
      if (startDate) query.checkInDate.$gte = new Date(startDate);
      if (endDate) query.checkInDate.$lte = new Date(endDate);
    }

    const total = await Booking.countDocuments(query);
    
    const bookings = await Booking.find(query)
      .populate('guest', 'name email phone')
      .populate('rooms.room', 'roomNumber roomType pricePerNight')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone address')
      .populate('rooms.room', 'roomNumber roomType category pricePerNight')
      .populate('approvedBy', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access
    if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', protect, upload.single('approvalDocument'), async (req, res) => {
  try {
    const {
      guestDetails,
      roomIds,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfGuests,
      foodRequirement,
      additionalRequirements
    } = req.body;

    // Parse JSON strings if needed
    const parsedGuestDetails = typeof guestDetails === 'string' ? JSON.parse(guestDetails) : guestDetails;
    const parsedRoomIds = typeof roomIds === 'string' ? JSON.parse(roomIds) : roomIds;
    const parsedFoodRequirement = typeof foodRequirement === 'string' ? JSON.parse(foodRequirement) : foodRequirement;

    // Validate rooms exist and are available
    const rooms = await Room.find({ _id: { $in: parsedRoomIds } });
    
    if (rooms.length !== parsedRoomIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms not found'
      });
    }

    // Check room availability
    const checkInDateObj = new Date(checkInDate);
    const checkOutDateObj = new Date(checkOutDate);

    const overlappingBookings = await Booking.find({
      'rooms.room': { $in: parsedRoomIds },
      status: { $in: ['Approved', 'Checked-In'] },
      $or: [
        { checkInDate: { $lt: checkOutDateObj }, checkOutDate: { $gt: checkInDateObj } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms are not available for the selected dates'
      });
    }

    // Prepare room data
    const roomsData = rooms.map(room => ({
      room: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight
    }));

    // Calculate total amount
    const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24)) || 1;
    const roomTotal = roomsData.reduce((sum, room) => sum + (room.pricePerNight * nights), 0);

    // Prepare approval document for MongoDB storage
    let approvalDocumentData = null;
    if (req.file) {
      approvalDocumentData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname
      };
    }

    // Create booking with document stored in MongoDB
    const booking = await Booking.create({
      guest: req.user.id,
      guestDetails: parsedGuestDetails,
      rooms: roomsData,
      checkInDate: checkInDateObj,
      checkInTime: checkInTime || '12:00',
      checkOutDate: checkOutDateObj,
      checkOutTime: checkOutTime || '12:00',
      numberOfGuests: parseInt(numberOfGuests),
      numberOfRooms: roomsData.length,
      foodRequirement: parsedFoodRequirement,
      additionalRequirements,
      approvalDocument: approvalDocumentData,
      totalAmount: roomTotal,
      status: 'Pending'
    });

    await booking.populate('rooms.room', 'roomNumber roomType pricePerNight');

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. Awaiting approval.',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/approve
// @desc    Approve booking
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve booking with status: ${booking.status}`
      });
    }

    // Check if rooms are still available
    const roomIds = booking.rooms.map(r => r.room);
    const overlappingBookings = await Booking.find({
      _id: { $ne: booking._id },
      'rooms.room': { $in: roomIds },
      status: { $in: ['Approved', 'Checked-In'] },
      $or: [
        { checkInDate: { $lt: booking.checkOutDate }, checkOutDate: { $gt: booking.checkInDate } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Rooms are no longer available for the selected dates'
      });
    }

    booking.status = 'Approved';
    booking.approvedBy = req.user.id;
    booking.approvedAt = new Date();
    await booking.save();

    await booking.populate([
      { path: 'guest', select: 'name email phone' },
      { path: 'rooms.room', select: 'roomNumber roomType' },
      { path: 'approvedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Booking approved successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status: ${booking.status}`
      });
    }

    booking.status = 'Rejected';
    booking.rejectionReason = rejectionReason;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking rejected',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/check-in
// @desc    Check in guest
// @access  Private/Admin
router.put('/:id/check-in', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in booking with status: ${booking.status}`
      });
    }

    booking.status = 'Checked-In';
    booking.actualCheckIn = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/check-out
// @desc    Check out guest
// @access  Private/Admin
router.put('/:id/check-out', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'Checked-In') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-out booking with status: ${booking.status}`
      });
    }

    booking.status = 'Checked-Out';
    booking.actualCheckOut = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Guest checked out successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during check-out',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only guest who made booking or admin can cancel
    if (req.user.role === 'guest' && booking.guest.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (!['Pending', 'Approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/modify-rooms
// @desc    Modify room allocation
// @access  Private/Admin
router.put('/:id/modify-rooms', protect, authorize('admin'), async (req, res) => {
  try {
    const { roomIds } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!['Pending', 'Approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify rooms for booking with status: ${booking.status}`
      });
    }

    // Validate new rooms
    const rooms = await Room.find({ _id: { $in: roomIds } });
    
    if (rooms.length !== roomIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms not found'
      });
    }

    // Check availability
    const overlappingBookings = await Booking.find({
      _id: { $ne: booking._id },
      'rooms.room': { $in: roomIds },
      status: { $in: ['Approved', 'Checked-In'] },
      $or: [
        { checkInDate: { $lt: booking.checkOutDate }, checkOutDate: { $gt: booking.checkInDate } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms are not available for the selected dates'
      });
    }

    // Update rooms
    const roomsData = rooms.map(room => ({
      room: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight
    }));

    // Recalculate total
    const nights = booking.calculateNights();
    const roomTotal = roomsData.reduce((sum, room) => sum + (room.pricePerNight * nights), 0);

    booking.rooms = roomsData;
    booking.numberOfRooms = roomsData.length;
    booking.totalAmount = roomTotal;
    await booking.save();

    await booking.populate('rooms.room', 'roomNumber roomType pricePerNight');

    res.json({
      success: true,
      message: 'Room allocation updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error modifying rooms',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/pending/count
// @desc    Get pending bookings count
// @access  Private/Admin
router.get('/pending/count', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await Booking.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting pending count',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id/download-document
// @desc    Download approval document for a booking
// @access  Private/Admin
router.get('/:id/download-document', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.approvalDocument || !booking.approvalDocument.data) {
      return res.status(404).json({
        success: false,
        message: 'No approval document found for this booking'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', booking.approvalDocument.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${booking.approvalDocument.fileName || 'approval-document'}"`);
    
    // Send the file data
    res.send(booking.approvalDocument.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id/view-document
// @desc    View approval document for a booking (inline)
// @access  Private/Admin
router.get('/:id/view-document', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.approvalDocument || !booking.approvalDocument.data) {
      return res.status(404).json({
        success: false,
        message: 'No approval document found for this booking'
      });
    }

    // Set headers for inline viewing
    res.setHeader('Content-Type', booking.approvalDocument.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${booking.approvalDocument.fileName || 'approval-document'}"`);
    
    // Send the file data
    res.send(booking.approvalDocument.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error viewing document',
      error: error.message
    });
  }
});

module.exports = router;
