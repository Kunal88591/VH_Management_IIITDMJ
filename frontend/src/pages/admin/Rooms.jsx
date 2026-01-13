import { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiLockClosed, 
  HiLockOpen,
  HiX,
  HiPhotograph
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Single',
    category: 'AC',
    floor: 1,
    capacity: 1,
    price: 500,
    amenities: [],
    description: '',
    images: []
  });

  const roomTypes = ['Single', 'Double', 'Suite', 'Dormitory'];
  const categories = ['AC', 'Non-AC'];
  const availableAmenities = ['WiFi', 'TV', 'AC', 'Refrigerator', 'Geyser', 'Attached Bathroom', 'Balcony', 'Room Service'];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getAll();
      setRooms(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomAPI.update(editingRoom._id, formData);
        toast.success('Room updated successfully');
      } else {
        await roomAPI.create(formData);
        toast.success('Room created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomAPI.delete(id);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleBlockToggle = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await roomAPI.unblock(id);
        toast.success('Room unblocked');
      } else {
        const reason = prompt('Enter reason for blocking:');
        if (!reason) return;
        await roomAPI.block(id, reason);
        toast.success('Room blocked');
      }
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update room status');
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      category: room.category,
      floor: room.floor,
      capacity: room.capacity,
      price: room.price,
      amenities: room.amenities || [],
      description: room.description || '',
      images: room.images || []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      type: 'Single',
      category: 'AC',
      floor: 1,
      capacity: 1,
      price: 500,
      amenities: [],
      description: '',
      images: []
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getStatusBadge = (room) => {
    if (room.isBlocked) return 'bg-red-100 text-red-700';
    if (room.isOccupied) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (room) => {
    if (room.isBlocked) return 'Blocked';
    if (room.isOccupied) return 'Occupied';
    return 'Available';
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-slate-primary">
          Room Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Add Room
        </button>
      </div>

      {/* Room Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-gray-500 text-sm">Total Rooms</p>
          <p className="text-2xl font-bold text-slate-primary">{rooms.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-sm">Available</p>
          <p className="text-2xl font-bold text-green-700">
            {rooms.filter(r => !r.isOccupied && !r.isBlocked).length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm">Occupied</p>
          <p className="text-2xl font-bold text-blue-700">
            {rooms.filter(r => r.isOccupied).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-red-600 text-sm">Blocked</p>
          <p className="text-2xl font-bold text-red-700">
            {rooms.filter(r => r.isBlocked).length}
          </p>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card text-center py-12">
          <HiPhotograph className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No rooms found. Add your first room!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-slate-primary">
                    Room {room.roomNumber}
                  </h3>
                  <p className="text-sm text-gray-500">Floor {room.floor}</p>
                </div>
                <span className={`badge ${getStatusBadge(room)}`}>
                  {getStatusText(room)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{room.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-medium">{room.capacity} guests</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-semibold text-accent">₹{room.price}/night</span>
                </div>
              </div>

              {room.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">+{room.amenities.length - 3} more</span>
                  )}
                </div>
              )}

              {room.isBlocked && room.blockReason && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">
                  Blocked: {room.blockReason}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => openEditModal(room)}
                  className="flex-1 btn-outline py-2 text-sm flex items-center justify-center gap-1"
                >
                  <HiPencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleBlockToggle(room._id, room.isBlocked)}
                  className={`flex-1 py-2 text-sm rounded-md flex items-center justify-center gap-1 ${
                    room.isBlocked 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {room.isBlocked ? (
                    <>
                      <HiLockOpen className="w-4 h-4" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <HiLockClosed className="w-4 h-4" />
                      Block
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  disabled={room.isOccupied}
                  title={room.isOccupied ? "Cannot delete occupied room" : "Delete room"}
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="font-poppins font-semibold text-lg">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g., 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-field"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    className="input-field"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.amenities.includes(amenity)
                          ? 'bg-secondary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter room description..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
