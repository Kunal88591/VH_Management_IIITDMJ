import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mealOrderAPI } from '../../services/api';
import { HiClipboardList, HiPlus, HiRefresh } from 'react-icons/hi';
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
  Unpaid: 'text-red-600',
  'Partially Paid': 'text-orange-600',
  Paid: 'text-green-600'
};

const MyMealOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await mealOrderAPI.getAll();
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load meal orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this meal order?')) return;
    try {
      await mealOrderAPI.cancel(id);
      toast.success('Meal order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
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
      toast.error(err.response?.data?.message || 'Failed to load invoice');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getMealSummary = (meals) => {
    if (!meals || !meals.length) return 'No meals';
    const totals = { breakfast: 0, lunch: 0, dinner: 0, tea: 0, milk: 0 };
    meals.forEach(m => {
      totals.breakfast += m.breakfast || 0;
      totals.lunch += m.lunch || 0;
      totals.dinner += m.dinner || 0;
      totals.tea += m.tea || 0;
      totals.milk += m.milk || 0;
    });
    const parts = [];
    if (totals.breakfast) parts.push(`${totals.breakfast} B`);
    if (totals.lunch) parts.push(`${totals.lunch} L`);
    if (totals.dinner) parts.push(`${totals.dinner} D`);
    if (totals.tea) parts.push(`${totals.tea} T`);
    if (totals.milk) parts.push(`${totals.milk} M`);
    return parts.join(' | ') || 'No meals';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins text-2xl font-bold text-slate-primary flex items-center">
            <HiClipboardList className="w-7 h-7 mr-2 text-secondary" />
            My Meal Orders
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchOrders} className="btn-secondary text-sm flex items-center">
              <HiRefresh className="w-4 h-4 mr-1" /> Refresh
            </button>
            <Link to="/meal-order" className="btn-primary text-sm flex items-center">
              <HiPlus className="w-4 h-4 mr-1" /> New Order
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <HiClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No meal orders yet</h3>
            <p className="text-gray-500 mb-4">Place your first meal order</p>
            <Link to="/meal-order" className="btn-primary">
              Order Meals
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-slate-primary">{order.orderId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                      <span className={`text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>For:</strong> {order.personName} ({order.numberOfPersons} person{order.numberOfPersons > 1 ? 's' : ''})</p>
                      <p><strong>Date:</strong> {order.meals?.length ? formatDate(order.meals[0].date) : '-'}
                        {order.meals?.length > 1 && ` to ${formatDate(order.meals[order.meals.length - 1].date)}`}
                      </p>
                      <p><strong>Meals:</strong> {getMealSummary(order.meals)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-secondary">₹{(order.totalMealCharges || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      {['Pending'].includes(order.status) && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                      {(order.totalMealCharges > 0) && (
                        <>
                          <button
                            onClick={() => handleViewInvoice(order._id)}
                            className="text-xs text-secondary hover:text-secondary/80 font-medium"
                          >
                            View Invoice
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showInvoice && invoiceBooking && (
          <Invoice booking={invoiceBooking} onClose={() => setShowInvoice(false)} />
        )}
      </div>
    </div>
  );
};

export default MyMealOrders;
