import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import {
  HiFilter,
  HiEye,
  HiCheckCircle,
  HiXCircle,
  HiLogin,
  HiLogout,
  HiDownload,
  HiX,
  HiUserGroup,
  HiDocumentText
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Invoice from '../../components/Invoice';
import PaymentModal from '../../components/PaymentModal';

// API base URL for document download/view (same logic as api.js)
const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://vh-management-backend.onrender.com/api')
  : '/api';

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Reduced back to 10
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      fetchBookings();
    }
  }, [pagination.page, filters.status, filters.startDate, filters.endDate, searchParams]);

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
      setBookings(res.data.data || []);
      if (res.data.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: res.data.total || 0,
          pages: res.data.totalPages || 1
        }));
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (id) => {
    try {
      const res = await bookingAPI.getById(id);
      console.log('Selected booking:', res.data.data);
      setSelectedBooking(res.data.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch booking details');
    }
  };

  const handleAction = async (id, action) => {
    try {
      let updatedBooking;

      switch (action) {
        case 'approve':
          const approveRes = await bookingAPI.approve(id);
          updatedBooking = approveRes.data.data;
          toast.success('Booking approved');
          break;
        case 'reject':
          const reason = prompt('Enter rejection reason:');
          if (!reason) return;
          const rejectRes = await bookingAPI.reject(id, reason);
          updatedBooking = rejectRes.data.data;
          toast.success('Booking rejected');
          break;
        case 'checkIn':
          const checkInRes = await bookingAPI.checkIn(id);
          updatedBooking = checkInRes.data.data;
          toast.success('Guest checked in');
          break;
        case 'checkOut':
          const checkOutRes = await bookingAPI.checkOut(id);
          updatedBooking = checkOutRes.data.data;
          toast.success('Guest checked out');
          break;
      }

      // Update bookings list without refetching
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === id ? updatedBooking : booking
        )
      );

      // Update selected booking if it's open
      if (selectedBooking?._id === id) {
        setSelectedBooking(updatedBooking);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDownloadDocument = async (bookingId, docType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/download-document/${docType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docType}-${bookingId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Document downloaded');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleViewDocument = async (bookingId, docType) => {
    try {
      const url = `${API_BASE_URL}/bookings/${bookingId}/view-document/${docType}`;
      const token = localStorage.getItem('token');

      // Open in new tab with auth header
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('View failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');

      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

      toast.success('Document opened in new tab');
    } catch (error) {
      toast.error('Failed to view document');
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

  const getCategoryBadge = (category) => {
    const badges = {
      'A': 'bg-purple-100 text-purple-700',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-green-100 text-green-700',
      'D': 'bg-orange-100 text-orange-700'
    };
    return badges[category] || 'bg-gray-100 text-gray-700';
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

  // Get guest names from new or old schema
  const getGuestNames = (booking) => {
    if (booking.guests && booking.guests.length > 0) {
      return booking.guests.map(g => g.fullName).join(', ');
    }
    return booking.guestDetails?.fullName || 'N/A';
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
          <select
            className="input-field py-2"
            value={filters.category}
            onChange={(e) => {
              setFilters({ ...filters, category: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">All Categories</option>
            <option value="A">Category A</option>
            <option value="B">Category B</option>
            <option value="C">Category C</option>
            <option value="D">Category D</option>
          </select>

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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Guest Name</th>
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
                      {booking.visitorCategory ? (
                        <span className={`badge ${getCategoryBadge(booking.visitorCategory)}`}>
                          Cat {booking.visitorCategory}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{booking.guests?.[0]?.fullName || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{booking.numberOfGuests} guest(s)</p>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <p>{new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-xs text-gray-500">{booking.checkInTime || '12:00 PM'}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <p>{new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-xs text-gray-500">{booking.checkOutTime || '12:00 PM'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">₹{booking.totalAmount || 0}</td>
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
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

            <div className="p-6 space-y-6">
              {/* Status and Category */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                  {selectedBooking.visitorCategory && (
                    <span className={`badge ${getCategoryBadge(selectedBooking.visitorCategory)}`}>
                      Category {selectedBooking.visitorCategory}
                    </span>
                  )}
                  {selectedBooking.bookingType && (
                    <span className="badge bg-gray-100 text-gray-700">
                      {selectedBooking.bookingType === 'self' ? 'Self Booking' : 'Booking for Others'}
                    </span>
                  )}
                </div>
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
                  {['Approved', 'Checked-In', 'Checked-Out'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setShowInvoice(true);
                      }}
                      className="bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700 flex items-center gap-2"
                    >
                      <HiDocumentText className="w-4 h-4" />
                      View Invoice
                    </button>
                  )}
                </div>
              </div>

              {/* Validation Info */}
              {(selectedBooking.employeeId || selectedBooking.studentRollNumber) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-primary mb-2">Validation Information</h3>
                  {selectedBooking.employeeId && (
                    <p className="text-sm"><strong>Employee ID:</strong> {selectedBooking.employeeId}</p>
                  )}
                  {selectedBooking.studentRollNumber && (
                    <p className="text-sm"><strong>Student Roll Number:</strong> {selectedBooking.studentRollNumber}</p>
                  )}
                </div>
              )}

              {/* Guest Details */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3 flex items-center gap-2">
                  <HiUserGroup className="w-5 h-5" />
                  Guest Information ({selectedBooking.numberOfGuests || selectedBooking.guests?.length || 1} guest(s))
                </h3>
                <div className="space-y-3">
                  {selectedBooking.guests && selectedBooking.guests.length > 0 ? (
                    selectedBooking.guests.map((guest, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{guest.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium">{guest.age}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p className="font-medium">{guest.mobile || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedBooking.guestDetails?.fullName || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3">Booking & Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Check-In</p>
                    <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()} at {selectedBooking.checkInTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-Out</p>
                    <p className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString()} at {selectedBooking.checkOutTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Charges</p>
                    <p className="font-medium">₹{selectedBooking.roomCharges || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meal Charges</p>
                    <p className="font-medium">₹{selectedBooking.mealCharges || 0}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-secondary">₹{selectedBooking.totalAmount || 0}</p>
                  </div>
                  <div className="col-span-2 border-t pt-3 mt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <p className={`font-semibold ${selectedBooking.paymentStatus === 'Paid' ? 'text-green-600' :
                          selectedBooking.paymentStatus === 'Refunded' ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                          {selectedBooking.paymentStatus || 'Unpaid'}
                        </p>
                        {selectedBooking.paymentDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Paid on: {new Date(selectedBooking.paymentDate).toLocaleDateString()}
                          </p>
                        )}
                        {selectedBooking.paymentMethod && (
                          <p className="text-xs text-gray-500">
                            Method: {selectedBooking.paymentMethod}
                          </p>
                        )}
                      </div>
                      {['Approved', 'Checked-In', 'Checked-Out'].includes(selectedBooking.status) && (
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 flex items-center gap-2"
                        >
                          💳 Update Payment
                        </button>
                      )}
                    </div>
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
                        <p className="font-medium">Room {room.roomNumber}</p>
                        <p className="text-sm text-gray-500">{room.roomType} {room.isSuite && '(Suite)'}</p>
                      </div>
                      <p className="font-semibold">₹{room.pricePerNight}/night</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Requirements */}
              {selectedBooking.mealRequirements?.required && (
                <div>
                  <h3 className="font-semibold text-slate-primary mb-3">Meal Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {selectedBooking.mealRequirements.meals?.map((meal, idx) => (
                      <div key={idx} className="text-sm">
                        <strong>Day {idx + 1}:</strong>{' '}
                        {meal.breakfast > 0 && `Breakfast(${meal.breakfast}) `}
                        {meal.lunch > 0 && `Lunch(${meal.lunch}) `}
                        {meal.dinner > 0 && `Dinner(${meal.dinner}) `}
                        {meal.tea > 0 && `Tea(${meal.tea}) `}
                        {meal.milk > 0 && `Milk(${meal.milk})`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-slate-primary mb-3 flex items-center gap-2">
                  <HiDocumentText className="w-5 h-5" />
                  Uploaded Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedBooking.directorApproval?.hasData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Director Approval</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDocument(selectedBooking._id, 'directorApproval')}
                          className="btn-primary text-sm py-1 px-3 flex-1"
                        >
                          <HiEye className="w-4 h-4 inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(selectedBooking._id, 'directorApproval')}
                          className="btn-outline text-sm py-1 px-3 flex-1"
                        >
                          <HiDownload className="w-4 h-4 inline mr-1" /> Download
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedBooking.guestIdCard?.hasData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Guest ID Card</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDocument(selectedBooking._id, 'guestIdCard')}
                          className="btn-primary text-sm py-1 px-3 flex-1"
                        >
                          <HiEye className="w-4 h-4 inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(selectedBooking._id, 'guestIdCard')}
                          className="btn-outline text-sm py-1 px-3 flex-1"
                        >
                          <HiDownload className="w-4 h-4 inline mr-1" /> Download
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedBooking.studentIdCard?.hasData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Student ID Card</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDocument(selectedBooking._id, 'studentIdCard')}
                          className="btn-primary text-sm py-1 px-3 flex-1"
                        >
                          <HiEye className="w-4 h-4 inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(selectedBooking._id, 'studentIdCard')}
                          className="btn-outline text-sm py-1 px-3 flex-1"
                        >
                          <HiDownload className="w-4 h-4 inline mr-1" /> Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {!selectedBooking.directorApproval?.hasData && !selectedBooking.guestIdCard?.hasData && !selectedBooking.studentIdCard?.hasData && (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}
              </div>

              {/* Additional Requirements */}
              {selectedBooking.additionalRequirements && (
                <div>
                  <h3 className="font-semibold text-slate-primary mb-3">Additional Requirements</h3>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedBooking.additionalRequirements}</p>
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

      {/* Invoice Modal */}
      {showInvoice && selectedBooking && (
        <Invoice
          booking={selectedBooking}
          onClose={() => {
            setShowInvoice(false);
            setShowModal(true);
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            fetchBookingDetails(selectedBooking._id);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default Bookings;
