import { HiX, HiPrinter } from 'react-icons/hi';
import './Invoice.css';

const Invoice = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getCategoryName = (cat) => {
        const names = {
            'A': 'Category A - Director / Institute Guests',
            'B': 'Category B - Institute Employees & Related Guests',
            'C': 'Category C - Academic / Government / Student Visitors',
            'D': 'Category D - Contractors & Vendors'
        };
        return names[cat] || cat;
    };

    const handlePrint = () => {
        window.print();
    };

    // Calculate nights
    const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)) || 1;

    // Check if meals were opted
    const hasMeals = booking.mealRequirements && booking.mealRequirements.required && booking.mealCharges > 0;

    // Common Header Component
    const InvoiceHeader = ({ invoiceType }) => (
        <>
            <div className="invoice-header">
                <div className="header-with-logo">
                    <div className="logo-section">
                        <img
                            src="/images/iiitdmj-logo.png"
                            alt="IIITDMJ Logo"
                            className="institute-logo"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                    <div className="header-text">
                        <h1>IIIT DM JABALPUR</h1>
                        <h2>Visitor's Hostel</h2>
                        <p className="institute-details">Indian Institute of Information Technology, Design and Manufacturing</p>
                        <p className="institute-details">Dumna Airport Road, Jabalpur - 482005</p>
                    </div>
                </div>
            </div>
            <div className="invoice-title-section">
                <h3 className="invoice-title">{invoiceType}</h3>
            </div>
            <div className="invoice-info-grid">
                <div>
                    <p className="label">Invoice Date:</p>
                    <p className="value">{formatDate(booking.createdAt || new Date())}</p>
                </div>
                <div className="text-right">
                    <p className="label">Booking ID:</p>
                    <p className="value font-mono">{booking.bookingId}</p>
                </div>
                <div>
                    <p className="label">Visitor Category:</p>
                    <p className="value">{getCategoryName(booking.visitorCategory)}</p>
                </div>
                <div className="text-right">
                    <p className="label">Status:</p>
                    <p className="value">{booking.status}</p>
                </div>
            </div>
        </>
    );

    // Guest Details Component
    const GuestDetails = () => (
        <div className="invoice-section">
            <h4 className="section-title">Guest Details</h4>
            {booking.guests && booking.guests.length > 0 ? (
                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Mobile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {booking.guests.map((guest, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{guest.fullName}</td>
                                <td>{guest.age}</td>
                                <td>{guest.mobile || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>{booking.guestDetails?.fullName || 'N/A'}</p>
            )}
            <p className="mt-2"><strong>Number of Guests:</strong> {booking.numberOfGuests || booking.guests?.length || 1}</p>
        </div>
    );

    // Booking Period Component
    const BookingPeriod = () => (
        <div className="invoice-section">
            <h4 className="section-title">Booking Period</h4>
            <div className="grid-3">
                <div>
                    <p className="label">Check-In:</p>
                    <p className="value">{formatDate(booking.checkInDate)} at {booking.checkInTime}</p>
                </div>
                <div>
                    <p className="label">Check-Out:</p>
                    <p className="value">{formatDate(booking.checkOutDate)} at {booking.checkOutTime}</p>
                </div>
                <div>
                    <p className="label">Duration:</p>
                    <p className="value">{nights} Night{nights > 1 ? 's' : ''}</p>
                </div>
            </div>
        </div>
    );

    // Signature Section (Authorized Signatory + Guest)
    const SignatureSection = () => (
        <div className="signature-section-compact">
            <div className="signature-row">
                <div className="sig-box">
                    <div className="sig-line"></div>
                    <p className="sig-label">Authorized Signatory</p>
                    <p className="sig-title">VH In-Charge, IIITDM Jabalpur</p>
                </div>
                <div className="sig-box">
                    <div className="sig-line"></div>
                    <p className="sig-label">Guest Signature</p>
                </div>
            </div>
        </div>
    );

    // VH Bank Account Details Component (Compact inline format)
    const BankDetails = () => (
        <div className="bank-details-inline">
            <p><strong>Bank Details:</strong> VH PDPM IIITDMJ | A/C: 7109697292 | IFSC: IDIB000M694 | INDIAN BANK, Mehgawan</p>
        </div>
    );

    // Footer Component (Compact)
    const InvoiceFooter = () => (
        <div className="invoice-footer-compact">
            <BankDetails />
            <p className="footer-note">Computer-generated invoice. Contact: vh@iiitdmj.ac.in | +91 761-2794254</p>
        </div>
    );

    return (
        <div className="invoice-modal-overlay">
            <div className="invoice-modal-container">
                {/* Header - Hide on print */}
                <div className="invoice-modal-header no-print">
                    <h2 className="font-poppins font-semibold text-lg">
                        Invoice{hasMeals ? 's (Room + Meal)' : ' (Room)'}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="btn-outline py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <HiPrinter className="w-4 h-4" />
                            Print / Save PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* ==================== PAGE 1: ROOM INVOICE ==================== */}
                <div className="invoice-content invoice-page" id="room-invoice">
                    <InvoiceHeader invoiceType="ROOM ACCOMMODATION INVOICE" />
                    <GuestDetails />
                    <BookingPeriod />

                    {/* Room Details */}
                    <div className="invoice-section">
                        <h4 className="section-title">Room Details & Charges</h4>
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Type</th>
                                    <th className="text-right">Rate/Night</th>
                                    <th className="text-right">Nights</th>
                                    <th className="text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {booking.rooms && booking.rooms.map((room, idx) => (
                                    <tr key={idx}>
                                        <td>{room.roomNumber}</td>
                                        <td>{room.roomType} {room.isSuite && '(Suite)'}</td>
                                        <td className="text-right">₹{room.pricePerNight || 0}</td>
                                        <td className="text-right">{nights}</td>
                                        <td className="text-right">₹{(room.pricePerNight || 0) * nights}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Room Total & Payment */}
                    <div className="total-payment-section">
                        <div className="total-line">
                            <span>ROOM CHARGES TOTAL:</span>
                            <span className="amount">₹{(booking.roomCharges || 0).toLocaleString()}</span>
                        </div>
                        <div className="payment-status-line">
                            <span>Payment Status:</span>
                            <span className={`status-badge ${booking.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                                {booking.paymentStatus || 'Unpaid'}
                            </span>
                        </div>
                    </div>

                    <SignatureSection />
                    <InvoiceFooter />
                </div>

                {/* ==================== PAGE 2: MEAL INVOICE (Only if meals opted) ==================== */}
                {hasMeals && (
                    <div className="invoice-content invoice-page page-break-before" id="meal-invoice">
                        <InvoiceHeader invoiceType="MEAL / FOOD CHARGES INVOICE" />
                        <GuestDetails />
                        <BookingPeriod />

                        {/* Meal Details */}
                        <div className="invoice-section">
                            <h4 className="section-title">Meal Details & Charges</h4>
                            <table className="invoice-table meal-table">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th className="text-center">Breakfast<br/><small>₹100</small></th>
                                        <th className="text-center">Lunch<br/><small>₹150</small></th>
                                        <th className="text-center">Dinner<br/><small>₹150</small></th>
                                        <th className="text-center">Tea<br/><small>₹15</small></th>
                                        <th className="text-center">Milk<br/><small>₹30</small></th>
                                        <th className="text-right">Day Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {booking.mealRequirements.meals && booking.mealRequirements.meals.map((meal, idx) => {
                                        const dayTotal = ((meal.breakfast || 0) * 100) + ((meal.lunch || 0) * 150) + 
                                                        ((meal.dinner || 0) * 150) + ((meal.tea || 0) * 15) + ((meal.milk || 0) * 30);
                                        return (
                                            <tr key={idx}>
                                                <td className="font-medium">Day {idx + 1}</td>
                                                <td className="text-center">
                                                    {meal.breakfast || 0}
                                                    {meal.breakfast > 0 && <small className="block text-gray-500">₹{(meal.breakfast || 0) * 100}</small>}
                                                </td>
                                                <td className="text-center">
                                                    {meal.lunch || 0}
                                                    {meal.lunch > 0 && <small className="block text-gray-500">₹{(meal.lunch || 0) * 150}</small>}
                                                </td>
                                                <td className="text-center">
                                                    {meal.dinner || 0}
                                                    {meal.dinner > 0 && <small className="block text-gray-500">₹{(meal.dinner || 0) * 150}</small>}
                                                </td>
                                                <td className="text-center">
                                                    {meal.tea || 0}
                                                    {meal.tea > 0 && <small className="block text-gray-500">₹{(meal.tea || 0) * 15}</small>}
                                                </td>
                                                <td className="text-center">
                                                    {meal.milk || 0}
                                                    {meal.milk > 0 && <small className="block text-gray-500">₹{(meal.milk || 0) * 30}</small>}
                                                </td>
                                                <td className="text-right font-semibold">₹{dayTotal}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <p className="tariff-note">
                                <strong>Tariff:</strong> Breakfast ₹100 | Lunch ₹150 | Dinner ₹150 | Tea ₹15 | Milk ₹30/glass<br/>
                                <strong>Full Day Meal (B+L+D+T):</strong> ₹400 only
                            </p>
                        </div>

                        {/* Meal Total & Payment */}
                        <div className="total-payment-section">
                            <div className="total-line">
                                <span>MEAL CHARGES TOTAL:</span>
                                <span className="amount">₹{(booking.mealCharges || 0).toLocaleString()}</span>
                            </div>
                            <div className="payment-status-line">
                                <span>Payment Status:</span>
                                <span className={`status-badge ${booking.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                                    {booking.paymentStatus || 'Unpaid'}
                                </span>
                            </div>
                        </div>

                        <SignatureSection />
                        <InvoiceFooter />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoice;
