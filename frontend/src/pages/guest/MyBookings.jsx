import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { HiCalendar, HiEye, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-pending',
      'Approved': 'badge-success',
      'Rejected': 'badge-danger',
      'Checked-In': 'badge-info',
      'Checked-Out': 'badge-secondary',
      'Cancelled': 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="font-poppins text-3xl font-bold text-slate-primary mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600">View and manage your booking requests</p>
          </div>
          <Link to="/book" className="btn-primary mt-4 sm:mt-0">
            New Booking
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'Pending', 'Approved', 'Checked-In', 'Checked-Out', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-secondary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No bookings found</p>
            <Link to="/book" className="btn-primary">
              Make a Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-secondary">{booking.bookingId}</span>
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-slate-primary font-semibold">
                      {booking.rooms?.map(r => `Room ${r.roomNumber}`).join(', ') || 'Rooms assigned'}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                    </p>
                    {booking.rejectionReason && (
                      <p className="text-red-500 text-sm mt-2">
                        Reason: {booking.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <p className="text-lg font-bold text-secondary mr-4">
                      ₹{booking.totalAmount}
                    </p>
                    <Link
                      to={`/my-bookings/${booking._id}`}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <HiEye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    {['Pending', 'Approved'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Cancel Booking"
                      >
                        <HiXCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
