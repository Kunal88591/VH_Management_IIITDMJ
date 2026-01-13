import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, bookingAPI } from '../../services/api';
import { 
  HiCalendar, 
  HiOfficeBuilding, 
  HiCurrencyRupee, 
  HiUserGroup,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiEye
} from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, occupancyRes, statusRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentBookings(),
        dashboardAPI.getOccupancyChart({ days: 7 }),
        dashboardAPI.getBookingStatusChart(),
      ]);

      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data);
      setOccupancyData(occupancyRes.data.data);
      setBookingStatusData(statusRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await bookingAPI.approve(id);
        toast.success('Booking approved');
      } else if (action === 'reject') {
        const reason = prompt('Please enter rejection reason:');
        if (reason) {
          await bookingAPI.reject(id, reason);
          toast.success('Booking rejected');
        }
      }
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const COLORS = ['#2C5364', '#C9A227', '#2ECC71', '#E74C3C', '#6B7280'];

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bookings */}
        <div className="card bg-gradient-to-br from-secondary to-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold">{stats?.bookings?.total || 0}</p>
              <p className="text-sm text-white/70 mt-1">
                {stats?.bookings?.pending || 0} pending
              </p>
            </div>
            <HiCalendar className="w-12 h-12 text-white/30" />
          </div>
        </div>

        {/* Rooms */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Room Occupancy</p>
              <p className="text-3xl font-bold text-slate-primary">{stats?.rooms?.occupancyRate || 0}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.rooms?.occupied || 0}/{stats?.rooms?.total || 0} occupied
              </p>
            </div>
            <HiOfficeBuilding className="w-12 h-12 text-secondary/30" />
          </div>
        </div>

        {/* Revenue */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-primary">₹{(stats?.revenue?.total || 0).toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                ₹{(stats?.revenue?.collected || 0).toLocaleString()} collected
              </p>
            </div>
            <HiCurrencyRupee className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        {/* Staff */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Staff Members</p>
              <p className="text-3xl font-bold text-slate-primary">{stats?.staff?.total || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.staff?.active || 0} active
              </p>
            </div>
            <HiUserGroup className="w-12 h-12 text-secondary/30" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Occupancy Chart */}
        <div className="card">
          <h3 className="font-poppins font-semibold text-slate-primary mb-4">
            Occupancy Rate (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#2C5364" name="Occupancy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Chart */}
        <div className="card">
          <h3 className="font-poppins font-semibold text-slate-primary mb-4">
            Booking Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
                label={({ _id, count }) => `${_id}: ${count}`}
              >
                {bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <HiClock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-700">{stats?.bookings?.pending || 0}</p>
          <p className="text-sm text-yellow-600">Pending Approvals</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <HiCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{stats?.bookings?.approved || 0}</p>
          <p className="text-sm text-green-600">Approved</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <HiOfficeBuilding className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{stats?.bookings?.checkedIn || 0}</p>
          <p className="text-sm text-blue-600">Checked In</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <HiOfficeBuilding className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-700">{stats?.rooms?.available || 0}</p>
          <p className="text-sm text-gray-600">Available Rooms</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-poppins font-semibold text-slate-primary">
            Recent Booking Requests
          </h3>
          <Link to="/admin/bookings" className="text-secondary text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Guest</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dates</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.slice(0, 5).map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{booking.bookingId}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{booking.guestDetails?.fullName}</p>
                    <p className="text-sm text-gray-500">{booking.guest?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">₹{booking.totalAmount}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/bookings?id=${booking._id}`}
                        className="text-secondary hover:text-primary"
                        title="View"
                      >
                        <HiEye className="w-5 h-5" />
                      </Link>
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleBookingAction(booking._id, 'approve')}
                            className="text-green-600 hover:text-green-700"
                            title="Approve"
                          >
                            <HiCheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking._id, 'reject')}
                            className="text-red-600 hover:text-red-700"
                            title="Reject"
                          >
                            <HiXCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentBookings.length === 0 && (
          <p className="text-center text-gray-500 py-8">No recent bookings</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
