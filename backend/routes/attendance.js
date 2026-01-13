const express = require('express');
const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private/Admin or Staff (own records)
router.get('/', protect, async (req, res) => {
  try {
    const { staffId, startDate, endDate, status, page = 1, limit = 10 } = req.query;
    
    let query = {};

    // Staff can only see their own attendance
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff profile not found'
        });
      }
      query.staff = staff._id;
    } else if (staffId) {
      query.staff = staffId;
    }

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Attendance.countDocuments(query);
    
    const attendance = await Attendance.find(query)
      .populate('staff', 'name employeeId role')
      .populate('markedBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: attendance.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
});

// @route   POST /api/attendance/check-in
// @desc    Record check-in (biometric simulation)
// @access  Private/Admin or Staff
router.post('/check-in', protect, async (req, res) => {
  try {
    const { staffId, method = 'Manual' } = req.body;
    
    let staff;
    if (req.user.role === 'staff') {
      staff = await Staff.findOne({ user: req.user.id });
    } else {
      staff = await Staff.findById(staffId);
    }

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      staff: staff._id,
      date: today
    });

    if (attendance && attendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        staff: staff._id,
        date: today,
        status: 'Present',
        markedBy: req.user.id
      });
    }

    attendance.checkIn = {
      time: new Date(),
      method
    };

    await attendance.save();
    await attendance.populate('staff', 'name employeeId');

    res.json({
      success: true,
      message: 'Check-in recorded successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording check-in',
      error: error.message
    });
  }
});

// @route   POST /api/attendance/check-out
// @desc    Record check-out
// @access  Private/Admin or Staff
router.post('/check-out', protect, async (req, res) => {
  try {
    const { staffId, method = 'Manual' } = req.body;
    
    let staff;
    if (req.user.role === 'staff') {
      staff = await Staff.findOne({ user: req.user.id });
    } else {
      staff = await Staff.findById(staffId);
    }

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      staff: staff._id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOut = {
      time: new Date(),
      method
    };

    await attendance.save();
    await attendance.populate('staff', 'name employeeId');

    res.json({
      success: true,
      message: 'Check-out recorded successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording check-out',
      error: error.message
    });
  }
});

// @route   POST /api/attendance/mark
// @desc    Manually mark attendance (admin only)
// @access  Private/Admin
router.post('/mark', protect, authorize('admin'), async (req, res) => {
  try {
    const { staffId, date, status, checkInTime, checkOutTime, notes } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      staff: staffId,
      date: attendanceDate
    });

    if (attendance) {
      // Update existing
      attendance.status = status;
      attendance.notes = notes;
      if (checkInTime) {
        attendance.checkIn = { time: new Date(checkInTime), method: 'Manual' };
      }
      if (checkOutTime) {
        attendance.checkOut = { time: new Date(checkOutTime), method: 'Manual' };
      }
      attendance.markedBy = req.user.id;
    } else {
      // Create new
      attendance = new Attendance({
        staff: staffId,
        date: attendanceDate,
        status,
        notes,
        markedBy: req.user.id
      });
      
      if (checkInTime) {
        attendance.checkIn = { time: new Date(checkInTime), method: 'Manual' };
      }
      if (checkOutTime) {
        attendance.checkOut = { time: new Date(checkOutTime), method: 'Manual' };
      }
    }

    await attendance.save();
    await attendance.populate('staff', 'name employeeId');

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
});

// @route   GET /api/attendance/report
// @desc    Get attendance report/summary
// @access  Private/Admin
router.get('/report', protect, authorize('admin'), async (req, res) => {
  try {
    const { staffId, month, year } = req.query;

    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth() + 1, 0);

    let matchQuery = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (staffId) {
      matchQuery.staff = staffId;
    }

    const report = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$staff',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Half-Day'] }, 1, 0] }
          },
          leaveDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
          },
          totalWorkingHours: { $sum: '$workingHours' },
          totalOvertime: { $sum: '$overtime' }
        }
      },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      { $unwind: '$staffInfo' },
      {
        $project: {
          staff: {
            _id: '$staffInfo._id',
            name: '$staffInfo.name',
            employeeId: '$staffInfo.employeeId',
            role: '$staffInfo.role'
          },
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          halfDays: 1,
          leaveDays: 1,
          totalWorkingHours: { $round: ['$totalWorkingHours', 2] },
          totalOvertime: { $round: ['$totalOvertime', 2] },
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 2]
          }
        }
      }
    ]);

    res.json({
      success: true,
      period: { startDate, endDate },
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance overview
// @access  Private/Admin
router.get('/today', protect, authorize('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalStaff = await Staff.countDocuments({ isActive: true });
    
    const todayAttendance = await Attendance.find({ date: today })
      .populate('staff', 'name employeeId role');

    const present = todayAttendance.filter(a => a.status === 'Present').length;
    const absent = totalStaff - present;

    res.json({
      success: true,
      data: {
        date: today,
        totalStaff,
        present,
        absent,
        records: todayAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s attendance',
      error: error.message
    });
  }
});

module.exports = router;
