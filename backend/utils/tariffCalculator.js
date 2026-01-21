/**
 * Tariff Calculator for IIITDM Jabalpur Visitor Hostel
 * Implements category-based pricing as per official tariff rules
 */

// Room Tariff Matrix (per night)
const ROOM_TARIFF = {
    // Normal Rooms (Non-Suite)
    normal: {
        A: { Single: 0, Double: 1200 },
        B: { Single: 800, Double: 0 },
        C: { Single: 1000, Double: 1500 },
        D: { Single: 1800, Double: 1800 }
    },
    // Suite Rooms (independent of occupancy)
    suite: {
        A: 0,
        B: 2500,
        C: 2500,
        D: 2500
    }
};

// Meal Tariff (for staying guests)
const MEAL_TARIFF = {
    breakfast: 100,
    lunch: 150,
    dinner: 150,
    tea: 15,
    milk: 30,
    fullDay: 400 // Full day meal package
};

// Cancellation Charges (as percentage of one-day room rent)
const CANCELLATION_CHARGES = {
    moreThan7Days: 0,     // > 7 days before arrival: Nil
    within7Days: 0.25,    // Within 7 days: 25%
    sameDay: 0.50         // Same day/No-show: 50%
};

/**
 * Calculate room charges based on category, room type, and duration
 * @param {string} category - Visitor category (A/B/C/D)
 * @param {Array} rooms - Array of room objects with roomType and isSuite
 * @param {number} nights - Number of nights
 * @returns {number} Total room charges
 */
function calculateRoomCharges(category, rooms, nights) {
    if (!category || !rooms || !Array.isArray(rooms) || nights < 1) {
        throw new Error('Invalid parameters for room charge calculation');
    }

    let totalRoomCharges = 0;

    rooms.forEach(room => {
        const { roomType, isSuite } = room;
        let chargePerNight = 0;

        if (isSuite) {
            // Suite room pricing (independent of occupancy)
            chargePerNight = ROOM_TARIFF.suite[category] || 0;
        } else {
            // Normal room pricing (based on category and room type)
            const categoryTariff = ROOM_TARIFF.normal[category];
            if (categoryTariff) {
                chargePerNight = categoryTariff[roomType] || 0;
            }
        }

        totalRoomCharges += chargePerNight * nights;
    });

    return totalRoomCharges;
}

/**
 * Calculate meal charges based on meal selections
 * @param {Array} mealSelections - Array of daily meal objects with quantities
 * @returns {number} Total meal charges
 */
function calculateMealCharges(mealSelections) {
    if (!mealSelections || !Array.isArray(mealSelections)) {
        return 0;
    }

    let totalMealCharges = 0;

    mealSelections.forEach(dailyMeal => {
        const { breakfast = 0, lunch = 0, dinner = 0, tea = 0, milk = 0 } = dailyMeal;

        totalMealCharges += breakfast * MEAL_TARIFF.breakfast;
        totalMealCharges += lunch * MEAL_TARIFF.lunch;
        totalMealCharges += dinner * MEAL_TARIFF.dinner;
        totalMealCharges += tea * MEAL_TARIFF.tea;
        totalMealCharges += milk * MEAL_TARIFF.milk;
    });

    return totalMealCharges;
}

/**
 * Calculate cancellation charges based on timing
 * @param {Date} checkInDate - Scheduled check-in date
 * @param {Date} cancellationDate - Date of cancellation
 * @param {number} oneDayRoomCharge - Room charge for one day
 * @returns {number} Cancellation charge amount
 */
function calculateCancellationCharge(checkInDate, cancellationDate, oneDayRoomCharge) {
    if (!checkInDate || !cancellationDate || oneDayRoomCharge < 0) {
        return 0;
    }

    const checkIn = new Date(checkInDate);
    const cancellation = new Date(cancellationDate);

    // Calculate days difference
    const diffTime = checkIn - cancellation;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let chargePercentage = 0;

    if (diffDays > 7) {
        // More than 7 days before arrival
        chargePercentage = CANCELLATION_CHARGES.moreThan7Days;
    } else if (diffDays <= 7 && diffDays >= 1) {
        // Within 7 days before arrival
        chargePercentage = CANCELLATION_CHARGES.within7Days;
    } else {
        // Same day or after check-in date
        chargePercentage = CANCELLATION_CHARGES.sameDay;
    }

    return Math.round(oneDayRoomCharge * chargePercentage);
}

/**
 * Calculate total booking amount
 * @param {Object} booking - Booking object with category, rooms, nights, and meals
 * @returns {Object} Breakdown of charges
 */
function calculateTotalBookingCharges(booking) {
    const { visitorCategory, rooms, checkInDate, checkOutDate, mealRequirements } = booking;

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Calculate room charges
    const roomCharges = calculateRoomCharges(visitorCategory, rooms, nights);

    // Calculate meal charges
    let mealCharges = 0;
    if (mealRequirements && mealRequirements.required && mealRequirements.meals) {
        mealCharges = calculateMealCharges(mealRequirements.meals);
    }

    // Total
    const totalAmount = roomCharges + mealCharges;

    return {
        roomCharges,
        mealCharges,
        totalAmount,
        nights
    };
}

module.exports = {
    calculateRoomCharges,
    calculateMealCharges,
    calculateCancellationCharge,
    calculateTotalBookingCharges,
    ROOM_TARIFF,
    MEAL_TARIFF,
    CANCELLATION_CHARGES
};
