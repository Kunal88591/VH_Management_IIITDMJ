import { useState } from 'react';
import { HiX } from 'react-icons/hi';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentModal = ({ booking, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        paymentStatus: booking.paymentStatus || 'Unpaid',
        amountPaid: booking.totalAmount || 0,
        paymentMethod: booking.paymentMethod || 'Cash',
        paymentNotes: booking.paymentNotes || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation: Prevent overpayment
            const remainingAmount = (booking.totalAmount || 0) - (booking.amountPaid || 0);
            const paymentAmount = parseFloat(formData.amountPaid);

            if (paymentAmount > remainingAmount) {
                toast.error(`Payment amount (₹${paymentAmount.toLocaleString()}) cannot exceed remaining balance (₹${remainingAmount.toLocaleString()})`);
                setLoading(false);
                return;
            }

            if (paymentAmount <= 0) {
                toast.error('Payment amount must be greater than zero');
                setLoading(false);
                return;
            }

            await bookingAPI.updatePaymentStatus(booking._id, formData);
            toast.success('Payment status updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to update payment status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <h2 className="font-poppins font-semibold text-lg">Update Payment Status</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Payment Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <p className="text-sm text-gray-600">Booking ID: <span className="font-mono font-semibold">{booking.bookingId}</span></p>
                        <div className="flex justify-between text-sm border-t pt-2">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-semibold">₹{booking.totalAmount?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Already Paid:</span>
                            <span className="font-semibold text-green-600">₹{(booking.amountPaid || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2">
                            <span className="font-semibold">Remaining:</span>
                            <span className="font-bold text-lg text-primary">₹{((booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Amount to Pay */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paying Now *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                className="input-field pl-8"
                                min="1"
                                max={(booking.totalAmount || 0) - (booking.amountPaid || 0)}
                                step="0.01"
                                required
                                placeholder="Enter amount"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Maximum: ₹{((booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString()}</p>
                    </div>



                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="">Select payment method</option>
                            <option value="Cash">💵 Cash</option>
                            <option value="UPI">📱 UPI</option>
                            <option value="Card">💳 Card</option>
                            <option value="Online">🌐 Online</option>
                            <option value="Cheque">📝 Cheque</option>
                        </select>
                    </div>

                    {/* Payment Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes (Optional)</label>
                        <textarea
                            value={formData.paymentNotes}
                            onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                            className="input-field"
                            rows="2"
                            placeholder="Add any notes about the payment..."
                        />
                    </div>
                </form>

                {/* Actions - Sticky Footer */}
                <div className="flex gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary flex-1"
                    >
                        {loading ? 'Updating...' : 'Update Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
