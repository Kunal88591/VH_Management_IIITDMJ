import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI, bookingAPI } from '../services/api';
import { HiCalendar, HiUsers, HiDocumentText, HiPlus, HiX, HiInformationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
const CATEGORIES = {
  A: {
    name: 'Category A',
    title: 'Director / Institute Guests',
    description: 'Institute Guests, Director, Examiners, External Committee Members, Invited Speakers, CAG Audit Team, MoE Officials, Important guests of Chairman (BOG), Director, Senate, BWC, or Statutory Bodies',
    tariffNote: 'Room charges: Free | Meal charges: Applicable (if opted)',
    requirements: 'Director\'s approval document required'
  },
  B: {
    name: 'Category B',
    title: 'Institute Employees & Related Guests',
    description: 'Institute employees and dependents, Project employees and dependents, Retired IIITDMJ faculty/staff/alumni, Relatives/guests of IIITDMJ faculty and staff, Other guests approved by Director',
    tariffNote: 'Single: ₹800 | Double: ₹1000 (Normal) | Suite: ₹2500',
    requirements: 'Employee ID OR (Approval + Guest ID Card) required'
  },
  C: {
    name: 'Category C',
    title: 'Academic / Government / Student Visitors',
    description: 'Employees of IITs/IIITs/CFTIs/Universities/PSUs, Parents/Guardians/Spouse of IIITDMJ students, Government/public-sector visitors, Trainees attending institute programs, Other guests approved by Director',
    tariffNote: 'Single: ₹1200 | Double: ₹1500 (Normal) | Suite: ₹2500',
    requirements: 'Student Roll+ID OR (Approval + Visitor ID) required'
  },
  D: {
    name: 'Category D',
    title: 'Contractors & Vendors',
    description: 'Contractors, vendors, and firm representatives visiting for official work such as meetings or presentations',
    tariffNote: 'Single: ₹1800 | Double: ₹2000 (Normal) | Suite: ₹2500',
    requirements: 'Approval + Visitor ID Card both required'
  }
};
const SUBCATEGORIES = {
  A: [
    { value: 'A-i', label: 'Institute Guests / Directors / Examiners / External Committee Members / Invited Speakers / CAG Audit Team / MoE Officials / Important guests of Chairman, BOG / Director / Senate / BWC / Statutory Bodies' },
    { value: 'A-ii', label: 'Other Institute guests not covered above (Approved by Director)' }
  ],
  B: [
    { value: 'B-i', label: 'Institute employee & their dependents' },
    { value: 'B-ii', label: 'Project employee & their dependents' },
    { value: 'B-iii', label: 'Retired IIITDMJ Faculty / Staff / Alumni' },
    { value: 'B-iv', label: 'Relatives / Guests of IIITDMJ Faculty & Staff' },
    { value: 'B-v', label: 'Other than Institute employees staying for Institute work' },
    { value: 'B-vi', label: 'Any other Guest (Approved by the Director)' }
  ],
  C: [
    { value: 'C-i', label: 'Employees of other IIITs / IITs / Centrally funded engineering colleges / Universities / PSUs' },
    { value: 'C-ii', label: 'Parents / Guardian / Spouse of IIITDMJ students' },
    { value: 'C-iii', label: 'Visitors of government / public sector organization' },
    { value: 'C-iv', label: 'Trainees coming to the Institute under programmes organized by the Institute' },
    { value: 'C-v', label: 'Others (Approved by the Director)' },
    { value: 'C-vi', label: 'Guest of State / Central or other Governments (not Institute guest)' }
  ],
  D: [
    { value: 'D-i', label: 'Contractors, representatives of firms, vendors etc. coming for work viz. meeting, presentations etc.' }
  ]
};

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  const [formData, setFormData] = useState({
    visitorCategory: '',
    visitorSubCategory: '',
    bookingType: 'self',
    guests: [{ fullName: user?.name || '', age: '', mobile: '' }],
    numberOfGuests: 1,
    employeeId: '',
    studentRollNumber: '',
    checkInDate: '',
    checkInTime: '12:00',
    checkOutDate: '',
    checkOutTime: '12:00',
    mealRequired: false,
    meals: [],
    additionalRequirements: '',
    indenterAcceptance: false
  });

  const [documents, setDocuments] = useState({
    directorApproval: null,
    guestIdCard: null,
    studentIdCard: null
  });

  useEffect(() => {
    fetchRooms();
    const roomId = searchParams.get('room');
    if (roomId) {
      setSelectedRooms([roomId]);
    }
  }, [searchParams]);
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      fetchRooms();
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const fetchRooms = async () => {
    try {
      const params = { available: 'true' };
      if (formData.checkInDate && formData.checkOutDate) {
        params.checkIn = formData.checkInDate;
        params.checkOut = formData.checkOutDate;
      }
      
      const response = await roomAPI.getAll(params);
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

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...formData.guests];
    updatedGuests[index][field] = value;
    setFormData(prev => ({ ...prev, guests: updatedGuests }));
  };

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { fullName: '', age: '', mobile: '' }]
    }));
  };

  const removeGuest = (index) => {
    if (formData.guests.length > 1) {
      const updatedGuests = formData.guests.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, guests: updatedGuests }));
    }
  };

  const handleRoomToggle = (roomId) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleMealChange = (dayIndex, mealType, value) => {
    setFormData(prev => {
      const meals = [...prev.meals];
      if (!meals[dayIndex]) {
        meals[dayIndex] = { breakfast: 0, lunch: 0, dinner: 0, tea: 0, milk: 0 };
      }
      meals[dayIndex][mealType] = parseInt(value) || 0;
      return { ...prev, meals };
    });
  };

  const handleCopyFirstDayToAll = () => {
    if (!formData.meals || formData.meals.length === 0) return;

    const firstDay = formData.meals[0];
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.map(() => ({ ...firstDay }))
    }));
    toast.success('Day 1 meal selection copied to all days');
  };

  const handleFileChange = (documentType, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setDocuments(prev => ({ ...prev, [documentType]: file }));
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
  useEffect(() => {
    const nights = calculateNights();
    if (nights > 0 && formData.mealRequired) {
      const meals = Array.from({ length: nights }, () => ({
        breakfast: 0, lunch: 0, dinner: 0, tea: 0, milk: 0
      }));
      setFormData(prev => ({ ...prev, meals }));
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.mealRequired]);

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.visitorCategory) {
          toast.error('Please select a visitor category');
          return false;
        }
        if (!formData.visitorSubCategory) {
          toast.error('Please select a visitor sub-category');
          return false;
        }
        if (!formData.bookingType) {
          toast.error('Please select booking type');
          return false;
        }
        if (formData.guests.length === 0) {
          toast.error('At least one guest is required');
          return false;
        }

        for (let i = 0; i < formData.guests.length; i++) {
          const guest = formData.guests[i];
          if (!guest.fullName || guest.fullName.trim() === '') {
            toast.error(`Guest ${i + 1}: Full name is required`);
            return false;
          }
          if (!guest.age || guest.age < 0) {
            toast.error(`Guest ${i + 1}: Valid age is required`);
            return false;
          }
        }
        if (formData.bookingType === 'others') {
          const hasGuestMobile = formData.guests.some(g => g.mobile && g.mobile.trim() !== '');
          if (!hasGuestMobile) {
            toast.error('At least one guest mobile number is required when booking for others');
            return false;
          }
        }
        const { visitorCategory, employeeId, studentRollNumber } = formData;

        if (visitorCategory === 'A') {
          if (!documents.directorApproval) {
            toast.error('Category A: Director\'s approval document is mandatory');
            return false;
          }
        } else if (visitorCategory === 'B') {
          if (!employeeId || employeeId.trim() === '') {
            if (!documents.directorApproval || !documents.guestIdCard) {
              toast.error('Category B: For non-employees, both Director approval and Guest ID are required');
              return false;
            }
          }
        } else if (visitorCategory === 'C') {
          if (studentRollNumber && studentRollNumber.trim() !== '') {
            if (!documents.studentIdCard) {
              toast.error('Category C: Student ID card is mandatory');
              return false;
            }
          } else {
            if (!documents.directorApproval || !documents.guestIdCard) {
              toast.error('Category C: For non-students, both Approval document and Visitor ID are required');
              return false;
            }
          }
        } else if (visitorCategory === 'D') {
          if (!documents.directorApproval || !documents.guestIdCard) {
            toast.error('Category D: Both Approval document and Visitor ID are required');
            return false;
          }
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

      case 3:
        if (!formData.indenterAcceptance) {
          toast.error('You must accept responsibility for the visitor');
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

    if (!validateStep(step)) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('visitorCategory', formData.visitorCategory);
      submitData.append('visitorSubCategory', formData.visitorSubCategory);
      submitData.append('bookingType', formData.bookingType);
      submitData.append('guests', JSON.stringify(formData.guests));
      submitData.append('numberOfGuests', formData.guests.length);
      submitData.append('indenterAcceptance', formData.indenterAcceptance);
      if (formData.employeeId) submitData.append('employeeId', formData.employeeId);
      if (formData.studentRollNumber) submitData.append('studentRollNumber', formData.studentRollNumber);
      submitData.append('roomIds', JSON.stringify(selectedRooms));
      submitData.append('checkInDate', formData.checkInDate);
      submitData.append('checkInTime', formData.checkInTime);
      submitData.append('checkOutDate', formData.checkOutDate);
      submitData.append('checkOutTime', formData.checkOutTime);
      const mealRequirements = {
        required: formData.mealRequired,
        meals: formData.mealRequired ? formData.meals.map((meal, index) => ({
          date: new Date(new Date(formData.checkInDate).getTime() + index * 24 * 60 * 60 * 1000),
          ...meal
        })) : []
      };
      submitData.append('mealRequirements', JSON.stringify(mealRequirements));
      submitData.append('additionalRequirements', formData.additionalRequirements);
      if (documents.directorApproval) {
        submitData.append('directorApproval', documents.directorApproval);
      }
      if (documents.guestIdCard) {
        submitData.append('guestIdCard', documents.guestIdCard);
      }
      if (documents.studentIdCard) {
        submitData.append('studentIdCard', documents.studentIdCard);
      }

      const response = await bookingAPI.create(submitData);

      toast.success('Booking request submitted successfully!');
      navigate(`/booking-confirmation/${response.data.data._id}`);
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-gray-50 py-4 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <h1 className="font-poppins text-2xl font-bold text-slate-primary mb-1">
            Book Your Stay - IIITDM Jabalpur VH
          </h1>
          <p className="text-sm text-gray-600">
            Fill in the details to make a reservation request
          </p>
        </div>

        {}
        <div className="flex items-center justify-center mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-secondary' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-4">
          <form onSubmit={handleSubmit}>
            {}
            {step === 1 && (
              <div className="animate-fadeIn space-y-4">
                <div>
                  <h2 className="font-poppins text-lg font-semibold text-slate-primary mb-3 flex items-center">
                    <HiInformationCircle className="w-5 h-5 mr-2 text-secondary" />
                    Visitor Category & Type
                  </h2>

                  {}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Category *</label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {Object.entries(CATEGORIES).map(([key, cat]) => (
                        <div
                          key={key}
                          onClick={() => setFormData(prev => ({ ...prev, visitorCategory: key, visitorSubCategory: '' }))}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.visitorCategory === key
                            ? 'border-secondary bg-secondary/5 shadow-lg'
                            : 'border-gray-200 hover:border-secondary/50'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg">{cat.name}</h3>
                            <input
                              type="radio"
                              checked={formData.visitorCategory === key}
                              onChange={() => { }}
                              className="mt-1 w-5 h-5 text-secondary"
                            />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{cat.title}</p>
                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">{cat.description}</p>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-secondary font-bold mb-1">{cat.tariffNote}</p>
                            <p className="text-xs text-gray-500 italic">📋 {cat.requirements}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {}
                  {formData.visitorCategory && SUBCATEGORIES[formData.visitorCategory] && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Sub-Category *</label>
                      <select
                        name="visitorSubCategory"
                        value={formData.visitorSubCategory}
                        onChange={handleChange}
                        className="input-field w-full"
                        required
                      >
                        <option value="">-- Select Sub-Category --</option>
                        {SUBCATEGORIES[formData.visitorCategory].map((sub) => (
                          <option key={sub.value} value={sub.value}>{sub.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="bookingType"
                          value="self"
                          checked={formData.bookingType === 'self'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Self (I am staying)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="bookingType"
                          value="others"
                          checked={formData.bookingType === 'others'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>For Others (I am not staying)</span>
                      </label>
                    </div>
                  </div>

                  {}
                  {formData.visitorCategory === 'B' && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID (Optional - For Institute Employees)
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="input-field max-w-md"
                        placeholder="Enter your employee ID"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        If you are an institute employee, provide your ID. Otherwise, upload approval and ID documents below.
                      </p>
                    </div>
                  )}

                  {formData.visitorCategory === 'C' && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Roll Number (Optional - For Students Booking for Parents/Guardians)
                      </label>
                      <input
                        type="text"
                        name="studentRollNumber"
                        value={formData.studentRollNumber}
                        onChange={handleChange}
                        className="input-field max-w-md"
                        placeholder="Enter student roll number"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        If you are a student booking for your parents/guardians, provide your roll number and upload your student ID below.
                      </p>
                    </div>
                  )}
                </div>

                {}
                <div>
                  <h2 className="font-poppins text-xl font-semibold text-slate-primary mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <HiUsers className="w-6 h-6 mr-2 text-secondary" />
                      Guest Information
                    </span>
                    <button
                      type="button"
                      onClick={addGuest}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      <HiPlus className="inline w-4 h-4 mr-1" /> Add Guest
                    </button>
                  </h2>

                  <div className="space-y-4">
                    {formData.guests.map((guest, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Guest {index + 1}</h3>
                          {formData.guests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGuest(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <HiX className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={guest.fullName}
                              onChange={(e) => handleGuestChange(index, 'fullName', e.target.value)}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Age *
                            </label>
                            <input
                              type="number"
                              value={guest.age}
                              onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                              className="input-field"
                              min="0"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mobile {formData.bookingType === 'others' && index === 0 ? '*' : ''}
                            </label>
                            <input
                              type="tel"
                              value={guest.mobile}
                              onChange={(e) => handleGuestChange(index, 'mobile', e.target.value)}
                              className="input-field"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div>
                  <h2 className="font-poppins text-xl font-semibold text-slate-primary mb-4 flex items-center">
                    <HiDocumentText className="w-6 h-6 mr-2 text-secondary" />
                    Required Documents
                  </h2>

                  <div className="space-y-4">
                    {}
                    {(formData.visitorCategory === 'A' ||
                      (formData.visitorCategory === 'B' && !formData.employeeId) ||
                      (formData.visitorCategory === 'C' && !formData.studentRollNumber) ||
                      formData.visitorCategory === 'D') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Director's Approval / Approval Document *
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('directorApproval', e.target.files[0])}
                            className="input-field"
                          />
                          {documents.directorApproval && (
                            <p className="text-sm text-green-600 mt-1">✓ {documents.directorApproval.name}</p>
                          )}
                        </div>
                      )}

                    {}
                    {((formData.visitorCategory === 'B' && !formData.employeeId) ||
                      (formData.visitorCategory === 'C' && !formData.studentRollNumber) ||
                      formData.visitorCategory === 'D') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Guest / Visitor ID Card *
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('guestIdCard', e.target.files[0])}
                            className="input-field"
                          />
                          {documents.guestIdCard && (
                            <p className="text-sm text-green-600 mt-1">✓ {documents.guestIdCard.name}</p>
                          )}
                        </div>
                      )}

                    {}
                    {formData.visitorCategory === 'C' && formData.studentRollNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID Card *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('studentIdCard', e.target.files[0])}
                          className="input-field"
                        />
                        {documents.studentIdCard && (
                          <p className="text-sm text-green-600 mt-1">✓ {documents.studentIdCard.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {}
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
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedRooms.includes(room._id)
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
              </div>
            )}

            {}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h2 className="font-poppins text-xl font-semibold text-slate-primary mb-6 flex items-center">
                  <HiDocumentText className="w-6 h-6 mr-2 text-secondary" />
                  Meal Requirements & Confirmation
                </h2>

                {}
                <div className="mb-6">
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      name="mealRequired"
                      checked={formData.mealRequired}
                      onChange={handleChange}
                      className="w-5 h-5 text-secondary rounded mr-3"
                    />
                    <span className="font-medium">Meal Required</span>
                  </label>

                  {formData.mealRequired && nights > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 bg-blue-50 p-2 rounded border border-blue-100 mb-2">
                        <strong>💡 Tariff:</strong> Breakfast ₹100 | Lunch/Dinner ₹150 | Tea ₹15 | Milk ₹30 <br />
                        <span className="text-secondary font-bold">✨ Full Day Meal Deal (B+L+D+T) = ₹400 only (Save ₹15/person)</span>
                      </p>
                      <div className="overflow-x-auto border rounded-lg max-h-72 overflow-y-auto relative">
                        <table className="w-full text-sm text-left relative">
                          <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="p-3 border-b bg-gray-100 min-w-[100px]">
                                Day &nbsp;
                                {nights > 1 && (
                                  <button
                                    type="button"
                                    onClick={handleCopyFirstDayToAll}
                                    className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 hover:bg-gray-50 text-secondary whitespace-nowrap"
                                    title="Copy Day 1 selection to all days"
                                  >
                                    Copy Day 1 ↓
                                  </button>
                                )}
                              </th>
                              <th className="p-3 border-b text-center">B'fast<br /><span className="text-xs text-gray-500">₹100</span></th>
                              <th className="p-3 border-b text-center">Lunch<br /><span className="text-xs text-gray-500">₹150</span></th>
                              <th className="p-3 border-b text-center">Dinner<br /><span className="text-xs text-gray-500">₹150</span></th>
                              <th className="p-3 border-b text-center">Tea<br /><span className="text-xs text-gray-500">₹15</span></th>
                              <th className="p-3 border-b text-center">Milk<br /><span className="text-xs text-gray-500">₹30</span></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formData.meals.map((meal, index) => (
                              <tr key={index} className="bg-white hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-900 border-r bg-gray-50">
                                  Day {index + 1}
                                </td>
                                {['breakfast', 'lunch', 'dinner', 'tea', 'milk'].map((mealType) => (
                                  <td key={mealType} className="p-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleMealChange(index, mealType, Math.max(0, (meal[mealType] || 0) - 1))}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold disabled:opacity-30 text-xs"
                                        disabled={!meal[mealType] || meal[mealType] === 0}
                                      >
                                        −
                                      </button>
                                      <span className="w-6 text-center font-medium">
                                        {meal[mealType] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleMealChange(index, mealType, (meal[mealType] || 0) + 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/90 text-white font-bold text-xs"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {}
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

                {}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="indenterAcceptance"
                      checked={formData.indenterAcceptance}
                      onChange={handleChange}
                      className="w-5 h-5 text-secondary rounded mr-3 mt-1 flex-shrink-0"
                      required
                    />
                    <span className="text-sm">
                      <strong className="text-red-600">⚠️ Indenter Responsibility: *</strong><br />
                      I take responsibility for the genuineness of the visitor, their behavior, and any damages during the stay, as per Visitor Hostel rules.
                    </span>
                  </label>
                </div>

                {}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-800">📋 Cancellation Policy:</h4>
                  <ul className="text-xs text-gray-700 space-y-1 ml-4">
                    <li>• Cancellation &gt;7 days before arrival: <strong className="text-green-600">Nil charges</strong></li>
                    <li>• Cancellation within 7 days: <strong className="text-orange-600">25% of one-day room rent</strong></li>
                    <li>• Same-day cancellation / No-show: <strong className="text-red-600">50% of one-day room rent</strong></li>
                  </ul>
                </div>

                {}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Booking Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Category:</strong> {CATEGORIES[formData.visitorCategory]?.name}</p>
                    {formData.visitorSubCategory && (
                      <p><strong>Sub-Category:</strong> {SUBCATEGORIES[formData.visitorCategory]?.find(s => s.value === formData.visitorSubCategory)?.label}</p>
                    )}
                    <p><strong>Booking Type:</strong> {formData.bookingType === 'self' ? 'Self' : 'For Others'}</p>
                    <p><strong>Guests:</strong> {formData.guests.length}</p>
                    <p><strong>Check-in:</strong> {formData.checkInDate} at {formData.checkInTime}</p>
                    <p><strong>Check-out:</strong> {formData.checkOutDate} at {formData.checkOutTime}</p>
                    <p><strong>Rooms:</strong> {selectedRooms.length}</p>
                    <p><strong>Meals:</strong> {formData.mealRequired ? 'Yes' : 'No'}</p>
                  </div>
                  <hr className="my-3" />
                  <p className="text-sm text-gray-600">
                    Final charges will be calculated based on your category and selections.
                  </p>
                </div>
              </div>
            )}

            {}
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
