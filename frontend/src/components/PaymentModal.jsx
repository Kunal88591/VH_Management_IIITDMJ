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
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-poppins font-semibold text-lg">Update Payment Status</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Booking Summary */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Booking ID: <span className="font-mono font-semibold">{booking.bookingId}</span></p>
                        <p className="text-sm text-gray-600">Total Amount: <span className="font-bold text-secondary">₹{booking.totalAmount}</span></p>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status *</label>
                        <select
                            value={formData.paymentStatus}
                            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>

                    {/* Amount Paid */}
                    {formData.paymentStatus === 'Paid' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid *</label>
                            <input
                                type="number"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                className="input-field"
                                min="0"
                                step="0.01"
                                required
                                placeholder="Enter amount received"
                            />
                            <p className="text-xs text-gray-500 mt-1">Total bill: ₹{booking.totalAmount}</p>
                        </div>
                    )}

                    {/* Payment Method */}
                    {formData.paymentStatus === 'Paid' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                                    className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.paymentMethod === 'Cash'
                                            ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    💵 Cash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                                    className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.paymentMethod === 'UPI'
                                            ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    📱 UPI
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'Card' })}
                                    className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.paymentMethod === 'Card'
                                            ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    💳 Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'Online' })}
                                    className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.paymentMethod === 'Online'
                                            ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    🌐 Online
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes (Optional)</label>
                        <textarea
                            value={formData.paymentNotes}
                            onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                            className="input-field"
                            rows="3"
                            placeholder="Add any notes about the payment..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading ? 'Updating...' : 'Update Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
