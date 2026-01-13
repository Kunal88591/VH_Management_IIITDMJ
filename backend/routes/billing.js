const express = require('express');
const PDFDocument = require('pdfkit');
const Bill = require('../models/Bill');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Pricing constants
const MEAL_RATES = {
  breakfast: 150,
  lunch: 250,
  dinner: 250
};

// @route   GET /api/billing
// @desc    Get all bills
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    let query = {};
    if (status) query.paymentStatus = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Bill.countDocuments(query);
    
    const bills = await Bill.find(query)
      .populate('booking', 'bookingId')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bills.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message
    });
  }
});

// @route   GET /api/billing/:id
// @desc    Get single bill
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('booking')
      .populate('guest', 'name email phone address')
      .populate('generatedBy', 'name');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message
    });
  }
});

// @route   POST /api/billing/generate/:bookingId
// @desc    Generate bill for a booking
// @access  Private/Admin
router.post('/generate/:bookingId', protect, authorize('admin'), async (req, res) => {
  try {
    const { extras = [], separateFoodBill = false, notes } = req.body;

    const booking = await Booking.findById(req.params.bookingId)
      .populate('guest', 'name email phone address')
      .populate('rooms.room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if bill already exists
    const existingBill = await Bill.findOne({ booking: booking._id });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Bill already generated for this booking',
        data: existingBill
      });
    }

    // Calculate nights
    const checkIn = new Date(booking.checkInDate);
    const checkOut = booking.actualCheckOut ? new Date(booking.actualCheckOut) : new Date(booking.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;

    // Room charges
    const roomCharges = {
      items: booking.rooms.map(r => ({
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        nights: nights,
        pricePerNight: r.pricePerNight,
        total: r.pricePerNight * nights
      })),
      subtotal: 0
    };
    roomCharges.subtotal = roomCharges.items.reduce((sum, item) => sum + item.total, 0);

    // Food charges
    const foodCharges = {
      items: [],
      subtotal: 0
    };

    if (booking.foodRequirement?.required && booking.foodRequirement?.meals) {
      booking.foodRequirement.meals.forEach(meal => {
        const dayCharge = {
          date: meal.date,
          breakfast: meal.breakfast ? { quantity: booking.numberOfGuests, rate: MEAL_RATES.breakfast, total: booking.numberOfGuests * MEAL_RATES.breakfast } : null,
          lunch: meal.lunch ? { quantity: booking.numberOfGuests, rate: MEAL_RATES.lunch, total: booking.numberOfGuests * MEAL_RATES.lunch } : null,
          dinner: meal.dinner ? { quantity: booking.numberOfGuests, rate: MEAL_RATES.dinner, total: booking.numberOfGuests * MEAL_RATES.dinner } : null,
          dayTotal: 0
        };
        
        if (dayCharge.breakfast) dayCharge.dayTotal += dayCharge.breakfast.total;
        if (dayCharge.lunch) dayCharge.dayTotal += dayCharge.lunch.total;
        if (dayCharge.dinner) dayCharge.dayTotal += dayCharge.dinner.total;
        
        foodCharges.items.push(dayCharge);
        foodCharges.subtotal += dayCharge.dayTotal;
      });
    }

    // Extras
    const extrasSubtotal = extras.reduce((sum, item) => {
      item.total = item.quantity * item.rate;
      return sum + item.total;
    }, 0);

    // Calculate totals
    const totalAmount = roomCharges.subtotal + foodCharges.subtotal + extrasSubtotal;
    const tax = 0; // Can add GST calculation here
    const grandTotal = totalAmount + tax;

    // Create bill
    const bill = await Bill.create({
      booking: booking._id,
      guest: booking.guest._id,
      guestName: booking.guestDetails.fullName,
      guestEmail: booking.guestDetails.email,
      guestPhone: booking.guestDetails.phone,
      guestAddress: booking.guestDetails.address,
      checkInDate: booking.checkInDate,
      checkOutDate: checkOut,
      numberOfNights: nights,
      roomCharges,
      foodCharges,
      extras,
      extrasSubtotal,
      totalAmount,
      tax,
      grandTotal,
      separateFoodBill,
      generatedBy: req.user.id,
      notes
    });

    // Update booking
    booking.isPaid = false;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating bill',
      error: error.message
    });
  }
});

// @route   PUT /api/billing/:id/payment
// @desc    Update payment status
// @access  Private/Admin
router.put('/:id/payment', protect, authorize('admin'), async (req, res) => {
  try {
    const { paidAmount, paymentMethod, paymentStatus } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    bill.paidAmount = paidAmount || bill.paidAmount;
    bill.paymentMethod = paymentMethod || bill.paymentMethod;
    bill.paymentStatus = paymentStatus || bill.paymentStatus;

    // Auto-determine status based on paid amount
    if (bill.paidAmount >= bill.grandTotal) {
      bill.paymentStatus = 'Paid';
    } else if (bill.paidAmount > 0) {
      bill.paymentStatus = 'Partial';
    }

    await bill.save();

    // Update booking payment status
    if (bill.paymentStatus === 'Paid') {
      await Booking.findByIdAndUpdate(bill.booking, { isPaid: true });
    }

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message
    });
  }
});

// @route   GET /api/billing/:id/pdf
// @desc    Generate PDF invoice
// @access  Private
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('booking');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.billNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('IIITDMJ Visitors\' Hostel', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Indian Institute of Information Technology, Design and Manufacturing, Jabalpur', { align: 'center' });
    doc.text('Dumna Airport Road, Jabalpur, Madhya Pradesh - 482005', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice Number: ${bill.billNumber}`, 50);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 50);
    doc.moveDown();

    // Guest details
    doc.font('Helvetica-Bold').text('Guest Details:');
    doc.font('Helvetica');
    doc.text(`Name: ${bill.guestName}`);
    doc.text(`Email: ${bill.guestEmail}`);
    doc.text(`Phone: ${bill.guestPhone}`);
    doc.text(`Address: ${bill.guestAddress}`);
    doc.moveDown();

    // Stay details
    doc.font('Helvetica-Bold').text('Stay Details:');
    doc.font('Helvetica');
    doc.text(`Check-in: ${new Date(bill.checkInDate).toLocaleDateString()}`);
    doc.text(`Check-out: ${new Date(bill.checkOutDate).toLocaleDateString()}`);
    doc.text(`Number of Nights: ${bill.numberOfNights}`);
    doc.moveDown();

    // Room charges table
    doc.font('Helvetica-Bold').text('Room Charges:');
    doc.moveDown(0.5);
    
    // Table header
    const roomTableTop = doc.y;
    doc.fontSize(9);
    doc.text('Room', 50, roomTableTop);
    doc.text('Type', 150, roomTableTop);
    doc.text('Nights', 250, roomTableTop);
    doc.text('Rate/Night', 320, roomTableTop);
    doc.text('Total', 420, roomTableTop);
    
    doc.moveTo(50, doc.y + 5).lineTo(500, doc.y + 5).stroke();
    doc.moveDown();

    doc.font('Helvetica');
    bill.roomCharges.items.forEach(item => {
      const y = doc.y;
      doc.text(item.roomNumber, 50, y);
      doc.text(item.roomType, 150, y);
      doc.text(item.nights.toString(), 250, y);
      doc.text(`₹${item.pricePerNight}`, 320, y);
      doc.text(`₹${item.total}`, 420, y);
      doc.moveDown();
    });

    doc.font('Helvetica-Bold').text(`Room Subtotal: ₹${bill.roomCharges.subtotal}`, 320);
    doc.moveDown();

    // Food charges
    if (bill.foodCharges.subtotal > 0) {
      doc.font('Helvetica-Bold').text('Food Charges:');
      doc.font('Helvetica').text(`Subtotal: ₹${bill.foodCharges.subtotal}`);
      doc.moveDown();
    }

    // Extras
    if (bill.extrasSubtotal > 0) {
      doc.font('Helvetica-Bold').text('Additional Charges:');
      bill.extras.forEach(item => {
        doc.font('Helvetica').text(`${item.description}: ₹${item.total}`);
      });
      doc.font('Helvetica-Bold').text(`Extras Subtotal: ₹${bill.extrasSubtotal}`);
      doc.moveDown();
    }

    // Total
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12);
    doc.font('Helvetica-Bold').text(`Total Amount: ₹${bill.totalAmount}`, 320);
    if (bill.tax > 0) {
      doc.text(`Tax: ₹${bill.tax}`, 320);
    }
    doc.fontSize(14).text(`Grand Total: ₹${bill.grandTotal}`, 320);
    doc.moveDown();

    // Payment status
    doc.fontSize(10).font('Helvetica');
    doc.text(`Payment Status: ${bill.paymentStatus}`);
    if (bill.paymentMethod) {
      doc.text(`Payment Method: ${bill.paymentMethod}`);
    }
    doc.moveDown();

    // Important notice
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(8).font('Helvetica-Bold').fillColor('red')
      .text('IMPORTANT: Check-out is 24 hours from the check-in time. Charges are applicable beyond 24 hours.', { align: 'center' });
    
    doc.moveDown();
    doc.fillColor('black').font('Helvetica')
      .text('Thank you for staying at IIITDMJ Visitors\' Hostel!', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
});

// @route   GET /api/billing/booking/:bookingId
// @desc    Get bill by booking ID
// @access  Private
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const bill = await Bill.findOne({ booking: req.params.bookingId })
      .populate('booking')
      .populate('guest', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found for this booking'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message
    });
  }
});

module.exports = router;
