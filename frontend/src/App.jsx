import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Rules from './pages/Rules';
import BookingForm from './pages/BookingForm';
import BookingConfirmation from './pages/BookingConfirmation';

// Guest Pages
import MyBookings from './pages/guest/MyBookings';
import BookingDetails from './pages/guest/BookingDetails';
import Profile from './pages/guest/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminRooms from './pages/admin/Rooms';
import AdminBilling from './pages/admin/Billing';
import AdminStaff from './pages/admin/Staff';
import AdminAttendance from './pages/admin/Attendance';
import AdminManagement from './pages/admin/AdminManagement';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/rooms" element={<><Navbar /><Rooms /><Footer /></>} />
            <Route path="/rooms/:id" element={<><Navbar /><RoomDetails /><Footer /></>} />
            <Route path="/gallery" element={<><Navbar /><Gallery /><Footer /></>} />
            <Route path="/rules" element={<><Navbar /><Rules /><Footer /></>} />
            <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
            <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
            <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />
            <Route path="/reset-password/:token" element={<><Navbar /><ResetPassword /><Footer /></>} />
            
            {/* Protected Guest Routes */}
            <Route path="/book" element={
              <ProtectedRoute><Navbar /><BookingForm /><Footer /></ProtectedRoute>
            } />
            <Route path="/booking-confirmation/:id" element={
              <ProtectedRoute><Navbar /><BookingConfirmation /><Footer /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><Navbar /><MyBookings /><Footer /></ProtectedRoute>
            } />
            <Route path="/my-bookings/:id" element={
              <ProtectedRoute><Navbar /><BookingDetails /><Footer /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Navbar /><Profile /><Footer /></ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
            }>              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="admins" element={<AdminManagement />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
