import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiCalendar,
  HiOfficeBuilding,
  HiCurrencyRupee,
  HiUserGroup,
  HiClock,
  HiMenu,
  HiX,
  HiLogout,
  HiExternalLink
} from 'react-icons/hi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: HiHome, label: 'Dashboard', exact: true },
    { path: '/admin/bookings', icon: HiCalendar, label: 'Bookings' },
    { path: '/admin/rooms', icon: HiOfficeBuilding, label: 'Rooms' },
    { path: '/admin/billing', icon: HiCurrencyRupee, label: 'Billing' },
    { path: '/admin/staff', icon: HiUserGroup, label: 'Staff' },
    { path: '/admin/attendance', icon: HiClock, label: 'Attendance' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-gradient-primary transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">VH</span>
              </div>
              <span className="text-white font-poppins font-semibold text-sm">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/80 hover:text-white p-1"
          >
            <HiMenu className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Visit Website Link */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <HiExternalLink className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 text-sm">Visit Website</span>}
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {user?.name?.charAt(0)}
              </span>
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-white/60 text-xs">Administrator</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="flex items-center w-full mt-3 px-3 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors text-sm"
            >
              <HiLogout className="w-4 h-4 mr-2" />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 bg-gradient-primary flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">VH</span>
                </div>
                <span className="text-white font-poppins font-semibold text-sm">Admin</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white p-1"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path, item.exact)
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-red-300 hover:text-red-200 rounded-lg transition-colors"
              >
                <HiLogout className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-600 p-2"
            >
              <HiMenu className="w-6 h-6" />
            </button>
            <h1 className="font-poppins font-semibold text-lg text-slate-primary">
              {menuItems.find((item) => isActive(item.path, item.exact))?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Welcome, {user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
