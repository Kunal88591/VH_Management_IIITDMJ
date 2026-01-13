import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI, bookingAPI } from '../services/api';
import { HiCalendar, HiUsers, HiDocumentText, HiPlus, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    checkInDate: '',
    checkInTime: '12:00',
    checkOutDate: '',
    checkOutTime: '12:00',
    numberOfGuests: 1,
    foodRequired: false,
    numberOfDays: 0,
    meals: [],
    additionalRequirements: '',
  });
  
  const [approvalDocument, setApprovalDocument] = useState(null);

  useEffect(() => {
    fetchRooms();
    const roomId = searchParams.get('room');
    if (roomId) {
      setSelectedRooms([roomId]);
    }
  }, [searchParams]);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll({ available: 'true' });
      setRooms(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoomToggle = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleMealChange = (dayIndex, mealType) => {
    setFormData(prev => {
      const meals = [...prev.meals];
      if (!meals[dayIndex]) {
        meals[dayIndex] = { breakfast: false, lunch: false, dinner: false };
      }
      meals[dayIndex][mealType] = !meals[dayIndex][mealType];
      return { ...prev, meals };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setApprovalDocument(file);
    }
  };

  const calculateNights = () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const selectedRoomData = rooms.filter(r => selectedRooms.includes(r._id));
    return selectedRoomData.reduce((sum, room) => sum + (room.pricePerNight * nights), 0);
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
          toast.error('Please fill in all guest details');
          return false;
        }
        return true;
      case 2:
        if (!formData.checkInDate || !formData.checkOutDate) {
          toast.error('Please select check-in and check-out dates');
          return false;
        }
        if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
          toast.error('Check-out date must be after check-in date');
          return false;
        }
        if (selectedRooms.length === 0) {
          toast.error('Please select at least one room');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!approvalDocument) {
      toast.error('Please upload approval document from competent authority');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      submitData.append('guestDetails', JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      }));
      
      submitData.append('roomIds', JSON.stringify(selectedRooms));
      submitData.append('checkInDate', formData.checkInDate);
      submitData.append('checkInTime', formData.checkInTime);
      submitData.append('checkOutDate', formData.checkOutDate);
      submitData.append('checkOutTime', formData.checkOutTime);
      submitData.append('numberOfGuests', formData.numberOfGuests);
      
      const foodRequirement = {
        required: formData.foodRequired,
        numberOfDays: formData.foodRequired ? formData.numberOfDays : 0,
        meals: formData.foodRequired ? formData.meals.map((meal, index) => ({
          date: new Date(new Date(formData.checkInDate).getTime() + index * 24 * 60 * 60 * 1000),
          ...meal
        })) : []
      };
      submitData.append('foodRequirement', JSON.stringify(foodRequirement));
      
      submitData.append('additionalRequirements', formData.additionalRequirements);
      submitData.append('approvalDocument', approvalDocument);

      const response = await bookingAPI.create(submitData);
      
      toast.success('Booking request submitted successfully!');
      navigate(`/booking-confirmation/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-bold text-slate-primary mb-2">
            Book Your Stay
          </h1>
          <p className="text-gray-600">
            Fill in the details to make a reservation request
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  step > s ? 'bg-secondary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Guest Details */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h2 className="font-poppins text-xl font-semibold text-slate-primary mb-6 flex items-center">
                  <HiUsers className="w-6 h-6 mr-2 text-secondary" />
                  Guest Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests *</label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleChange}
                      min="1"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field"
                      rows="2"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Stay Details */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <h2 className="font-poppins text-xl font-semibold text-slate-primary mb-6 flex items-center">
                  <HiCalendar className="w-6 h-6 mr-2 text-secondary" />
                  Stay Details
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                    <input
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                    <input
                      type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <p className="text-secondary font-semibold mb-4">
                    Duration: {nights} night{nights > 1 ? 's' : ''}
                  </p>
                )}

                <h3 className="font-semibold text-slate-primary mb-3">Select Rooms *</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      onClick={() => handleRoomToggle(room._id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRooms.includes(room._id)
                          ? 'border-secondary bg-secondary/5'
                          : 'border-gray-200 hover:border-secondary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Room {room.roomNumber}</p>
                          <p className="text-sm text-gray-600">{room.roomType} • {room.category}</p>
                          <p className="text-sm text-gray-500">Max {room.maxOccupancy} guests</p>
                        </div>
                        <p className="font-bold text-secondary">₹{room.pricePerNight}/night</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRooms.length > 0 && nights > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">
                      {selectedRooms.length} room{selectedRooms.length > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''}
                    </p>
                    <p className="text-xl font-bold text-secondary">
                      Estimated Total: ₹{calculateTotal()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Food & Documents */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h2 className="font-poppins text-xl font-semibold text-slate-primary mb-6 flex items-center">
                  <HiDocumentText className="w-6 h-6 mr-2 text-secondary" />
                  Food Requirements & Documents
                </h2>

                {/* Food Requirements */}
                <div className="mb-6">
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      name="foodRequired"
                      checked={formData.foodRequired}
                      onChange={handleChange}
                      className="w-5 h-5 text-secondary rounded mr-3"
                    />
                    <span className="font-medium">Food Required</span>
                  </label>

                  {formData.foodRequired && (
                    <div className="ml-8 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Days
                        </label>
                        <input
                          type="number"
                          name="numberOfDays"
                          value={formData.numberOfDays}
                          onChange={handleChange}
                          min="1"
                          max={nights}
                          className="input-field w-32"
                        />
                      </div>

                      {formData.numberOfDays > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Meal Selection:</p>
                          {Array.from({ length: parseInt(formData.numberOfDays) || 0 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm font-medium w-20">Day {index + 1}</span>
                              {['breakfast', 'lunch', 'dinner'].map((meal) => (
                                <label key={meal} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.meals[index]?.[meal] || false}
                                    onChange={() => handleMealChange(index, meal)}
                                    className="w-4 h-4 text-secondary rounded mr-2"
                                  />
                                  <span className="text-sm capitalize">{meal}</span>
                                </label>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Requirements */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Requirements / Comments
                  </label>
                  <textarea
                    name="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    placeholder="Any special requirements or comments..."
                  />
                </div>

                {/* Approval Document */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Document from Competent Authority *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="approval-doc"
                    />
                    <label htmlFor="approval-doc" className="cursor-pointer">
                      {approvalDocument ? (
                        <div className="flex items-center justify-center gap-2">
                          <HiDocumentText className="w-8 h-8 text-secondary" />
                          <span className="text-secondary font-medium">{approvalDocument.name}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setApprovalDocument(null); }}
                            className="text-red-500"
                          >
                            <HiX className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <HiPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload approval document</p>
                          <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Guest: {formData.fullName}</p>
                    <p>Check-in: {formData.checkInDate} at {formData.checkInTime}</p>
                    <p>Check-out: {formData.checkOutDate} at {formData.checkOutTime}</p>
                    <p>Rooms: {selectedRooms.length}</p>
                    <p>Guests: {formData.numberOfGuests}</p>
                    <p>Food: {formData.foodRequired ? 'Yes' : 'No'}</p>
                  </div>
                  <hr className="my-2" />
                  <p className="text-xl font-bold text-secondary">
                    Estimated Total: ₹{calculateTotal()}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="btn-primary ml-auto">
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary ml-auto flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Booking Request'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
