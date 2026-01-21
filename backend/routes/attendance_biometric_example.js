const express = require('express');
const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ... existing routes ...

// @route   POST /api/attendance/biometric-webhook
// @desc    Receive attendance data from biometric device
// @access  Public (but should be secured with API key)
router.post('/biometric-webhook', async (req, res) => {
    try {
        const { employeeId, timestamp, action, deviceId, apiKey } = req.body;

        // TODO: Validate API key (add to environment variables)
        // if (apiKey !== process.env.BIOMETRIC_API_KEY) {
        //   return res.status(401).json({ success: false, message: 'Unauthorized' });
        // }

        // Find staff by employee ID
        const staff = await Staff.findOne({ employeeId });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: `Staff not found with employee ID: ${employeeId}`
            });
        }

        const attendanceDate = new Date(timestamp || new Date());
        const today = new Date(attendanceDate);
        today.setHours(0, 0, 0, 0);

        // Find or create attendance record for today
        let attendance = await Attendance.findOne({
            staff: staff._id,
            date: today
        });

        if (!attendance) {
            attendance = new Attendance({
                staff: staff._id,
                date: today,
                status: 'Present',
                markedBy: null // System generated
            });
        }

        // Handle check-in or check-out based on action
        if (action === 'check-in' || action === 'in') {
            if (attendance.checkIn?.time) {
                return res.status(400).json({
                    success: false,
                    message: 'Already checked in today'
                });
            }

            attendance.checkIn = {
                time: attendanceDate,
                method: 'Biometric'
            };
        } else if (action === 'check-out' || action === 'out') {
            if (!attendance.checkIn?.time) {
                return res.status(400).json({
                    success: false,
                    message: 'No check-in record found'
                });
            }

            if (attendance.checkOut?.time) {
                return res.status(400).json({
                    success: false,
                    message: 'Already checked out today'
                });
            }

            attendance.checkOut = {
                time: attendanceDate,
                method: 'Biometric'
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "check-in" or "check-out"'
            });
        }

        await attendance.save();
        await attendance.populate('staff', 'name employeeId role');

        res.json({
            success: true,
            message: `${action} recorded successfully via biometric`,
            data: attendance
        });
    } catch (error) {
        console.error('Biometric webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing biometric attendance',
            error: error.message
        });
    }
});

// @route   POST /api/attendance/biometric-bulk
// @desc    Import bulk attendance from biometric device (for polling/batch import)
// @access  Private/Admin
router.post('/biometric-bulk', protect, authorize('admin'), async (req, res) => {
    try {
        const { records } = req.body; // Array of {employeeId, timestamp, action}

        if (!Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: 'Records must be an array'
            });
        }

        const results = {
            total: records.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (const record of records) {
            try {
                const { employeeId, timestamp, action } = record;

                const staff = await Staff.findOne({ employeeId });
                if (!staff) {
                    results.failed++;
                    results.errors.push({ employeeId, error: 'Staff not found' });
                    continue;
                }

                const attendanceDate = new Date(timestamp);
                const today = new Date(attendanceDate);
                today.setHours(0, 0, 0, 0);

                let attendance = await Attendance.findOne({
                    staff: staff._id,
                    date: today
                });

                if (!attendance) {
                    attendance = new Attendance({
                        staff: staff._id,
                        date: today,
                        status: 'Present'
                    });
                }

                if (action === 'check-in' && !attendance.checkIn?.time) {
                    attendance.checkIn = { time: attendanceDate, method: 'Biometric' };
                } else if (action === 'check-out' && !attendance.checkOut?.time) {
                    attendance.checkOut = { time: attendanceDate, method: 'Biometric' };
                }

                await attendance.save();
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ record, error: err.message });
            }
        }

        res.json({
            success: true,
            message: 'Bulk import completed',
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error importing bulk attendance',
            error: error.message
        });
    }
});

module.exports = router;
