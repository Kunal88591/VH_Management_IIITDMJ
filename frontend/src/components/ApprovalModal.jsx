import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { bookingAPI } from '../services/api';

const ApprovalModal = ({ booking, onClose, onApprove }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useOriginalRooms, setUseOriginalRooms] = useState(true);

  useEffect(() => {
    fetchAvailableRooms();
  }, [booking]);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getAvailableRooms(booking._id);
      setAvailableRooms(res.data.data || []);
      
      // Pre-select originally booked rooms if available
      const originalRoomIds = booking.rooms.map(r => r.room._id || r.room);
      setSelectedRooms(originalRoomIds);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Failed to load available rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  const handleApprove = () => {
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    // Check if rooms changed from original
    const originalRoomIds = booking.rooms.map(r => r.room._id || r.room).sort();
    const newRoomIds = selectedRooms.sort();
    const roomsChanged = JSON.stringify(originalRoomIds) !== JSON.stringify(newRoomIds);

    onApprove(roomsChanged ? selectedRooms : null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-primary">
            Approve Booking - Select Rooms
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Booking ID:</span> {booking.bookingId}
              </div>
              <div>
                <span className="text-gray-600">Guest:</span> {booking.guests?.[0]?.fullName || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">Check-In:</span>{' '}
                {new Date(booking.checkInDate).toLocaleDateString()}
              </div>
              <div>
                <span className="text-gray-600">Check-Out:</span>{' '}
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Originally Requested Rooms:</span>{' '}
                {booking.rooms.map(r => r.roomNumber).join(', ')}
              </div>
            </div>
          </div>

          {/* Room Selection Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useOriginalRooms}
                onChange={(e) => {
                  setUseOriginalRooms(e.target.checked);
                  if (e.target.checked) {
                    const originalRoomIds = booking.rooms.map(r => r.room._id || r.room);
                    setSelectedRooms(originalRoomIds);
                  }
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">Keep original rooms</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Uncheck to assign different available rooms for this booking
            </p>
          </div>

          {/* Available Rooms */}
          {!useOriginalRooms && (
            <div>
              <h3 className="font-semibold mb-4">Select Available Rooms</h3>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading available rooms...</div>
              ) : availableRooms.length === 0 ? (
                <div className="text-center py-8 text-red-500">
                  No rooms available for the selected dates
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map(room => (
                    <label
                      key={room._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRooms.includes(room._id)
                          ? 'border-accent bg-accent/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room._id)}
                        onChange={() => handleRoomSelect(room._id)}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="mt-2">
                        <div className="font-semibold">{room.roomNumber}</div>
                        <div className="text-sm text-gray-600">
                          {room.roomType} ({room.category})
                        </div>
                        <div className="text-sm font-medium text-accent mt-1">
                          ₹{room.pricePerNight}/night
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {useOriginalRooms && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ✓ Original rooms will be assigned: {booking.rooms.map(r => r.roomNumber).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            Approve Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
