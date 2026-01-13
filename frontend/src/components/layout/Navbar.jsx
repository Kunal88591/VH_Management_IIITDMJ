import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX, HiUser, HiLogout, HiCalendar, HiCog } from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-primary sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">VH</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-poppins font-semibold text-lg">
                IIITDMJ Visitors' Hostel
              </h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/90 hover:text-white transition-colors font-medium">
              Home
            </Link>
            <Link to="/rooms" className="text-white/90 hover:text-white transition-colors font-medium">
              Rooms
            </Link>
            <Link to="/rules" className="text-white/90 hover:text-white transition-colors font-medium">
              Rules & Tariff
            </Link>
            <Link to="/book" className="btn-accent text-sm">
              Book Now
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <HiUser className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-fadeIn">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <HiCog className="w-5 h-5 mr-2" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/my-bookings"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <HiCalendar className="w-5 h-5 mr-2" />
                          My Bookings
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <HiUser className="w-5 h-5 mr-2" />
                          Profile
                        </Link>
                      </>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <HiLogout className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-light animate-fadeIn">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block text-white/90 hover:text-white py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className="block text-white/90 hover:text-white py-2"
              onClick={() => setIsOpen(false)}
            >
              Rooms
            </Link>
            <Link
              to="/rules"
              className="block text-white/90 hover:text-white py-2"
              onClick={() => setIsOpen(false)}
            >
              Rules & Tariff
            </Link>
            <Link
              to="/book"
              className="block btn-accent text-center"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </Link>
            
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="block text-white/90 hover:text-white py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/my-bookings"
                      className="block text-white/90 hover:text-white py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      className="block text-white/90 hover:text-white py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-red-300 hover:text-red-200 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-white/90 hover:text-white py-2"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
