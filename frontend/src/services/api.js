import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Room APIs
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  block: (id, data) => api.put(`/rooms/${id}/block`, data),
  checkAvailability: (params) => api.get('/rooms/availability/check', { params }),
};

// Booking APIs
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  approve: (id) => api.put(`/bookings/${id}/approve`),
  reject: (id, reason) => api.put(`/bookings/${id}/reject`, { rejectionReason: reason }),
  checkIn: (id) => api.put(`/bookings/${id}/check-in`),
  checkOut: (id) => api.put(`/bookings/${id}/check-out`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  modifyRooms: (id, roomIds) => api.put(`/bookings/${id}/modify-rooms`, { roomIds }),
  getPendingCount: () => api.get('/bookings/pending/count'),
};

// Billing APIs
export const billingAPI = {
  getAll: (params) => api.get('/billing', { params }),
  getById: (id) => api.get(`/billing/${id}`),
  generate: (bookingId, data) => api.post(`/billing/generate/${bookingId}`, data),
  updatePayment: (id, data) => api.put(`/billing/${id}/payment`, data),
  getPDF: (id) => api.get(`/billing/${id}/pdf`, { responseType: 'blob' }),
  downloadInvoice: (id) => api.get(`/billing/${id}/pdf`, { responseType: 'blob' }),
  getByBooking: (bookingId) => api.get(`/billing/booking/${bookingId}`),
};

// Staff APIs
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  toggleStatus: (id) => api.put(`/staff/${id}/toggle-status`),
  getRoles: () => api.get('/staff/roles/list'),
};

// Attendance APIs
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  mark: (data) => api.post('/attendance/mark', data),
  markManual: (data) => api.post('/attendance/mark', data),
  getReport: (params) => api.get('/attendance/report', { params }),
  getToday: () => api.get('/attendance/today'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentBookings: () => api.get('/dashboard/recent-bookings'),
  getRevenueChart: (params) => api.get('/dashboard/revenue-chart', { params }),
  getOccupancyChart: (params) => api.get('/dashboard/occupancy-chart', { params }),
  getBookingStatusChart: () => api.get('/dashboard/booking-status-chart'),
  getFoodBillingSummary: (params) => api.get('/dashboard/food-billing-summary', { params }),
};
