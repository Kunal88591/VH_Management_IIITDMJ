import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { HiCheckCircle, HiClock, HiCalendar, HiUser, HiHome } from 'react-icons/hi';
import toast from 'react-hot-toast';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingAPI.getById(id);
      setBooking(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
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
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="font-poppins text-2xl font-bold text-slate-primary mb-2">
            Booking Request Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your booking request has been submitted successfully and is awaiting approval.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-mono font-semibold text-secondary">{booking.bookingId}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Status</span>
              <span className="badge badge-pending flex items-center">
                <HiClock className="w-4 h-4 mr-1" />
                {booking.status}
              </span>
            </div>

            <hr className="my-4" />

            <div className="space-y-3">
              <div className="flex items-start">
                <HiUser className="w-5 h-5 text-secondary mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Guest</p>
                  <p className="font-medium">{booking.guestDetails.fullName}</p>
                </div>
              </div>

              <div className="flex items-start">
                <HiCalendar className="w-5 h-5 text-secondary mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Stay Dates</p>
                  <p className="font-medium">
                    {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <HiHome className="w-5 h-5 text-secondary mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Rooms</p>
                  <p className="font-medium">
                    {booking.rooms.map(r => `Room ${r.roomNumber}`).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estimated Total</span>
              <span className="text-xl font-bold text-secondary">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 text-left">
            <p className="text-slate-primary text-sm">
              <span className="font-semibold text-accent">📌 Important:</span> Check-out is 24 hours from the check-in time. 
              Charges are applicable beyond 24 hours.
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            You will receive an email notification once your booking is approved or rejected.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/my-bookings" className="btn-primary">
              View My Bookings
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
