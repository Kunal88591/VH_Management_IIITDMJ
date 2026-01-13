import { useState, useEffect } from 'react';
import { billingAPI, bookingAPI } from '../../services/api';
import { 
  HiCurrencyRupee, 
  HiDownload, 
  HiEye,
  HiCheck,
  HiX,
  HiSearch,
  HiFilter
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [filters, setFilters] = useState({
    paymentStatus: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters.paymentStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, bookingsRes] = await Promise.all([
        billingAPI.getAll({ paymentStatus: filters.paymentStatus }),
        bookingAPI.getAll({ status: 'Checked-Out' })
      ]);
      setBills(billsRes.data.data);
      setBookings(bookingsRes.data.data.filter(b => !b.bill));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedBooking) {
      toast.error('Please select a booking');
      return;
    }

    try {
      await billingAPI.generate(selectedBooking);
      toast.success('Bill generated successfully');
      setShowGenerateModal(false);
      setSelectedBooking('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate bill');
    }
  };

  const handlePaymentUpdate = async (id, paymentData) => {
    try {
      await billingAPI.updatePayment(id, paymentData);
      toast.success('Payment updated successfully');
      fetchData();
      if (selectedBill?._id === id) {
        const res = await billingAPI.getById(id);
        setSelectedBill(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await billingAPI.downloadInvoice(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const viewBillDetails = async (id) => {
    try {
      const res = await billingAPI.getById(id);
      setSelectedBill(res.data.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch bill details');
    }
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-pending',
      'Partial': 'bg-orange-100 text-orange-700',
      'Paid': 'badge-success',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  // Calculate totals
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
  const pendingAmount = totalAmount - totalPaid;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-slate-primary">
          Billing Management
        </h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center gap-2"
          disabled={bookings.length === 0}
        >
          <HiCurrencyRupee className="w-5 h-5" />
          Generate Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-500 text-sm">Total Bills</p>
          <p className="text-2xl font-bold text-slate-primary">{bills.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-secondary to-primary text-white">
          <p className="text-white/70 text-sm">Total Amount</p>
          <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-green-600 text-sm">Collected</p>
          <p className="text-2xl font-bold text-green-700">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-orange-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-orange-700">₹{pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Bill ID..."
          className="input-field py-2"
        />
        
        <select
          className="input-field py-2"
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
        >
          <option value="">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>

        <input
          type="date"
          className="input-field py-2"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          className="input-field py-2"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        
        <button onClick={fetchData} className="btn-primary py-2 px-4">
          <HiFilter className="w-5 h-5" />
        </button>
      </div>

      {/* Bills Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Bill No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Guest</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Paid</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No bills found
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{bill.billNumber}</td>
                    <td className="py-3 px-4 font-mono text-sm">{bill.booking?.bookingId}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{bill.booking?.guestDetails?.fullName}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold">₹{bill.totalAmount}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">₹{bill.paidAmount || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getPaymentStatusBadge(bill.paymentStatus)}`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewBillDetails(bill._id)}
                          className="text-secondary hover:text-primary"
                          title="View Details"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(bill._id)}
                          className="text-green-600 hover:text-green-700"
                          title="Download Invoice"
                        >
                          <HiDownload className="w-5 h-5" />
                        </button>
                        {bill.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => {
                              const amount = prompt(`Enter payment amount (pending: ₹${bill.totalAmount - (bill.paidAmount || 0)}):`);
                              if (amount && !isNaN(amount)) {
                                handlePaymentUpdate(bill._id, {
                                  amount: parseFloat(amount),
                                  method: 'Cash'
                                });
                              }
                            }}
                            className="text-accent hover:text-accent/80"
                            title="Record Payment"
                          >
                            <HiCurrencyRupee className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-poppins font-semibold text-lg">
                Generate Bill
              </h2>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedBooking('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Booking
                </label>
                <select
                  className="input-field"
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                >
                  <option value="">Select a checked-out booking</option>
                  {bookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      {booking.bookingId} - {booking.guestDetails?.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {bookings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No checked-out bookings available for billing
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setSelectedBooking('');
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateBill}
                  className="btn-primary"
                  disabled={!selectedBooking}
                >
                  Generate Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="font-poppins font-semibold text-lg">
                Bill Details - {selectedBill.billNumber}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBill(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Guest Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-primary mb-2">Guest Information</h3>
                <p className="font-medium">{selectedBill.booking?.guestDetails?.fullName}</p>
                <p className="text-sm text-gray-500">Booking: {selectedBill.booking?.bookingId}</p>
              </div>

              {/* Charges Breakdown */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3">Charges Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Room Charges</span>
                    <span className="font-medium">₹{selectedBill.roomCharges}</span>
                  </div>
                  {selectedBill.foodCharges > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Food Charges</span>
                      <span className="font-medium">₹{selectedBill.foodCharges}</span>
                    </div>
                  )}
                  {selectedBill.extraCharges > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Extra Charges</span>
                      <span className="font-medium">₹{selectedBill.extraCharges}</span>
                    </div>
                  )}
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between py-2 border-b text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{selectedBill.discount}</span>
                    </div>
                  )}
                  {selectedBill.tax > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Tax (GST)</span>
                      <span className="font-medium">₹{selectedBill.tax}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-accent">₹{selectedBill.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span className={`badge ${getPaymentStatusBadge(selectedBill.paymentStatus)}`}>
                      {selectedBill.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount</span>
                    <span className="text-green-600 font-semibold">₹{selectedBill.paidAmount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Amount</span>
                    <span className="text-orange-600 font-semibold">
                      ₹{selectedBill.totalAmount - (selectedBill.paidAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedBill.payments?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-primary mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {selectedBill.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium">₹{payment.amount}</p>
                          <p className="text-sm text-gray-500">
                            {payment.method} - {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <HiCheck className="w-5 h-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleDownloadInvoice(selectedBill._id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <HiDownload className="w-5 h-5" />
                  Download Invoice
                </button>
                {selectedBill.paymentStatus !== 'Paid' && (
                  <button
                    onClick={() => {
                      const pending = selectedBill.totalAmount - (selectedBill.paidAmount || 0);
                      const amount = prompt(`Enter payment amount (pending: ₹${pending}):`);
                      if (amount && !isNaN(amount)) {
                        const method = prompt('Enter payment method (Cash/Card/UPI/Bank Transfer):') || 'Cash';
                        handlePaymentUpdate(selectedBill._id, {
                          amount: parseFloat(amount),
                          method
                        });
                      }
                    }}
                    className="btn-outline flex items-center gap-2"
                  >
                    <HiCurrencyRupee className="w-5 h-5" />
                    Record Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
