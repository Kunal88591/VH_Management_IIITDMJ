const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate invoice PDF for a booking
 * @param {Object} booking - Populated booking object
 * @param {string} outputPath - Path to save the PDF
 * @returns {Promise<string>} Path to generated PDF
 */
async function generateInvoicePDF(booking, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(outputPath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('IIIT DM JABALPUR', { align: 'center' });
            doc.fontSize(14).text("Visitor's Hostel", { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).text('INVOICE', { align: 'center', underline: true });
            doc.moveDown(1);

            // Invoice Details
            doc.fontSize(10);
            doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 50, doc.y);
            doc.text(`Booking ID: ${booking.bookingId}`, 50, doc.y);
            doc.text(`Category: ${booking.visitorCategory}`, 50, doc.y);
            doc.moveDown(1);

            // Guest Details
            doc.fontSize(12).text('Guest Details:', { underline: true });
            doc.fontSize(10).moveDown(0.3);

            if (booking.guests && booking.guests.length > 0) {
                booking.guests.forEach((guest, index) => {
                    doc.text(`${index + 1}. ${guest.fullName} (Age: ${guest.age})${guest.mobile ? ', Mobile: ' + guest.mobile : ''}`);
                });
            }
            doc.moveDown(1);

            // Booking Details
            doc.fontSize(12).text('Booking Details:', { underline: true });
            doc.fontSize(10).moveDown(0.3);
            doc.text(`Check-in: ${new Date(booking.checkInDate).toLocaleDateString('en-IN')} at ${booking.checkInTime}`);
            doc.text(`Check-out: ${new Date(booking.checkOutDate).toLocaleDateString('en-IN')} at ${booking.checkOutTime}`);
            doc.text(`Number of Guests: ${booking.numberOfGuests}`);
            doc.text(`Number of Rooms: ${booking.numberOfRooms}`);
            doc.moveDown(1);

            // Room Details
            doc.fontSize(12).text('Room Allocation:', { underline: true });
            doc.fontSize(10).moveDown(0.3);

            if (booking.rooms && booking.rooms.length > 0) {
                booking.rooms.forEach(room => {
                    const roomInfo = room.room || room;
                    doc.text(`• Room ${roomInfo.roomNumber || room.roomNumber} - ${roomInfo.roomType || room.roomType} ${room.isSuite ? '(Suite)' : ''}`);
                });
            }
            doc.moveDown(1);

            // Charges Table
            doc.fontSize(12).text('Charges Breakdown:', { underline: true });
            doc.moveDown(0.5);

            const tableTop = doc.y;
            const col1X = 50;
            const col2X = 400;

            // Table Header
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Description', col1X, tableTop);
            doc.text('Amount (₹)', col2X, tableTop);

            // Line under header
            doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let currentY = tableTop + 25;
            doc.font('Helvetica');

            // Room Charges
            doc.text('Room Charges', col1X, currentY);
            doc.text((booking.roomCharges || 0).toFixed(2), col2X, currentY);
            currentY += 20;

            // Meal Charges (if applicable)
            if (booking.mealRequirements && booking.mealRequirements.required) {
                doc.text('Meal Charges', col1X, currentY);
                doc.text((booking.mealCharges || 0).toFixed(2), col2X, currentY);
                currentY += 20;
            }

            // Line before total
            doc.moveTo(col1X, currentY).lineTo(550, currentY).stroke();
            currentY += 10;

            // Grand Total
            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('GRAND TOTAL', col1X, currentY);
            doc.text('₹ ' + (booking.totalAmount || 0).toFixed(2), col2X, currentY);

            // Footer
            doc.moveDown(3);
            doc.fontSize(10).font('Helvetica');
            doc.text('This is a computer-generated invoice.', { align: 'center' });
            doc.text('For any queries, please contact the Visitor Hostel Office.', { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate invoice data object (for frontend display)
 * @param {Object} booking - Booking object
 * @returns {Object} Invoice data
 */
function generateInvoiceData(booking) {
    return {
        invoiceDate: new Date().toISOString(),
        bookingId: booking.bookingId,
        category: booking.visitorCategory,
        guests: booking.guests,
        checkInDate: booking.checkInDate,
        checkInTime: booking.checkInTime,
        checkOutDate: booking.checkOutDate,
        checkOutTime: booking.checkOutTime,
        numberOfGuests: booking.numberOfGuests,
        numberOfRooms: booking.numberOfRooms,
        rooms: booking.rooms,
        charges: {
            roomCharges: booking.roomCharges || 0,
            mealCharges: booking.mealCharges || 0,
            totalAmount: booking.totalAmount || 0
        },
        mealRequired: booking.mealRequirements && booking.mealRequirements.required
    };
}

module.exports = {
    generateInvoicePDF,
    generateInvoiceData
};
