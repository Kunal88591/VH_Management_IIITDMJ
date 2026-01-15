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

    // Create PDF with A4 size
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.billNumber}.pdf`);

    doc.pipe(res);

    // Helper function to format currency
    const formatCurrency = (amount) => `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Helper function to format date
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    // ========================
    // HEADER SECTION
    // ========================
    doc.fillColor('#1e3a8a'); // Dark blue
    doc.fontSize(24).font('Helvetica-Bold')
      .text('VISITORS\' HOSTEL', 50, 50, { align: 'center' });
    
    doc.fillColor('#3b82f6'); // Blue
    doc.fontSize(11).font('Helvetica')
      .text('Indian Institute of Information Technology, Design and Manufacturing, Jabalpur', 50, 78, { align: 'center' });
    
    doc.fontSize(9)
      .text('Dumna Airport Road, Jabalpur, Madhya Pradesh - 482005', 50, 93, { align: 'center' });
    doc.text('Phone: +91-761-2632470 | Email: visitors@iiitdmj.ac.in', 50, 106, { align: 'center' });
    
    // Horizontal line after header
    doc.strokeColor('#3b82f6').lineWidth(2);
    doc.moveTo(50, 125).lineTo(545, 125).stroke();
    
    // ========================
    // INVOICE TITLE
    // ========================
    doc.fillColor('#000000');
    doc.fontSize(20).font('Helvetica-Bold')
      .text('TAX INVOICE', 50, 140, { align: 'center' });
    
    // ========================
    // INVOICE INFO BOX
    // ========================
    const infoBoxTop = 170;
    
    // Invoice details (Left side)
    doc.fontSize(9).font('Helvetica')
      .fillColor('#6b7280')
      .text('Invoice Number:', 50, infoBoxTop);
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text(bill.billNumber, 50, infoBoxTop + 12);
    
    doc.font('Helvetica')
      .fillColor('#6b7280')
      .text('Invoice Date:', 50, infoBoxTop + 28);
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text(formatDate(bill.createdAt), 50, infoBoxTop + 40);
    
    doc.font('Helvetica')
      .fillColor('#6b7280')
      .text('Booking ID:', 50, infoBoxTop + 56);
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text(bill.booking?.bookingId || 'N/A', 50, infoBoxTop + 68);
    
    // Payment Status (Right side)
    const statusColor = bill.paymentStatus === 'Paid' ? '#10b981' : 
                       bill.paymentStatus === 'Partial' ? '#f59e0b' : '#ef4444';
    
    doc.fontSize(9).font('Helvetica')
      .fillColor('#6b7280')
      .text('Payment Status:', 380, infoBoxTop);
    doc.fontSize(11).font('Helvetica-Bold')
      .fillColor(statusColor)
      .text(bill.paymentStatus.toUpperCase(), 380, infoBoxTop + 12);
    
    if (bill.paymentMethod) {
      doc.fontSize(9).font('Helvetica')
        .fillColor('#6b7280')
        .text('Payment Method:', 380, infoBoxTop + 32);
      doc.font('Helvetica-Bold')
        .fillColor('#000000')
        .text(bill.paymentMethod, 380, infoBoxTop + 44);
    }
    
    // ========================
    // GUEST & STAY DETAILS
    // ========================
    let currentY = infoBoxTop + 100;
    
    // Guest Details Box
    doc.roundedRect(50, currentY, 245, 100, 5).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.fontSize(11).font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text('BILLED TO:', 60, currentY + 10);
    
    doc.fontSize(10).font('Helvetica-Bold')
      .fillColor('#000000')
      .text(bill.guestName, 60, currentY + 28, { width: 225 });
    
    doc.fontSize(9).font('Helvetica')
      .fillColor('#4b5563')
      .text(bill.guestEmail, 60, currentY + 43, { width: 225 });
    doc.text(`Phone: ${bill.guestPhone}`, 60, currentY + 56, { width: 225 });
    
    if (bill.guestAddress) {
      doc.text(bill.guestAddress, 60, currentY + 69, { width: 225, height: 25, ellipsis: true });
    }
    
    // Stay Details Box
    doc.roundedRect(300, currentY, 245, 100, 5).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.fontSize(11).font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text('STAY DETAILS:', 310, currentY + 10);
    
    doc.fontSize(9).font('Helvetica')
      .fillColor('#4b5563')
      .text('Check-in Date:', 310, currentY + 28);
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text(formatDate(bill.checkInDate), 410, currentY + 28);
    
    doc.font('Helvetica')
      .fillColor('#4b5563')
      .text('Check-out Date:', 310, currentY + 45);
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text(formatDate(bill.checkOutDate), 410, currentY + 45);
    
    doc.font('Helvetica')
      .fillColor('#4b5563')
      .text('Number of Nights:', 310, currentY + 62);
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text(bill.numberOfNights.toString(), 410, currentY + 62);
    
    currentY += 120;
    
    // ========================
    // ITEMIZED CHARGES TABLE
    // ========================
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text('ITEMIZED CHARGES', 50, currentY);
    
    currentY += 25;
    
    // Table Header Background
    doc.rect(50, currentY, 495, 25).fillAndStroke('#f3f4f6', '#e5e7eb');
    
    // Table Headers
    doc.fontSize(9).font('Helvetica-Bold')
      .fillColor('#374151')
      .text('DESCRIPTION', 60, currentY + 8)
      .text('QTY', 300, currentY + 8)
      .text('RATE', 360, currentY + 8)
      .text('AMOUNT', 470, currentY + 8, { align: 'right', width: 65 });
    
    currentY += 30;
    
    // Room Charges
    bill.roomCharges.items.forEach((item, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      doc.rect(50, currentY, 495, 22).fillAndStroke(bgColor, '#e5e7eb');
      
      doc.fontSize(9).font('Helvetica')
        .fillColor('#000000')
        .text(`Room ${item.roomNumber} (${item.roomType})`, 60, currentY + 6)
        .text(item.nights.toString(), 300, currentY + 6)
        .text(formatCurrency(item.pricePerNight), 360, currentY + 6)
        .text(formatCurrency(item.total), 470, currentY + 6, { align: 'right', width: 65 });
      
      currentY += 22;
    });
    
    // Food Charges
    if (bill.foodCharges.subtotal > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.rect(50, currentY, 495, 22).fillAndStroke('#ffffff', '#e5e7eb');
      doc.fontSize(9).font('Helvetica')
        .fillColor('#000000')
        .text('Food & Beverage Services', 60, currentY + 6)
        .text('-', 300, currentY + 6)
        .text('-', 360, currentY + 6)
        .text(formatCurrency(bill.foodCharges.subtotal), 470, currentY + 6, { align: 'right', width: 65 });
      
      currentY += 22;
    }
    
    // Extra Charges
    if (bill.extras && bill.extras.length > 0) {
      bill.extras.forEach((item, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
        
        const bgColor = (bill.roomCharges.items.length + (bill.foodCharges.subtotal > 0 ? 1 : 0) + index) % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(50, currentY, 495, 22).fillAndStroke(bgColor, '#e5e7eb');
        
        doc.fontSize(9).font('Helvetica')
          .fillColor('#000000')
          .text(item.description, 60, currentY + 6)
          .text(item.quantity.toString(), 300, currentY + 6)
          .text(formatCurrency(item.rate), 360, currentY + 6)
          .text(formatCurrency(item.total), 470, currentY + 6, { align: 'right', width: 65 });
        
        currentY += 22;
      });
    }
    
    currentY += 10;
    
    // ========================
    // TOTALS SECTION
    // ========================
    const totalsX = 350;
    
    // Subtotal
    doc.fontSize(10).font('Helvetica')
      .fillColor('#4b5563')
      .text('Subtotal:', totalsX, currentY)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(formatCurrency(bill.totalAmount), 470, currentY, { align: 'right', width: 65 });
    
    currentY += 20;
    
    // Tax (if applicable)
    if (bill.tax > 0) {
      doc.font('Helvetica')
        .fillColor('#4b5563')
        .text('GST/Tax:', totalsX, currentY)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(formatCurrency(bill.tax), 470, currentY, { align: 'right', width: 65 });
      
      currentY += 20;
    }
    
    // Grand Total
    doc.rect(totalsX, currentY - 5, 195, 30).fillAndStroke('#1e3a8a', '#1e3a8a');
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('GRAND TOTAL:', totalsX + 10, currentY + 3)
      .fontSize(14)
      .text(formatCurrency(bill.grandTotal), 470, currentY + 3, { align: 'right', width: 65 });
    
    currentY += 50;
    
    // ========================
    // NOTES & TERMS
    // ========================
    if (bill.notes) {
      doc.fontSize(10).font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('Notes:', 50, currentY);
      
      doc.fontSize(9).font('Helvetica')
        .fillColor('#4b5563')
        .text(bill.notes, 50, currentY + 15, { width: 495 });
      
      currentY = doc.y + 20;
    }
    
    // Terms & Conditions
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }
    
    doc.rect(50, currentY, 495, 80).fillAndStroke('#fef3c7', '#fbbf24');
    
    doc.fontSize(10).font('Helvetica-Bold')
      .fillColor('#92400e')
      .text('TERMS & CONDITIONS:', 60, currentY + 10);
    
    doc.fontSize(8).font('Helvetica')
      .fillColor('#78350f')
      .text('1. Check-out time is 24 hours from check-in time. Late check-out charges apply.', 60, currentY + 25, { width: 475 })
      .text('2. Payment must be completed before departure.', 60, currentY + 38, { width: 475 })
      .text('3. Any damages to property will be charged separately.', 60, currentY + 51, { width: 475 })
      .text('4. This is a computer-generated invoice and does not require a signature.', 60, currentY + 64, { width: 475 });
    
    // ========================
    // FOOTER
    // ========================
    const footerY = 750;
    doc.fontSize(8).font('Helvetica')
      .fillColor('#6b7280')
      .text('Thank you for choosing IIITDMJ Visitors\' Hostel', 50, footerY, { align: 'center', width: 495 });
    doc.text('For queries, contact: visitors@iiitdmj.ac.in | +91-761-2632470', 50, footerY + 12, { align: 'center', width: 495 });
    
    // Bottom line
    doc.strokeColor('#3b82f6').lineWidth(2);
    doc.moveTo(50, footerY + 28).lineTo(545, footerY + 28).stroke();

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
