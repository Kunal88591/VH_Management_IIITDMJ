const express = require('express');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/staff
// @desc    Get all staff members
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, shift, isActive, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (shift) query.shift = shift;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Staff.countDocuments(query);
    
    const staff = await Staff.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: staff.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
});

// @route   GET /api/staff/:id
// @desc    Get single staff member
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('user', 'email');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff member',
      error: error.message
    });
  }
});

// @route   POST /api/staff
// @desc    Add new staff member
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      shift,
      shiftTimings,
      salary,
      address,
      emergencyContact,
      biometricId,
      createUserAccount = false,
      password
    } = req.body;

    // Create user account if requested
    let userId = null;
    if (createUserAccount && email && password) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'staff'
      });
      userId = user._id;
    }

    const staff = await Staff.create({
      user: userId,
      name,
      email,
      phone,
      role,
      shift,
      shiftTimings,
      salary,
      address,
      emergencyContact,
      biometricId
    });

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding staff member',
      error: error.message
    });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff member',
      error: error.message
    });
  }
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff member
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Deactivate associated user account if exists
    if (staff.user) {
      await User.findByIdAndUpdate(staff.user, { isActive: false });
    }

    await staff.deleteOne();

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member',
      error: error.message
    });
  }
});

// @route   PUT /api/staff/:id/toggle-status
// @desc    Activate/Deactivate staff member
// @access  Private/Admin
router.put('/:id/toggle-status', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    // Also toggle user account if exists
    if (staff.user) {
      await User.findByIdAndUpdate(staff.user, { isActive: staff.isActive });
    }

    res.json({
      success: true,
      message: staff.isActive ? 'Staff member activated' : 'Staff member deactivated',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff status',
      error: error.message
    });
  }
});

// @route   GET /api/staff/roles/list
// @desc    Get staff role options
// @access  Private/Admin
router.get('/roles/list', protect, authorize('admin'), async (req, res) => {
  try {
    const roles = ['Reception', 'Housekeeping', 'Security', 'Maintenance', 'Kitchen', 'Manager'];
    const shifts = ['Morning', 'Evening', 'Night'];

    res.json({
      success: true,
      data: { roles, shifts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching role options',
      error: error.message
    });
  }
});

module.exports = router;
