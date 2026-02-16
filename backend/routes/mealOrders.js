const express = require('express');
const router = express.Router();
const MealOrder = require('../models/MealOrder');
const { protect, authorize } = require('../middleware/auth');
const { calculateMealCharges, MEAL_TARIFF } = require('../utils/tariffCalculator');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const path = require('path');
const fs = require('fs');

// GET all meal orders (admin sees all, guest sees own)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.orderedBy = req.user._id;
    }

    const { status, page = 1, limit = 20 } = req.query;
    if (status) query.status = status;

    const orders = await MealOrder.find(query)
      .populate('orderedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MealOrder.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single meal order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await MealOrder.findById(req.params.id)
      .populate('orderedBy', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Meal order not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && order.orderedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create meal order
router.post('/', protect, async (req, res) => {
  try {
    const { personName, mobile, numberOfPersons, meals, startDate, numberOfDays, additionalNotes } = req.body;

    if (!personName || !mobile || !meals || !meals.length) {
      return res.status(400).json({ success: false, message: 'Name, mobile, and meal selections are required' });
    }

    // Calculate meal charges
    const totalMealCharges = calculateMealCharges(meals);

    const mealOrder = new MealOrder({
      orderedBy: req.user._id,
      personName,
      mobile,
      numberOfPersons: numberOfPersons || 1,
      meals,
      totalMealCharges,
      additionalNotes
    });

    await mealOrder.save();

    res.status(201).json({
      success: true,
      message: 'Meal order submitted successfully',
      data: mealOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT approve meal order (admin)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await MealOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve order with status: ${order.status}` });
    }

    order.status = 'Approved';
    await order.save();
    res.json({ success: true, message: 'Meal order approved', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT reject meal order (admin)
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await MealOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot reject order with status: ${order.status}` });
    }

    order.status = 'Rejected';
    await order.save();
    res.json({ success: true, message: 'Meal order rejected', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT complete meal order (admin)
router.put('/:id/complete', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await MealOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Approved') {
      return res.status(400).json({ success: false, message: `Cannot complete order with status: ${order.status}` });
    }

    order.status = 'Completed';
    await order.save();
    res.json({ success: true, message: 'Meal order completed', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT cancel meal order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await MealOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role !== 'admin' && order.orderedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['Completed', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.status}` });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json({ success: true, message: 'Meal order cancelled', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update payment status (admin)
router.put('/:id/payment', protect, authorize('admin'), async (req, res) => {
  try {
    const { paymentStatus, amountPaid } = req.body;
    const order = await MealOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (amountPaid !== undefined) order.amountPaid = amountPaid;

    await order.save();
    res.json({ success: true, message: 'Payment updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET invoice PDF for a meal order
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await MealOrder.findById(req.params.id).populate('orderedBy', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only owner or admin
    if (req.user.role !== 'admin' && order.orderedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Build a booking-like object for invoice generator
    const invoiceObj = {
      bookingId: order.orderId,
      visitorCategory: 'Meal Order',
      guests: [{ fullName: order.personName }],
      checkInDate: order.meals && order.meals.length ? order.meals[0].date : new Date(),
      checkInTime: '',
      checkOutDate: order.meals && order.meals.length ? order.meals[order.meals.length - 1].date : new Date(),
      checkOutTime: '',
      numberOfGuests: order.numberOfPersons,
      numberOfRooms: 0,
      rooms: [],
      roomCharges: 0,
      mealRequirements: { required: true },
      mealCharges: order.totalMealCharges || 0,
      totalAmount: order.totalMealCharges || 0
    };

    const outDir = path.join(__dirname, '..', 'uploads', 'invoices');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${order.orderId}.pdf`);

    await generateInvoicePDF(invoiceObj, outPath);

    res.download(outPath, `${order.orderId}.pdf`, (err) => {
      // cleanup
      try { fs.unlinkSync(outPath); } catch (e) {}
      if (err) {
        console.error('Invoice download error:', err);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
