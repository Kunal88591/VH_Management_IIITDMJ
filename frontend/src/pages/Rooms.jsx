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

  const getRoomImage = (roomType, category) => {
    const images = {
      'Single-AC': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      'Single-Non-AC': 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'Double-AC': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
      'Double-Non-AC': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'Suite-AC': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      'Deluxe-AC': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    };
    return images[`${roomType}-${category}`] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 lg:py-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-primary mb-3">
            Our <span className="text-secondary">Rooms</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Browse through our selection of comfortable and well-equipped rooms
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center shadow-sm hover:shadow-md transition-shadow"
          >
            <HiFilter className="w-5 h-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-primary">{rooms.length}</span> {rooms.length === 1 ? 'room' : 'rooms'} available
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card mb-8 shadow-lg">
            <h3 className="font-poppins font-semibold text-lg sm:text-xl mb-4 flex items-center">
              <HiFilter className="w-5 h-5 mr-2 text-primary" />
              Filter Rooms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <select
                  name="roomType"
                  value={filters.roomType}
                  onChange={handleFilterChange}
                  className="input-field w-full"
                >
                  <option value="">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="input-field w-full"
                >
                  <option value="">All</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="₹ Min"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="₹ Max"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <input
                  type="date"
                  name="checkIn"
                  value={filters.checkIn}
                  onChange={handleFilterChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <input
                  type="date"
                  name="checkOut"
                  value={filters.checkOut}
                  onChange={handleFilterChange}
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={applyFilters} className="btn-primary px-6">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="btn-secondary px-6">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent shadow-lg"></div>
            <p className="text-gray-500 mt-4 animate-pulse">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <HiXCircle className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No rooms found matching your criteria</p>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters to see more results</p>
            <button onClick={clearFilters} className="btn-primary px-6">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div key={room._id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                {/* Room Image */}
                <div className="relative h-52 sm:h-56 overflow-hidden">
                  <img 
                    src={getRoomImage(room.roomType, room.category)}
                    alt={`${room.roomType} Room ${room.roomNumber}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                      room.category === 'AC' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/90 text-gray-700'
                    }`}>
                      {room.category}
                    </span>
                    {getAvailabilityBadge(room)}
                  </div>

                  {/* Room Number Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg">
                      <span className="text-xs text-gray-500 font-medium">Room</span>
                      <span className="text-lg font-bold text-primary ml-1">{room.roomNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-poppins font-bold text-lg text-slate-primary group-hover:text-secondary transition-colors">
                        {room.roomType} Room
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <HiUsers className="w-4 h-4 text-gray-400" />
                        <span>{room.maxOccupancy} Guest{room.maxOccupancy > 1 ? 's' : ''}</span>
                        <span className="text-gray-300">•</span>
                        <span>Floor {room.floor}</span>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-2xl font-bold text-secondary">
                        ₹{room.pricePerNight.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">/night</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {room.description || 'Comfortable room with modern amenities and quality services for a pleasant stay.'}
                  </p>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="text-xs bg-gray-50 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                    <Link 
                      to={`/rooms/${room._id}`}
                      className="flex-1 text-center px-4 py-2.5 rounded-lg font-medium text-sm border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      Details
                    </Link>
                    {room.isAvailable && !room.isBlocked ? (
                      <Link 
                        to={`/book?room=${room._id}`}
                        className="flex-1 text-center px-4 py-2.5 rounded-lg font-medium text-sm bg-secondary text-white hover:bg-secondary/90 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        Book Now
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-gray-200 text-gray-500 cursor-not-allowed"
                      >
                        Unavailable
                      </button>
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
