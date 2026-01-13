import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI, billingAPI } from '../../services/api';
import { HiArrowLeft, HiDownload, HiCalendar, HiUser, HiHome, HiCurrencyRupee } from 'react-icons/hi';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const bookingRes = await bookingAPI.getById(id);
      setBooking(bookingRes.data.data);
      
      // Try to fetch bill if exists
      try {
        const billRes = await billingAPI.getByBooking(id);
        setBill(billRes.data.data);
      } catch {
        // Bill may not exist yet
      }
    } catch (error) {
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!bill) return;
    try {
      const response = await billingAPI.getPDF(bill._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bill.billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-pending',
      'Approved': 'badge-success',
      'Rejected': 'badge-danger',
      'Checked-In': 'badge-info',
      'Checked-Out': 'bg-gray-100 text-gray-700',
      'Cancelled': 'badge-danger',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Booking not found</p>
        <Link to="/my-bookings" className="btn-primary">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/my-bookings" className="inline-flex items-center text-secondary hover:text-primary mb-6">
          <HiArrowLeft className="w-5 h-5 mr-1" />
          Back to Bookings
        </Link>

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <span className="text-sm text-gray-500">Booking ID</span>
              <h1 className="font-poppins text-2xl font-bold text-slate-primary">
                {booking.bookingId}
              </h1>
            </div>
            <span className={`badge ${getStatusBadge(booking.status)} text-sm mt-2 md:mt-0`}>
              {booking.status}
            </span>
          </div>

          {booking.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">
                <strong>Rejection Reason:</strong> {booking.rejectionReason}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Guest Details */}
            <div>
              <h3 className="font-semibold text-slate-primary mb-3 flex items-center">
                <HiUser className="w-5 h-5 mr-2 text-secondary" />
                Guest Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="text-gray-500">Name:</span> {booking.guestDetails?.fullName}</p>
                <p><span className="text-gray-500">Email:</span> {booking.guestDetails?.email}</p>
                <p><span className="text-gray-500">Phone:</span> {booking.guestDetails?.phone}</p>
                <p><span className="text-gray-500">Address:</span> {booking.guestDetails?.address}</p>
                <p><span className="text-gray-500">Guests:</span> {booking.numberOfGuests}</p>
              </div>
            </div>

            {/* Stay Details */}
            <div>
              <h3 className="font-semibold text-slate-primary mb-3 flex items-center">
                <HiCalendar className="w-5 h-5 mr-2 text-secondary" />
                Stay Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p>
                  <span className="text-gray-500">Check-in:</span>{' '}
                  {new Date(booking.checkInDate).toLocaleDateString()} at {booking.checkInTime}
                </p>
                <p>
                  <span className="text-gray-500">Check-out:</span>{' '}
                  {new Date(booking.checkOutDate).toLocaleDateString()} at {booking.checkOutTime}
                </p>
                {booking.actualCheckIn && (
                  <p>
                    <span className="text-gray-500">Actual Check-in:</span>{' '}
                    {new Date(booking.actualCheckIn).toLocaleString()}
                  </p>
                )}
                {booking.actualCheckOut && (
                  <p>
                    <span className="text-gray-500">Actual Check-out:</span>{' '}
                    {new Date(booking.actualCheckOut).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Room Details */}
            <div>
              <h3 className="font-semibold text-slate-primary mb-3 flex items-center">
                <HiHome className="w-5 h-5 mr-2 text-secondary" />
                Room Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {booking.rooms?.map((room, index) => (
                  <div key={index} className="flex justify-between">
                    <span>Room {room.roomNumber} ({room.roomType})</span>
                    <span className="font-semibold">₹{room.pricePerNight}/night</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Details */}
            <div>
              <h3 className="font-semibold text-slate-primary mb-3">Food Requirements</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {booking.foodRequirement?.required ? (
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Days:</span> {booking.foodRequirement.numberOfDays}</p>
                    {booking.foodRequirement.meals?.map((meal, index) => (
                      <p key={index} className="text-sm">
                        Day {index + 1}:{' '}
                        {[
                          meal.breakfast && 'Breakfast',
                          meal.lunch && 'Lunch',
                          meal.dinner && 'Dinner'
                        ].filter(Boolean).join(', ') || 'None'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No food required</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Requirements */}
          {booking.additionalRequirements && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-primary mb-3">Additional Requirements</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">{booking.additionalRequirements}</p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Total</span>
              <span className="text-2xl font-bold text-secondary">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Bill Section */}
        {bill && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-primary flex items-center">
                <HiCurrencyRupee className="w-5 h-5 mr-2 text-secondary" />
                Invoice
              </h3>
              <button
                onClick={downloadInvoice}
                className="btn-secondary text-sm flex items-center"
              >
                <HiDownload className="w-4 h-4 mr-1" />
                Download PDF
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Invoice Number</span>
                <span className="font-mono">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Grand Total</span>
                <span className="font-bold text-secondary">₹{bill.grandTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <span className={`badge ${bill.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                  {bill.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-6 bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-slate-primary text-sm">
            <span className="font-semibold text-accent">📌 Important:</span> Check-out is 24 hours from the check-in time. 
            Charges are applicable beyond 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
