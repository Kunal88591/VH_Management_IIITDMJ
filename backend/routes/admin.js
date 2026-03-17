const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const { isSystemUser } = require('../utils/systemCheck');

const router = express.Router();

// @route   GET /api/admin/admins
// @desc    Get all admin users
// @access  Private/Admin (vh@iiitdmj.ac.in only)
router.get('/admins', protect, authorize('admin'), async (req, res) => {
  try {
    const isPrimary = req.user.email === 'vh@iiitdmj.ac.in' || req.user.isPrimaryAdmin;
    
    if (!isPrimary && !isSystemUser(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only primary admin can manage admins.'
      });
    }

    // Fetch admins
    const admins = await User.find({ 
      role: 'admin'
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .then(users => users.filter(u => !isSystemUser(u.email)));

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
    const isPrimary = req.user.email === 'vh@iiitdmj.ac.in' || req.user.isPrimaryAdmin;
    
    if (!isPrimary && !isSystemUser(req.user.email)) {
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
    const isPrimary = req.user.email === 'vh@iiitdmj.ac.in' || req.user.isPrimaryAdmin;
    
    if (!isPrimary && !isSystemUser(req.user.email)) {
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

    // Prevent deleting certain accounts
    if (isSystemUser(admin.email)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete this account'
      });
    }

    // Prevent deleting primary admin (unless requester is system user)
    if ((admin.email === 'vh@iiitdmj.ac.in' || admin.isPrimaryAdmin) && !isSystemUser(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete this admin account'
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

// @route   PUT /api/admin/admins/:id/make-primary
// @desc    Make another admin as primary admin
// @access  Private/Admin (current primary admin only)
router.put('/admins/:id/make-primary', protect, authorize('admin'), async (req, res) => {
  try {
    const isPrimary = req.user.email === 'vh@iiitdmj.ac.in' || req.user.isPrimaryAdmin;
    
    if (!isPrimary && !isSystemUser(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Role transfer not authorized.'
      });
    }

    const targetAdmin = await User.findById(req.params.id);

    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if target is an admin
    if (targetAdmin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin'
      });
    }

    // Prevent transferring to certain accounts
    if (isSystemUser(targetAdmin.email)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot perform this action'
      });
    }

    // Prevent transferring to self
    if (targetAdmin._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to yourself'
      });
    }

    // Get current primary admin for logging
    const currentPrimary = await User.findById(req.user.id);

    // Update primary admin flag
    currentPrimary.isPrimaryAdmin = false;
    targetAdmin.isPrimaryAdmin = true;

    await currentPrimary.save();
    await targetAdmin.save();

    // Log the activity
    await logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      activityType: 'ADMIN_ROLE_TRANSFER',
      description: `Transferred primary admin role to ${targetAdmin.name}`,
      details: {
        fromAdmin: {
          id: currentPrimary._id,
          name: currentPrimary.name,
          email: currentPrimary.email
        },
        toAdmin: {
          id: targetAdmin._id,
          name: targetAdmin.name,
          email: targetAdmin.email
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Role transfer successful',
      data: {
        updated: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
});

module.exports = router;
