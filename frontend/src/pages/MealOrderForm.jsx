import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mealOrderAPI } from '../services/api';
import { HiPlus, HiMinus, HiCalendar, HiUser, HiPhone, HiClipboardList } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MEAL_RATES = {
  breakfast: 100,
  lunch: 150,
  dinner: 150,
  tea: 15,
  milk: 30,
  fullDay: 400
};

const MealOrderForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    personName: user?.name || '',
    mobile: user?.mobile || '',
    numberOfPersons: 1,
    startDate: '',
    numberOfDays: 1,
    additionalNotes: ''
  });

  const [meals, setMeals] = useState([
    { breakfast: 0, lunch: 0, dinner: 0, tea: 0, milk: 0 }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Adjust meals array when numberOfDays changes
    if (name === 'numberOfDays') {
      const days = Math.max(1, parseInt(value) || 1);
      setMeals(prev => {
        const updated = [...prev];
        while (updated.length < days) {
          updated.push({ breakfast: 0, lunch: 0, dinner: 0, tea: 0, milk: 0 });
        }
        return updated.slice(0, days);
      });
    }
  };

  const handleMealChange = (dayIndex, mealType, value) => {
    const val = Math.max(0, parseInt(value) || 0);
    setMeals(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], [mealType]: val };
      return updated;
    });
  };

  const handleCopyFirstDayToAll = () => {
    if (meals.length <= 1) return;
    const first = meals[0];
    setMeals(prev => prev.map(() => ({ ...first })));
    toast.success('Copied Day 1 meals to all days');
  };

  // Calculate total charges with bundle logic
  const calculateTotal = () => {
    let total = 0;
    meals.forEach(day => {
      const { breakfast = 0, lunch = 0, dinner = 0, tea = 0, milk = 0 } = day;
      const fullDaySets = Math.min(breakfast, lunch, dinner, tea);
      total += fullDaySets * MEAL_RATES.fullDay;
      total += (breakfast - fullDaySets) * MEAL_RATES.breakfast;
      total += (lunch - fullDaySets) * MEAL_RATES.lunch;
      total += (dinner - fullDaySets) * MEAL_RATES.dinner;
      total += (tea - fullDaySets) * MEAL_RATES.tea;
      total += milk * MEAL_RATES.milk;
    });
    return total;
  };

  const getDayTotal = (day) => {
    const { breakfast = 0, lunch = 0, dinner = 0, tea = 0, milk = 0 } = day;
    const fullDaySets = Math.min(breakfast, lunch, dinner, tea);
    let total = fullDaySets * MEAL_RATES.fullDay;
    total += (breakfast - fullDaySets) * MEAL_RATES.breakfast;
    total += (lunch - fullDaySets) * MEAL_RATES.lunch;
    total += (dinner - fullDaySets) * MEAL_RATES.dinner;
    total += (tea - fullDaySets) * MEAL_RATES.tea;
    total += milk * MEAL_RATES.milk;
    return total;
  };

  const hasMealsSelected = () => {
    return meals.some(day =>
      day.breakfast > 0 || day.lunch > 0 || day.dinner > 0 || day.tea > 0 || day.milk > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.personName.trim()) {
      return toast.error('Please enter your name');
    }
    if (!formData.mobile.trim() || formData.mobile.trim().length < 10) {
      return toast.error('Please enter a valid mobile number');
    }
    if (!formData.startDate) {
      return toast.error('Please select a start date');
    }
    if (!hasMealsSelected()) {
      return toast.error('Please select at least one meal');
    }

    setLoading(true);
    try {
      // Build meals with dates
      const startDate = new Date(formData.startDate);
      const mealsWithDates = meals.map((meal, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return { ...meal, date: date.toISOString() };
      });

      const payload = {
        personName: formData.personName.trim(),
        mobile: formData.mobile.trim(),
        numberOfPersons: parseInt(formData.numberOfPersons) || 1,
        meals: mealsWithDates,
        additionalNotes: formData.additionalNotes.trim()
      };

      const res = await mealOrderAPI.create(payload);
      toast.success('Meal order submitted successfully!');
      navigate('/my-meal-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit meal order');
    } finally {
      setLoading(false);
    }
  };

  const totalCharges = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-bold text-slate-primary">
            Meal Order Form
          </h1>
          <p className="text-gray-600 mt-2">
            Order meals without a room booking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-poppins text-lg font-semibold text-slate-primary mb-4 flex items-center">
              <HiUser className="w-5 h-5 mr-2 text-secondary" />
              Personal Details
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="personName"
                  value={formData.personName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="input-field pl-9"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Persons</label>
                <input
                  type="number"
                  name="numberOfPersons"
                  value={formData.numberOfPersons}
                  onChange={handleChange}
                  className="input-field"
                  min={1}
                  max={50}
                />
              </div>
            </div>
          </div>

          {/* Date & Duration */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-poppins text-lg font-semibold text-slate-primary mb-4 flex items-center">
              <HiCalendar className="w-5 h-5 mr-2 text-secondary" />
              Meal Date(s)
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  className="input-field"
                  min={1}
                  max={30}
                />
              </div>
            </div>
          </div>

          {/* Meal Selection Table */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-poppins text-lg font-semibold text-slate-primary mb-4 flex items-center">
              <HiClipboardList className="w-5 h-5 mr-2 text-secondary" />
              Select Meals
            </h2>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 text-sm">
              <strong>Tariff:</strong> Breakfast ₹100 | Lunch/Dinner ₹150 | Tea ₹15 | Milk ₹30
              <br />
              <span className="text-secondary font-semibold">Full Day Deal (B+L+D+T) = ₹400 only (Save ₹15/person)</span>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 font-medium">
                  <tr>
                    <th className="p-3 text-left border-b min-w-[120px]">
                      Day
                      {meals.length > 1 && (
                        <button
                          type="button"
                          onClick={handleCopyFirstDayToAll}
                          className="ml-2 text-xs bg-white border border-gray-300 rounded px-2 py-0.5 hover:bg-gray-50 text-secondary"
                        >
                          Copy Day 1 ↓
                        </button>
                      )}
                    </th>
                    <th className="p-3 text-center border-b">Breakfast<br /><span className="text-xs text-gray-500 font-normal">₹100</span></th>
                    <th className="p-3 text-center border-b">Lunch<br /><span className="text-xs text-gray-500 font-normal">₹150</span></th>
                    <th className="p-3 text-center border-b">Dinner<br /><span className="text-xs text-gray-500 font-normal">₹150</span></th>
                    <th className="p-3 text-center border-b">Tea<br /><span className="text-xs text-gray-500 font-normal">₹15</span></th>
                    <th className="p-3 text-center border-b">Milk<br /><span className="text-xs text-gray-500 font-normal">₹30</span></th>
                    <th className="p-3 text-center border-b">Day Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {meals.map((meal, dayIndex) => {
                    const dayDate = formData.startDate
                      ? new Date(new Date(formData.startDate).getTime() + dayIndex * 86400000)
                      : null;
                    return (
                      <tr key={dayIndex} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900 border-r bg-gray-50">
                          <div>Day {dayIndex + 1}</div>
                          {dayDate && (
                            <div className="text-xs text-gray-500">
                              {dayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          )}
                        </td>
                        {['breakfast', 'lunch', 'dinner', 'tea', 'milk'].map((type) => (
                          <td key={type} className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMealChange(dayIndex, type, (meal[type] || 0) - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold disabled:opacity-30"
                                disabled={!meal[type] || meal[type] === 0}
                              >
                                <HiMinus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-medium">{meal[type] || 0}</span>
                              <button
                                type="button"
                                onClick={() => handleMealChange(dayIndex, type, (meal[type] || 0) + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-secondary hover:bg-secondary/90 text-white font-bold"
                              >
                                <HiPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        ))}
                        <td className="p-3 text-center font-semibold text-gray-800 border-l bg-gray-50">
                          ₹{getDayTotal(meal).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes / Special Requirements
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Any dietary preferences, allergies, or special requests..."
            />
          </div>

          {/* Summary & Submit */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-poppins text-lg font-semibold text-slate-primary mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex justify-between">
                <span>Name</span>
                <span className="font-medium">{formData.personName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile</span>
                <span className="font-medium">{formData.mobile || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Persons</span>
                <span className="font-medium">{formData.numberOfPersons}</span>
              </div>
              <div className="flex justify-between">
                <span>Days</span>
                <span className="font-medium">{formData.numberOfDays}</span>
              </div>
              <div className="flex justify-between">
                <span>Start Date</span>
                <span className="font-medium">
                  {formData.startDate
                    ? new Date(formData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-'}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-slate-primary">
                <span>Total Meal Charges</span>
                <span className="text-secondary">₹{totalCharges.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasMealsSelected()}
              className="w-full btn-primary py-3 text-base flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                `Submit Meal Order (₹${totalCharges.toLocaleString()})`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealOrderForm;
