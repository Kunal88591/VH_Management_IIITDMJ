// Add this new route before module.exports

// @route   PUT /api/bookings/:id/payment
// @desc    Update payment status with partial payment support
// @access  Private/Admin
router.put('/:id/payment', protect, authorize('admin'), async (req, res) => {
    try {
        const { amountPaid, paymentMethod, paymentNotes } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!amountPaid || amountPaid <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount paid must be greater than zero'
            });
        }

        // Update amount paid
        booking.amountPaid = (booking.amountPaid || 0) + parseFloat(amountPaid);
        booking.paymentDate = new Date();

        if (paymentMethod) booking.paymentMethod = paymentMethod;
        if (paymentNotes) booking.paymentNotes = paymentNotes;

        // Automatically determine payment status
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

        await booking.save();

        const remainingAmount = Math.max(0, totalAmount - booking.amountPaid);

        res.json({
            success: true,
            message: `Payment updated successfully. Status: ${booking.paymentStatus}`,
            data: {
                booking,
                paymentSummary: {
                    totalAmount,
                    amountPaid: booking.amountPaid,
                    remainingAmount,
                    paymentStatus: booking.paymentStatus
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating payment',
            error: error.message
        });
    }
});
