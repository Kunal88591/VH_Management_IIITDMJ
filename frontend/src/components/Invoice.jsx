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

    return (
        <div className="invoice-modal-overlay">
            <div className="invoice-modal-container">
                {/* Header - Hide on print */}
                <div className="invoice-modal-header no-print">
                    <h2 className="font-poppins font-semibold text-lg">Invoice</h2>
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

                {/* Invoice Content - Printable */}
                <div className="invoice-content" id="printable-invoice">
                    {/* Institute Header */}
                    <div className="invoice-header">
                        <div className="header-with-logo">
                            <div className="logo-section">
                                <img
                                    src="/images/iiitdmj-logo.png"
                                    alt="IIITDMJ Logo"
                                    className="institute-logo"
                                    onError={(e) => {
                                        console.error('Logo failed to load:', e.target.src);
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={() => console.log('Logo loaded successfully')}
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

                    {/* Invoice Title */}
                    <div className="invoice-title-section">
                        <h3 className="invoice-title">INVOICE</h3>
                    </div>

                    {/* Invoice Details */}
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

                    {/* Guest Details */}
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

                    {/* Booking Period */}
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

                    {/* Room Details */}
                    <div className="invoice-section">
                        <h4 className="section-title">Room Details</h4>
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Type</th>
                                    <th className="text-right">Rate/Night</th>
                                    <th className="text-right">Nights</th>
                                    <th className="text-right">Amount</th>
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
                                <tr className="total-row">
                                    <td colSpan="4" className="text-right"><strong>Room Charges Total:</strong></td>
                                    <td className="text-right"><strong>₹{booking.roomCharges || 0}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Meal Details */}
                    {booking.mealRequirements && booking.mealRequirements.required && (
                        <div className="invoice-section">
                            <h4 className="section-title">Meal Details</h4>
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th className="text-right">Breakfast</th>
                                        <th className="text-right">Lunch</th>
                                        <th className="text-right">Dinner</th>
                                        <th className="text-right">Tea</th>
                                        <th className="text-right">Milk</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {booking.mealRequirements.meals && booking.mealRequirements.meals.map((meal, idx) => {
                                        const dayTotal = (meal.breakfast * 100) + (meal.lunch * 150) + (meal.dinner * 150) + (meal.tea * 15) + (meal.milk * 30);
                                        return (
                                            <tr key={idx}>
                                                <td>Day {idx + 1}</td>
                                                <td className="text-right">{meal.breakfast || 0} (₹{meal.breakfast * 100})</td>
                                                <td className="text-right">{meal.lunch || 0} (₹{meal.lunch * 150})</td>
                                                <td className="text-right">{meal.dinner || 0} (₹{meal.dinner * 150})</td>
                                                <td className="text-right">{meal.tea || 0} (₹{meal.tea * 15})</td>
                                                <td className="text-right">{meal.milk || 0} (₹{meal.milk * 30})</td>
                                                <td className="text-right">₹{dayTotal}</td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="total-row">
                                        <td colSpan="6" className="text-right"><strong>Meal Charges Total:</strong></td>
                                        <td className="text-right"><strong>₹{booking.mealCharges || 0}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="tariff-note">Tariff: Breakfast ₹100, Lunch/Dinner ₹150, Tea ₹15, Milk ₹30</p>
                        </div>
                    )}

                    {/* Grand Total */}
                    <div className="grand-total-section">
                        <div className="total-container">
                            <div className="total-row-item">
                                <span>Room Charges:</span>
                                <span>₹{booking.roomCharges || 0}</span>
                            </div>
                            <div className="total-row-item">
                                <span>Meal Charges:</span>
                                <span>₹{booking.mealCharges || 0}</span>
                            </div>
                            <div className="grand-total-row">
                                <span><strong>GRAND TOTAL:</strong></span>
                                <span><strong>₹{booking.totalAmount || 0}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary Section */}
                    <div className="invoice-section" style={{ borderTop: '2px solid #ddd', marginTop: '20px', paddingTop: '20px' }}>
                        <h4 className="section-title">Payment Summary</h4>
                        <div className="total-container" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                            <div className="total-row-item" style={{ padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                                <span><strong>Grand Total:</strong></span>
                                <span><strong>₹{(booking.totalAmount || 0).toLocaleString()}</strong></span>
                            </div>
                            <div className="total-row-item" style={{ padding: '8px 0', color: booking.amountPaid > 0 ? '#28a745' : '#6c757d' }}>
                                <span>Amount Paid:</span>
                                <span>₹{(booking.amountPaid || 0).toLocaleString()}</span>
                            </div>
                            {booking.paymentStatus === 'Partially Paid' && (
                                <div className="total-row-item" style={{ padding: '8px 0', borderTop: '2px solid #ffc107', color: '#dc3545', fontSize: '18px', fontWeight: 'bold' }}>
                                    <span><strong>Amount Remaining:</strong></span>
                                    <span><strong>₹{((booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString()}</strong></span>
                                </div>
                            )}
                            <div className="total-row-item" style={{ padding: '8px 0', borderTop: '1px solid #dee2e6', marginTop: '8px' }}>
                                <span>Payment Status:</span>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    backgroundColor: booking.paymentStatus === 'Paid' ? '#d4edda' :
                                        booking.paymentStatus === 'Partially Paid' ? '#fff3cd' : '#f8d7da',
                                    color: booking.paymentStatus === 'Paid' ? '#155724' :
                                        booking.paymentStatus === 'Partially Paid' ? '#856404' : '#721c24',
                                    fontWeight: 'bold'
                                }}>
                                    {booking.paymentStatus || 'Unpaid'}
                                </span>
                            </div>
                            {booking.paymentDate && (
                                <div className="total-row-item" style={{ padding: '8px 0' }}>
                                    <span>Payment Date:</span>
                                    <span>{formatDate(booking.paymentDate)}</span>
                                </div>
                            )}
                            {booking.paymentMethod && (
                                <div className="total-row-item" style={{ padding: '8px 0' }}>
                                    <span>Payment Method:</span>
                                    <span>{booking.paymentMethod}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="invoice-footer">
                        <p className="footer-text"><strong>This is a computer-generated invoice.</strong></p>
                        <p className="footer-text">For any queries, please contact the Visitor Hostel Office.</p>
                        <p className="footer-text">Email: vh@iiitdmj.ac.in | Phone: +91 XXXXXXXXXX</p>
                    </div>

                    {/* Important Notes */}
                    <div className="important-notes">
                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>Check-out is 24 hours from check-in time. Charges applicable beyond 24 hours.</li>
                            <li>Payment should be made at the time of check-out.</li>
                            <li>Cancellation charges as per hostel policy apply.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
