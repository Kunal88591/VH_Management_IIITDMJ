import { useState, useEffect } from 'react';
import { mealOrderAPI } from '../../services/api';
import { HiClipboardList, HiCheck, HiX, HiRefresh, HiCheckCircle, HiPrinter } from 'react-icons/hi';
import Invoice from '../../components/Invoice';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Completed: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-gray-100 text-gray-600'
};

const PAYMENT_COLORS = {
  Unpaid: 'bg-red-100 text-red-700',
  'Partially Paid': 'bg-orange-100 text-orange-700',
  Paid: 'bg-green-100 text-green-700'
};

const AdminMealOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const res = await mealOrderAPI.getAll(params);
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load meal orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleAction = async (id, action) => {
    const actionLabels = { approve: 'Approve', reject: 'Reject', complete: 'Complete', cancel: 'Cancel' };
    if (!window.confirm(`${actionLabels[action]} this meal order?`)) return;

    try {
      await mealOrderAPI[action](id);
      toast.success(`Meal order ${action}d successfully`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const handlePayment = async (id, paymentStatus) => {
    try {
      const order = orders.find(o => o._id === id);
      let amountPaid = order.amountPaid || 0;

      if (paymentStatus === 'Paid') {
        const input = window.prompt(`Enter amount paid (total ₹${order.totalMealCharges || 0}):`, `${order.totalMealCharges || 0}`);
        if (input === null) return; // user cancelled
        const val = Number(input);
        if (isNaN(val) || val < 0) {
          toast.error('Invalid amount');
          return;
        }
        amountPaid = val;
      } else if (paymentStatus === 'Partially Paid') {
        const input = window.prompt(`Enter partial amount paid (max ₹${order.totalMealCharges || 0}):`, `${order.amountPaid || 0}`);
        if (input === null) return;
        const val = Number(input);
        if (isNaN(val) || val < 0 || val > (order.totalMealCharges || 0)) {
          toast.error('Invalid amount');
          return;
        }
        amountPaid = val;
      } else {
        // Unpaid or other statuses
        amountPaid = 0;
      }

      await mealOrderAPI.updatePayment(id, { paymentStatus, amountPaid });
      toast.success('Payment updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update payment');
    }
  };

  const handleViewInvoice = async (id) => {
    try {
      const res = await mealOrderAPI.getById(id);
      const order = res.data.data;
      const bookingLike = {
        bookingId: order.orderId || order._id,
        visitorCategory: 'Meal Order',
        visitorSubCategory: '',
        guests: [{ fullName: order.personName }],
        checkInDate: order.meals && order.meals.length ? order.meals[0].date : new Date().toISOString(),
        checkInTime: '',
        checkOutDate: order.meals && order.meals.length ? order.meals[order.meals.length - 1].date : new Date().toISOString(),
        checkOutTime: '',
        numberOfGuests: order.numberOfPersons || 1,
        numberOfRooms: 0,
        rooms: [],
        roomCharges: 0,
        mealRequirements: { required: true, meals: order.meals || [] },
        mealCharges: order.totalMealCharges || 0,
        totalAmount: order.totalMealCharges || 0,
        amountPaid: order.amountPaid || 0,
        paymentStatus: order.paymentStatus || 'Unpaid',
        status: order.status || 'Pending',
        createdAt: order.createdAt
      };
      setInvoiceBooking(bookingLike);
      setShowInvoice(true);
    } catch (err) {
      toast.error('Failed to load invoice');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getMealSummary = (meals) => {
    if (!meals || !meals.length) return '-';
    const totals = { breakfast: 0, lunch: 0, dinner: 0, tea: 0, milk: 0 };
    meals.forEach(m => {
      totals.breakfast += m.breakfast || 0;
      totals.lunch += m.lunch || 0;
      totals.dinner += m.dinner || 0;
      totals.tea += m.tea || 0;
      totals.milk += m.milk || 0;
    });
    const parts = [];
    if (totals.breakfast) parts.push(`${totals.breakfast}B`);
    if (totals.lunch) parts.push(`${totals.lunch}L`);
    if (totals.dinner) parts.push(`${totals.dinner}D`);
    if (totals.tea) parts.push(`${totals.tea}T`);
    if (totals.milk) parts.push(`${totals.milk}M`);
    return parts.join(' ') || '-';
  };

  const filters = ['all', 'Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins text-2xl font-bold text-slate-primary flex items-center">
          <HiClipboardList className="w-7 h-7 mr-2 text-secondary" />
          Meal Orders
        </h1>
        <button onClick={fetchOrders} className="btn-secondary text-sm flex items-center">
          <HiRefresh className="w-4 h-4 mr-1" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-secondary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <HiClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No meal orders found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                <tr>
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Person</th>
                  <th className="p-4 text-left">Date(s)</th>
                  <th className="p-4 text-center">Persons</th>
                  <th className="p-4 text-center">Meals</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Payment</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-slate-primary">{order.orderId}</td>
                    <td className="p-4">
                      <div className="font-medium">{order.personName}</div>
                      <div className="text-xs text-gray-500">{order.mobile}</div>
                      {order.orderedBy && (
                        <div className="text-xs text-gray-400">{order.orderedBy.email}</div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.meals?.length ? (
                        <>
                          {formatDate(order.meals[0].date)}
                          {order.meals.length > 1 && (
                            <div className="text-xs text-gray-500">
                              to {formatDate(order.meals[order.meals.length - 1].date)}
                            </div>
                          )}
                        </>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-center">{order.numberOfPersons}</td>
                    <td className="p-4 text-center text-xs font-mono">{getMealSummary(order.meals)}</td>
                    <td className="p-4 text-right font-semibold">₹{(order.totalMealCharges || 0).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePayment(order._id, e.target.value)}
                        className={`text-xs rounded-full px-2 py-1 font-medium border-0 cursor-pointer ${PAYMENT_COLORS[order.paymentStatus]}`}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewInvoice(order._id)}
                          className="p-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                          title="View Invoice"
                        >
                          <HiPrinter className="w-4 h-4" />
                        </button>
                        {order.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleAction(order._id, 'approve')}
                              className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                              title="Approve"
                            >
                              <HiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(order._id, 'reject')}
                              className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                              title="Reject"
                            >
                              <HiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {order.status === 'Approved' && (
                          <button
                            onClick={() => handleAction(order._id, 'complete')}
                            className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Mark Complete"
                          >
                            <HiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'Approved' && (
                          <button
                            onClick={() => handleAction(order._id, 'cancel')}
                            className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Cancel"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showInvoice && invoiceBooking && (
        <Invoice booking={invoiceBooking} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};

export default AdminMealOrders;
