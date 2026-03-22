import { useEffect, useMemo, useState } from 'react';
import { HiFilter, HiUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SYSTEM_EMAIL_REGEX = /\.system[@.]/i;

const ActivityPanel = () => {
  const { user, isSystemAdmin, isPrimaryAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    activityType: '',
    adminId: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [admins, setAdmins] = useState([]);
  const [summary, setSummary] = useState(null);

  const hasElevatedAccess = useMemo(() => {
    if (!user) return false;
    return isSystemAdmin || isPrimaryAdmin || user.email === 'vh@iiitdmj.ac.in';
  }, [user, isSystemAdmin, isPrimaryAdmin]);

  const sanitizeActivities = (items) => {
    if (isSystemAdmin) return items;
    return items.filter((activity) => !SYSTEM_EMAIL_REGEX.test(activity.adminEmail || activity.admin?.email || ''));
  };

  useEffect(() => {
    if (!user) return;
    if (!hasElevatedAccess && user.id && filters.adminId !== user.id) {
      setFilters((prev) => ({ ...prev, adminId: user.id }));
    }
  }, [user, hasElevatedAccess, filters.adminId]);

  useEffect(() => {
    if (!user) return;
    fetchActivities();
    fetchSummary();
    if (hasElevatedAccess) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, hasElevatedAccess, user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.activityType && { activityType: filters.activityType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      const adminFilter = hasElevatedAccess ? filters.adminId : user?.id;
      if (adminFilter) {
        params.adminId = adminFilter;
      }

      const { data } = await api.get('/activities', { params });
      const rawActivities = data.data || [];
      const visibleActivities = sanitizeActivities(rawActivities);

      const totalFromApi = data.total ?? visibleActivities.length;
      const pagesFromApi = data.pages || Math.max(1, Math.ceil(totalFromApi / pagination.limit));

      setActivities(visibleActivities);
      setPagination((prev) => ({
        ...prev,
        total: totalFromApi,
        pages: pagesFromApi
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/activities/summary');
      setSummary(data.data || {});
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/admin/admins');
      const list = data.data || [];
      setAdmins(list.filter((admin) => !SYSTEM_EMAIL_REGEX.test(admin.email || '')));
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      'BOOKING_APPROVED': '✅',
      'BOOKING_REJECTED': '❌',
      'BOOKING_CHECKIN': '🚪',
      'BOOKING_CHECKOUT': '🚶',
      'ROOM_CREATED': '🏠',
      'ROOM_UPDATED': '✏️',
      'ROOM_BLOCKED': '🔒',
      'STAFF_CREATED': '👤'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (type) => {
    const colors = {
      'BOOKING_APPROVED': 'bg-green-100 text-green-700',
      'BOOKING_REJECTED': 'bg-red-100 text-red-700',
      'BOOKING_CHECKIN': 'bg-blue-100 text-blue-700',
      'BOOKING_CHECKOUT': 'bg-purple-100 text-purple-700',
      'ROOM_CREATED': 'bg-indigo-100 text-indigo-700',
      'ROOM_UPDATED': 'bg-yellow-100 text-yellow-700',
      'ROOM_BLOCKED': 'bg-red-100 text-red-700',
      'STAFF_CREATED': 'bg-cyan-100 text-cyan-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatActivityType = (type) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="animate-fadeIn">
      {}
      <div className="mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-slate-primary mb-4">
          Activity Panel
        </h1>

        {}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{summary.bookingsApproved || 0}</div>
              <div className="text-sm text-blue-600">Bookings Approved</div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{summary.bookingsRejected || 0}</div>
              <div className="text-sm text-red-600">Bookings Rejected</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{summary.checkIns || 0}</div>
              <div className="text-sm text-green-600">Check-Ins</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{summary.checkOuts || 0}</div>
              <div className="text-sm text-purple-600">Check-Outs</div>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HiFilter className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-slate-primary">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="input-field py-2"
            value={filters.activityType}
            onChange={(e) => {
              setFilters({ ...filters, activityType: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">All Activities</option>
            <option value="BOOKING_APPROVED">Bookings Approved</option>
            <option value="BOOKING_REJECTED">Bookings Rejected</option>
            <option value="BOOKING_CHECKIN">Check-Ins</option>
            <option value="BOOKING_CHECKOUT">Check-Outs</option>
            <option value="ROOM_CREATED">Rooms Created</option>
            <option value="ROOM_BLOCKED">Rooms Blocked</option>
          </select>

          {hasElevatedAccess ? (
            <select
              className="input-field py-2"
              value={filters.adminId}
              onChange={(e) => {
                setFilters({ ...filters, adminId: e.target.value });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="">All Admins</option>
              {admins.map(admin => (
                <option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>
          ) : (
            <div className="input-field py-2 flex items-center gap-2 text-gray-600">
              <HiUser className="w-4 h-4 text-secondary" />
              <span className="text-sm">Showing your activity</span>
            </div>
          )}

          <input
            type="date"
            className="input-field py-2"
            value={filters.startDate}
            onChange={(e) => {
              setFilters({ ...filters, startDate: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            placeholder="Start Date"
          />

          <input
            type="date"
            className="input-field py-2"
            value={filters.endDate}
            onChange={(e) => {
              setFilters({ ...filters, endDate: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            placeholder="End Date"
          />
        </div>

        <button
          onClick={() => {
            setFilters({
              activityType: '',
              adminId: hasElevatedAccess ? '' : user?.id || '',
              startDate: '',
              endDate: ''
            });
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No activities found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-primary">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-primary">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-primary">
                      Activity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-primary">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-primary">
                      Booking
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr
                      key={activity._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(activity.createdAt).toLocaleDateString()}{' '}
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {activity.admin?.name || activity.adminName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.admin?.email || activity.adminEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(
                            activity.activityType
                          )}`}
                        >
                          {getActivityIcon(activity.activityType)}{' '}
                          {formatActivityType(activity.activityType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {activity.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-accent font-medium">
                        {activity.bookingNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setPagination(prev => ({ ...prev, page }))
                    }
                    className={`px-3 py-1 rounded ${
                      pagination.page === page
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
