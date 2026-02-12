/**
 * Validation utilities for IIITDMJ VH Booking System
 * Implements category-specific validation rules as per institute policy
 * 
 * Category A - Director/Institute Guests: Director approval mandatory
 * Category B - Employees: Employee ID OR (Director approval + Guest ID)
 * Category C - Academic/Students: Student Roll & ID OR (Approval + Visitor ID)
 * Category D - Contractors: Approval + Visitor ID mandatory
 */

/**
 * Validate booking data based on visitor category
 * @param {Object} bookingData - Booking data to validate
 * @param {Object} files - Uploaded files (multer format)
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateBookingByCategory(bookingData, files = {}) {
    const errors = [];
    const { visitorCategory, bookingType, guests, employeeId, studentRollNumber, indenterAcceptance } = bookingData;

    // Common validations
    if (!visitorCategory || !['A', 'B', 'C', 'D'].includes(visitorCategory)) {
        errors.push('Valid visitor category (A/B/C/D) is required');
    }

    if (!bookingType || !['self', 'others'].includes(bookingType)) {
        errors.push('Booking type (self/others) is required');
    }

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
        errors.push('At least one guest is required');
    } else {
        // Validate each guest
        guests.forEach((guest, index) => {
            if (!guest.fullName || guest.fullName.trim() === '') {
                errors.push(`Guest ${index + 1}: Full name is required`);
            }
            if (guest.age === undefined || guest.age === null || guest.age < 0) {
                errors.push(`Guest ${index + 1}: Valid age is required`);
            }
        });

        // Mobile number validation
        // Rule: Booking for self → Booker's mobile is sufficient (user already has phone in profile)
        // Rule: Booking for others (booker not staying) → At least one guest mobile number mandatory
        if (bookingType === 'others') {
            // Booker not staying - at least one guest must have a mobile number
            const hasGuestMobile = guests.some(g => g.mobile && g.mobile.trim() !== '');
            if (!hasGuestMobile) {
                errors.push('At least one guest mobile number is required when booking for others');
            }
        }
        // If booking for self, booker's mobile (from user profile) is sufficient
    }

    // Indenter acceptance validation
    if (bookingData.indenterAcceptance !== true) {
        errors.push('You must accept responsibility for the visitor');
    }

    // Category-specific validations
    switch (visitorCategory) {
        case 'A':
            // Category A: Director's approval document mandatory
            if (!files.directorApproval && !bookingData.directorApproval) {
                errors.push('Category A: Director\'s approval document is mandatory');
            }
            break;

        case 'B':
            // Category B: Two scenarios
            // Scenario 1: Institute Employee - Employee ID mandatory, no documents
            // Scenario 2: Other guests - Director approval + Guest ID mandatory

            if (employeeId && employeeId.trim() !== '') {
                // Scenario 1: Employee - no additional validation needed
                // In production, you might validate against employee database
            } else {
                // Scenario 2: Other Category B guests
                if (!files.directorApproval && !bookingData.directorApproval) {
                    errors.push('Category B: Director\'s approval document is mandatory (for non-employees)');
                }
                if (!files.guestIdCard && !bookingData.guestIdCard) {
                    errors.push('Category B: Guest ID card is mandatory (for non-employees)');
                }
            }
            break;

        case 'C':
            // Category C: Two scenarios
            // Scenario 1: Student booking for parents - Student roll number + Student ID
            // Scenario 2: Other visitors - Approval + Visitor ID

            if (studentRollNumber && studentRollNumber.trim() !== '') {
                // Scenario 1: Student booking for parents/guardians
                if (!files.studentIdCard && !bookingData.studentIdCard) {
                    errors.push('Category C: Student ID card is mandatory');
                }
            } else {
                // Scenario 2: Other Category C visitors
                if (!files.directorApproval && !bookingData.directorApproval) {
                    errors.push('Category C: Approval document is mandatory (for non-students)');
                }
                if (!files.guestIdCard && !bookingData.guestIdCard) {
                    errors.push('Category C: Visitor ID card is mandatory (for non-students)');
                }
            }
            break;

        case 'D':
            // Category D: Approval document + Visitor ID mandatory
            if (!files.directorApproval && !bookingData.directorApproval) {
                errors.push('Category D: Approval document is mandatory');
            }
            if (!files.guestIdCard && !bookingData.guestIdCard) {
                errors.push('Category D: Visitor ID card is mandatory');
            }
            break;
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate room availability for dates
 * @param {Array} roomIds - Array of room IDs
 * @param {Date} checkInDate - Check-in date
 * @param {Date} checkOutDate - Check-out date
 * @param {string} excludeBookingId - Booking ID to exclude from check (for updates)
 * @param {Model} Booking - Mongoose Booking model
 * @returns {Promise<Object>} { available: boolean, conflictingRooms: Array }
 */
async function validateRoomAvailability(roomIds, checkInDate, checkOutDate, excludeBookingId, Booking) {
    const query = {
        'rooms.room': { $in: roomIds },
        status: { $in: ['Approved', 'Checked-In'] },
        $or: [
            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const overlappingBookings = await Booking.find(query);

    return {
        available: overlappingBookings.length === 0,
        conflictingBookings: overlappingBookings
    };
}

/**
 * Parse and validate meal requirements
 * @param {Object} mealRequirements - Meal requirements object
 * @returns {Object} Validated meal requirements
 */
function validateMealRequirements(mealRequirements) {
    if (!mealRequirements || !mealRequirements.required) {
        return { required: false, meals: [] };
    }

    const validatedMeals = (mealRequirements.meals || []).map(meal => ({
        date: meal.date,
        breakfast: Math.max(0, parseInt(meal.breakfast) || 0),
        lunch: Math.max(0, parseInt(meal.lunch) || 0),
        dinner: Math.max(0, parseInt(meal.dinner) || 0),
        tea: Math.max(0, parseInt(meal.tea) || 0),
        milk: Math.max(0, parseInt(meal.milk) || 0)
    }));

    return {
        required: true,
        meals: validatedMeals
    };
}

module.exports = {
    validateBookingByCategory,
    validateRoomAvailability,
    validateMealRequirements
};
