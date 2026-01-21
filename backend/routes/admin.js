const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/admins
// @desc    Get all admin users
// @access  Private/Admin (vh@iiitdmj.ac.in only)
router.get('/admins', protect, authorize('admin'), async (req, res) => {
  try {
    // Only allow primary admin to manage admins
    if (req.user.email !== 'vh@iiitdmj.ac.in') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only primary admin can manage admins.'
      });
    }

    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
});

// @route   POST /api/admin/admins
// @desc    Create new admin user
// @access  Private/Admin (vh@iiitdmj.ac.in only)
router.post('/admins', protect, authorize('admin'), async (req, res) => {
  try {
    // Only allow primary admin to create admins
    if (req.user.email !== 'vh@iiitdmj.ac.in') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only primary admin can create admins.'
      });
    }

    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin user
// @access  Private/Admin (vh@iiitdmj.ac.in only)
router.delete('/admins/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Only allow primary admin to delete admins
    if (req.user.email !== 'vh@iiitdmj.ac.in') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only primary admin can delete admins.'
      });
    }

    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deleting primary admin
    if (admin.email === 'vh@iiitdmj.ac.in') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete primary admin'
      });
    }

    // Prevent admin from deleting themselves
    if (admin._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing admin',
      error: error.message
    });
  }
});

module.exports = router;
