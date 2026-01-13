import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomAPI } from '../services/api';
import { HiFilter, HiUsers, HiCurrencyRupee, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    roomType: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    checkIn: '',
    checkOut: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filterParams.roomType) params.roomType = filterParams.roomType;
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.minPrice) params.minPrice = filterParams.minPrice;
      if (filterParams.maxPrice) params.maxPrice = filterParams.maxPrice;
      if (filterParams.checkIn) params.checkIn = filterParams.checkIn;
      if (filterParams.checkOut) params.checkOut = filterParams.checkOut;

      const response = await roomAPI.getAll(params);
      setRooms(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchRooms(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      roomType: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      checkIn: '',
      checkOut: '',
    });
    fetchRooms();
  };

  const getAvailabilityBadge = (room) => {
    if (room.isBlocked) {
      return <span className="badge badge-danger">Blocked</span>;
    }
    if (room.isCurrentlyAvailable === false) {
      return <span className="badge badge-warning">Booked</span>;
    }
    if (room.isAvailable) {
      return <span className="badge badge-success">Available</span>;
    }
    return <span className="badge badge-danger">Unavailable</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-slate-primary mb-2">
            Our Rooms
          </h1>
          <p className="text-gray-600">
            Browse through our selection of comfortable rooms
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <HiFilter className="w-5 h-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card mb-8">
            <h3 className="font-poppins font-semibold text-lg mb-4">Filter Rooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  name="roomType"
                  value={filters.roomType}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="₹"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="₹"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <input
                  type="date"
                  name="checkIn"
                  value={filters.checkIn}
                  onChange={handleFilterChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                <input
                  type="date"
                  name="checkOut"
                  value={filters.checkOut}
                  onChange={handleFilterChange}
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={applyFilters} className="btn-primary">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="btn-secondary">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-8">
          <p className="text-slate-primary text-sm">
            <span className="font-semibold text-accent">📌 Note:</span> Check-out is 24 hours from the check-in time. 
            Charges are applicable beyond 24 hours.
          </p>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms found matching your criteria</p>
            <button onClick={clearFilters} className="btn-primary mt-4">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room._id} className="card overflow-hidden group">
                {/* Room Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-secondary/20 to-primary/20 -mx-5 -mt-5 mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🏨</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getAvailabilityBadge(room)}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`badge ${room.category === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {room.category}
                    </span>
                  </div>
                </div>

                {/* Room Info */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-poppins font-semibold text-lg text-slate-primary">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-gray-500 text-sm">{room.roomType} Room</p>
                    </div>
                    <p className="text-xl font-bold text-secondary">
                      ₹{room.pricePerNight}
                      <span className="text-xs font-normal text-gray-500 block text-right">/night</span>
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {room.description || 'Comfortable room with modern amenities'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <HiUsers className="w-4 h-4 mr-1" />
                      {room.maxOccupancy} Guest{room.maxOccupancy > 1 ? 's' : ''}
                    </span>
                    <span>Floor {room.floor}</span>
                  </div>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {room.amenities.slice(0, 4).map((amenity, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link 
                      to={`/rooms/${room._id}`}
                      className="btn-secondary flex-1 text-center text-sm"
                    >
                      View Details
                    </Link>
                    {room.isAvailable && !room.isBlocked && (
                      <Link 
                        to={`/book?room=${room._id}`}
                        className="btn-primary flex-1 text-center text-sm"
                      >
                        Book Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
