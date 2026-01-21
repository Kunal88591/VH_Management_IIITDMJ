const express = require('express');
const path = require('path');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateBookingByCategory, validateRoomAvailability, validateMealRequirements } = require('../utils/bookingValidator');
const { calculateTotalBookingCharges, calculateCancellationCharge } = require('../utils/tariffCalculator');
const { generateInvoicePDF, generateInvoiceData } = require('../utils/invoiceGenerator');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (admin) or user's bookings (guest)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query; // Reduced to 10 for faster loading

    let query = {};

    // If guest, only show their bookings
    if (req.user.role === 'guest') {
      query.bookedBy = req.user.id;
    }

    if (status) query.status = status;

    if (startDate || endDate) {
      query.checkInDate = {};
      if (startDate) query.checkInDate.$gte = new Date(startDate);
      if (endDate) query.checkInDate.$lte = new Date(endDate);
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .select('bookingId visitorCategory status checkInDate checkInTime checkOutDate checkOutTime numberOfGuests numberOfRooms totalAmount paymentStatus guests createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

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
      .populate('bookedBy', 'name email phone address')
      .populate('rooms.room', 'roomNumber roomType category isSuite pricePerNight')
      .populate('approvedBy', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access
    if (req.user.role === 'guest' && booking.bookedBy._id.toString() !== req.user.id) {
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
// @desc    Create new booking with category-based validation
// @access  Private
router.post('/', protect, upload.fields([
  { name: 'directorApproval', maxCount: 1 },
  { name: 'guestIdCard', maxCount: 1 },
  { name: 'studentIdCard', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      visitorCategory,
      bookingType,
      guests,
      employeeId,
      studentRollNumber,
      roomIds,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfGuests,
      mealRequirements,
      additionalRequirements,
      indenterAcceptance
    } = req.body;

    // Parse JSON strings if needed
    const parsedGuests = typeof guests === 'string' ? JSON.parse(guests) : guests;
    const parsedRoomIds = typeof roomIds === 'string' ? JSON.parse(roomIds) : roomIds;
    const parsedMealRequirements = typeof mealRequirements === 'string' ? JSON.parse(mealRequirements) : mealRequirements;

    // Prepare booking data for validation
    const bookingData = {
      visitorCategory,
      bookingType,
      guests: parsedGuests,
      employeeId,
      studentRollNumber,
      indenterAcceptance: indenterAcceptance === 'true' || indenterAcceptance === true
    };

    // Validate based on category
    const validation = validateBookingByCategory(bookingData, req.files || {});
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Validate rooms exist
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

    const availability = await validateRoomAvailability(
      parsedRoomIds,
      checkInDateObj,
      checkOutDateObj,
      null,
      Booking
    );

    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms are not available for the selected dates'
      });
    }

    // Prepare room data with suite flag
    const roomsData = rooms.map(room => {
      const isSuite = room.isSuite || room.roomType === 'Suite' || room.roomType === 'Deluxe';
      console.log(`Room ${room.roomNumber}: type=${room.roomType}, isSuite=${isSuite}`);
      return {
        room: room._id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        isSuite: isSuite,
        pricePerNight: room.pricePerNight
      };
    });

    // Validate and prepare meal requirements
    const validatedMeals = validateMealRequirements(parsedMealRequirements);

    // Calculate charges
    const tempBooking = {
      visitorCategory,
      rooms: roomsData,
      checkInDate: checkInDateObj,
      checkOutDate: checkOutDateObj,
      mealRequirements: validatedMeals
    };

    console.log('Calculating charges for:', {
      category: visitorCategory,
      rooms: roomsData,
      checkIn: checkInDateObj,
      checkOut: checkOutDateObj,
      meals: validatedMeals
    });

    const charges = calculateTotalBookingCharges(tempBooking);

    console.log('Calculated charges:', charges);

    // Prepare document uploads
    const documents = {};

    if (req.files) {
      if (req.files.directorApproval) {
        documents.directorApproval = {
          data: req.files.directorApproval[0].buffer,
          contentType: req.files.directorApproval[0].mimetype,
          fileName: req.files.directorApproval[0].originalname
        };
      }
      if (req.files.guestIdCard) {
        documents.guestIdCard = {
          data: req.files.guestIdCard[0].buffer,
          contentType: req.files.guestIdCard[0].mimetype,
          fileName: req.files.guestIdCard[0].originalname
        };
      }
      if (req.files.studentIdCard) {
        documents.studentIdCard = {
          data: req.files.studentIdCard[0].buffer,
          contentType: req.files.studentIdCard[0].mimetype,
          fileName: req.files.studentIdCard[0].originalname
        };
      }
    }

    // Create booking
    const booking = await Booking.create({
      bookedBy: req.user.id,
      visitorCategory,
      bookingType,
      guests: parsedGuests,
      employeeId: employeeId || undefined,
      studentRollNumber: studentRollNumber || undefined,
      indenterAcceptance: bookingData.indenterAcceptance,
      ...documents,
      rooms: roomsData,
      checkInDate: checkInDateObj,
      checkInTime: checkInTime || '12:00',
      checkOutDate: checkOutDateObj,
      checkOutTime: checkOutTime || '12:00',
      numberOfGuests: parseInt(numberOfGuests),
      numberOfRooms: roomsData.length,
      mealRequirements: validatedMeals,
      additionalRequirements,
      roomCharges: charges.roomCharges,
      mealCharges: charges.mealCharges,
      totalAmount: charges.totalAmount,
      status: 'Pending'
    });

    await booking.populate('rooms.room', 'roomNumber roomType isSuite pricePerNight');

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. Awaiting approval.',
      data: booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
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

    // Re-check room availability
    const roomIds = booking.rooms.map(r => r.room);
    const availability = await validateRoomAvailability(
      roomIds,
      booking.checkInDate,
      booking.checkOutDate,
      booking._id,
      Booking
    );

    if (!availability.available) {
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
      { path: 'bookedBy', select: 'name email phone' },
      { path: 'rooms.room', select: 'roomNumber roomType isSuite' },
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
// @desc    Cancel booking with cancellation charges
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('rooms.room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only guest who made booking or admin can cancel
    if (req.user.role === 'guest' && booking.bookedBy.toString() !== req.user.id) {
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

    // Calculate cancellation charge
    const cancellationDate = new Date();
    const oneDayRoomCharge = booking.roomCharges / Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));
    const cancellationCharge = calculateCancellationCharge(
      booking.checkInDate,
      cancellationDate,
      oneDayRoomCharge
    );

    booking.status = 'Cancelled';
    booking.cancellationDate = cancellationDate;
    booking.cancellationCharge = cancellationCharge;
    await booking.save();

    res.json({
      success: true,
      message: `Booking cancelled successfully. Cancellation charge: ₹${cancellationCharge}`,
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

// @route   GET /api/bookings/:id/invoice
// @desc    Generate and get invoice data
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('bookedBy', 'name email phone')
      .populate('rooms.room', 'roomNumber roomType isSuite')
      .populate('approvedBy', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role === 'guest' && booking.bookedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
      });
    }

    // Only generate invoice for approved or checked-in/out bookings
    if (!['Approved', 'Checked-In', 'Checked-Out'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invoice can only be generated for approved bookings'
      });
    }

    const invoiceData = generateInvoiceData(booking);

    // Mark invoice as generated
    if (!booking.invoiceGenerated) {
      booking.invoiceGenerated = true;
      booking.invoiceGeneratedAt = new Date();
      await booking.save();
    }

    res.json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id/download-document/:docType
// @desc    Download uploaded documents
// @access  Private/Admin
router.get('/:id/download-document/:docType', protect, authorize('admin'), async (req, res) => {
  try {
    const { docType } = req.params;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const validDocTypes = ['directorApproval', 'guestIdCard', 'studentIdCard'];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    const document = booking[docType];

    if (!document || !document.data) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.setHeader('Content-Type', document.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.send(document.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id/view-document/:docType
// @desc    View uploaded documents inline
// @access  Private/Admin
router.get('/:id/view-document/:docType', protect, authorize('admin'), async (req, res) => {
  try {
    const { docType } = req.params;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const validDocTypes = ['directorApproval', 'guestIdCard', 'studentIdCard'];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    const document = booking[docType];

    if (!document || !document.data) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.setHeader('Content-Type', document.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    res.send(document.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error viewing document',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/payment-status
// @desc    Update payment status with partial payment support
// @access  Private/Admin
router.put('/:id/payment-status', protect, authorize('admin'), async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paymentNotes, amountPaid } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If amountPaid is provided, add it to existing amount and auto-detect status
    if (amountPaid && amountPaid > 0) {
      booking.amountPaid = (booking.amountPaid || 0) + parseFloat(amountPaid);

      const totalAmount = booking.totalAmount || 0;

      if (booking.amountPaid >= totalAmount) {
        booking.paymentStatus = 'Paid';
        booking.isPaid = true;
      } else if (booking.amountPaid > 0 && booking.amountPaid < totalAmount) {
        booking.paymentStatus = 'Partially Paid';
        booking.isPaid = false;
      } else {
        booking.paymentStatus = 'Unpaid';
        booking.isPaid = false;
      }

      booking.paymentDate = new Date();
    } else {
      // Manual status update
      booking.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        booking.isPaid = true;
        if (!booking.paymentDate) booking.paymentDate = new Date();
      }
    }

    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }

    if (paymentNotes) {
      booking.paymentNotes = paymentNotes;
    }

    await booking.save();

    const remainingAmount = Math.max(0, (booking.totalAmount || 0) - (booking.amountPaid || 0));

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: booking,
      paymentSummary: {
        totalAmount: booking.totalAmount,
        amountPaid: booking.amountPaid || 0,
        remainingAmount,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

module.exports = router;
