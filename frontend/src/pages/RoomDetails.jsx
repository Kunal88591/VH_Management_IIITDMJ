import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomAPI } from '../services/api';
import { HiUsers, HiCheckCircle, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getById(id);
      setRoom(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch room details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Room not found</p>
        <Link to="/rooms" className="btn-primary">Back to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/rooms" className="inline-flex items-center text-secondary hover:text-primary mb-6">
          <HiArrowLeft className="w-5 h-5 mr-1" />
          Back to Rooms
        </Link>

        <div className="card">
          {/* Room Image */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-secondary/20 to-primary/20 -mx-5 -mt-5 mb-6 rounded-t-[14px] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">🏨</span>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <span className={`badge ${room.category === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {room.category}
              </span>
              {room.isAvailable && !room.isBlocked ? (
                <span className="badge badge-success">Available</span>
              ) : (
                <span className="badge badge-danger">{room.isBlocked ? 'Blocked' : 'Unavailable'}</span>
              )}
            </div>
          </div>

          {/* Room Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h1 className="font-poppins text-2xl md:text-3xl font-bold text-slate-primary mb-2">
                Room {room.roomNumber}
              </h1>
              <p className="text-gray-500 text-lg mb-4">{room.roomType} Room</p>

              <p className="text-gray-600 mb-6">
                {room.description || 'A comfortable room equipped with modern amenities for a pleasant stay.'}
              </p>

              <div className="mb-6">
                <h3 className="font-poppins font-semibold text-slate-primary mb-3">Room Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <HiUsers className="w-5 h-5 mr-2 text-secondary" />
                    Max {room.maxOccupancy} Guest{room.maxOccupancy > 1 ? 's' : ''}
                  </div>
                  <div className="text-gray-600">
                    Floor: {room.floor}
                  </div>
                </div>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h3 className="font-poppins font-semibold text-slate-primary mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-600">
                        <HiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Card */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-3xl font-bold text-secondary mb-1">
                  ₹{room.pricePerNight}
                </p>
                <p className="text-gray-500 text-sm mb-6">per night</p>

                {room.isAvailable && !room.isBlocked ? (
                  <Link
                    to={`/book?room=${room._id}`}
                    className="btn-primary w-full text-center block"
                  >
                    Book This Room
                  </Link>
                ) : (
                  <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                    Not Available
                  </button>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Check-out is 24 hours from check-in time
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-accent/10 border border-accent/20 rounded-lg p-4">
            <p className="text-slate-primary text-sm">
              <span className="font-semibold text-accent">📌 Important:</span> Check-out is 24 hours from the check-in time. 
              Charges are applicable beyond 24 hours. All bookings require approval from the competent authority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
