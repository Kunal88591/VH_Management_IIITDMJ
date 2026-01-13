import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { 
  HiSearch, 
  HiFilter, 
  HiEye, 
  HiCheckCircle, 
  HiXCircle,
  HiLogin,
  HiLogout,
  HiDownload,
  HiX
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (bookingId) {
      fetchBookingDetails(bookingId);
    }
    fetchBookings();
  }, [pagination.page, filters.status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.data);
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      }));
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (id) => {
    try {
      const res = await bookingAPI.getById(id);
      setSelectedBooking(res.data.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch booking details');
    }
  };

  const handleAction = async (id, action, data = {}) => {
    try {
      switch (action) {
        case 'approve':
          await bookingAPI.approve(id);
          toast.success('Booking approved');
          break;
        case 'reject':
          const reason = prompt('Enter rejection reason:');
          if (!reason) return;
          await bookingAPI.reject(id, reason);
          toast.success('Booking rejected');
          break;
        case 'checkIn':
          await bookingAPI.checkIn(id);
          toast.success('Guest checked in');
          break;
        case 'checkOut':
          await bookingAPI.checkOut(id);
          toast.success('Guest checked out');
          break;
        default:
          break;
      }
      fetchBookings();
      if (selectedBooking?._id === id) {
        fetchBookingDetails(id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
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

  const renderActions = (booking) => {
    const actions = [];
    
    actions.push(
      <button
        key="view"
        onClick={() => fetchBookingDetails(booking._id)}
        className="text-secondary hover:text-primary"
        title="View Details"
      >
        <HiEye className="w-5 h-5" />
      </button>
    );

    if (booking.status === 'Pending') {
      actions.push(
        <button
          key="approve"
          onClick={() => handleAction(booking._id, 'approve')}
          className="text-green-600 hover:text-green-700"
          title="Approve"
        >
          <HiCheckCircle className="w-5 h-5" />
        </button>,
        <button
          key="reject"
          onClick={() => handleAction(booking._id, 'reject')}
          className="text-red-600 hover:text-red-700"
          title="Reject"
        >
          <HiXCircle className="w-5 h-5" />
        </button>
      );
    }

    if (booking.status === 'Approved') {
      actions.push(
        <button
          key="checkin"
          onClick={() => handleAction(booking._id, 'checkIn')}
          className="text-blue-600 hover:text-blue-700"
          title="Check In"
        >
          <HiLogin className="w-5 h-5" />
        </button>
      );
    }

    if (booking.status === 'Checked-In') {
      actions.push(
        <button
          key="checkout"
          onClick={() => handleAction(booking._id, 'checkOut')}
          className="text-purple-600 hover:text-purple-700"
          title="Check Out"
        >
          <HiLogout className="w-5 h-5" />
        </button>
      );
    }

    return actions;
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-slate-primary">
          Manage Bookings
        </h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or name..."
              className="input-field pl-10 py-2"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <select
            className="input-field py-2"
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
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
          
          <button
            onClick={fetchBookings}
            className="btn-primary py-2 px-4"
          >
            <HiFilter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Guest</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rooms</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check-In</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check-Out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
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
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{booking.bookingId}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{booking.guestDetails?.fullName}</p>
                      <p className="text-sm text-gray-500">{booking.guestDetails?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {booking.rooms?.length || 0} room(s)
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">₹{booking.totalAmount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {renderActions(booking)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} bookings
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-outline py-1 px-3 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="btn-outline py-1 px-3 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="font-poppins font-semibold text-lg">
                Booking Details - {selectedBooking.bookingId}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                  setSearchParams({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <span className={`badge ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
                <div className="flex gap-2">
                  {selectedBooking.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleAction(selectedBooking._id, 'approve')}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(selectedBooking._id, 'reject')}
                        className="bg-red-500 text-white py-2 px-4 rounded-md text-sm hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'Approved' && (
                    <button
                      onClick={() => handleAction(selectedBooking._id, 'checkIn')}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Check In
                    </button>
                  )}
                  {selectedBooking.status === 'Checked-In' && (
                    <button
                      onClick={() => handleAction(selectedBooking._id, 'checkOut')}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Check Out
                    </button>
                  )}
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedBooking.guestDetails?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedBooking.guest?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedBooking.guestDetails?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Proof</p>
                    <p className="font-medium">{selectedBooking.guestDetails?.idProofType}: {selectedBooking.guestDetails?.idProofNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{selectedBooking.guestDetails?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Guests</p>
                    <p className="font-medium">{selectedBooking.guestDetails?.numberOfGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purpose of Visit</p>
                    <p className="font-medium">{selectedBooking.guestDetails?.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Check-In Date</p>
                    <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-Out Date</p>
                    <p className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Nights</p>
                    <p className="font-medium">{selectedBooking.numberOfNights}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-lg text-accent">₹{selectedBooking.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3">Booked Rooms</h3>
                <div className="space-y-2">
                  {selectedBooking.rooms?.map((room, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{room.room?.roomNumber || 'Room'}</p>
                        <p className="text-sm text-gray-500">{room.room?.type} - {room.room?.category}</p>
                      </div>
                      <p className="font-semibold">₹{room.price}/night</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food Requirements */}
              {selectedBooking.foodRequirements?.required && (
                <div>
                  <h3 className="font-semibold text-slate-primary mb-3">Food Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Meals</p>
                    <p className="font-medium">
                      {[
                        selectedBooking.foodRequirements.breakfast && 'Breakfast',
                        selectedBooking.foodRequirements.lunch && 'Lunch',
                        selectedBooking.foodRequirements.dinner && 'Dinner',
                      ].filter(Boolean).join(', ')}
                    </p>
                    {selectedBooking.foodRequirements.specialRequirements && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Special Requirements</p>
                        <p className="font-medium">{selectedBooking.foodRequirements.specialRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Approval Document */}
              {selectedBooking.approvalDocument && (
                <div>
                  <h3 className="font-semibold text-slate-primary mb-3">Approval Document</h3>
                  <a
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/${selectedBooking.approvalDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary hover:underline"
                  >
                    <HiDownload className="w-5 h-5" />
                    Download Document
                  </a>
                </div>
              )}

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="font-semibold text-slate-primary mb-3">Special Requests</h3>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedBooking.status === 'Rejected' && selectedBooking.rejectionReason && (
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">Rejection Reason</h3>
                  <p className="bg-red-50 text-red-700 p-4 rounded-lg">{selectedBooking.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
