import { useState } from 'react';
import { HiX, HiPrinter, HiDownload, HiHome, HiCake } from 'react-icons/hi';
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

    const getSubCategoryLabel = (code) => {
        const labels = {
            'A-i': 'Institute Guests / Directors / Examiners / External Committee Members / Invited Speakers / CAG Audit Team / MoE Officials / Important guests of Chairman, BOG / Director / Senate / BWC / Statutory Bodies',
            'A-ii': 'Other Institute guests not covered above (Approved by Director)',
            'B-i': 'Institute employee & their dependents',
            'B-ii': 'Project employee & their dependents',
            'B-iii': 'Retired IIITDMJ Faculty / Staff / Alumni',
            'B-iv': 'Relatives / Guests of IIITDMJ Faculty & Staff',
            'B-v': 'Other than Institute employees staying for Institute work',
            'B-vi': 'Any other Guest (Approved by the Director)',
            'C-i': 'Employees of other IIITs / IITs / Centrally funded engineering colleges / Universities / PSUs',
            'C-ii': 'Parents / Guardian / Spouse of IIITDMJ students',
            'C-iii': 'Visitors of government / public sector organization',
            'C-iv': 'Trainees coming to the Institute under programmes organized by the Institute',
            'C-v': 'Others (Approved by the Director)',
            'C-vi': 'Guest of State / Central or other Governments (not Institute guest)',
            'D-i': 'Contractors, representatives of firms, vendors etc. coming for work viz. meeting, presentations etc.'
        };
        return labels[code] || code;
    };

    // Calculate nights
    const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)) || 1;

    // Check if meals were opted
    const hasMeals = booking.mealRequirements && booking.mealRequirements.required && booking.mealCharges > 0;

    // For room presence
    const hasRooms = booking.rooms && booking.rooms.length > 0 && (booking.roomCharges || 0) > 0;

    // Initialize active tab: prefer meal tab when there are no rooms
    const [activeTab, setActiveTab] = useState(hasRooms ? 'room' : (hasMeals ? 'meal' : 'room'));

    // Payment calculations
    const totalAmount = booking.totalAmount || 0;
    const amountPaid = booking.amountPaid || 0;
    const remainingAmount = totalAmount - amountPaid;
    
    // For separate invoices
    const roomCharges = booking.roomCharges || 0;
    const mealCharges = booking.mealCharges || 0;

    // Calculate proportional payment for room/meal
    const roomPaidRatio = totalAmount > 0 ? roomCharges / totalAmount : 0;
    const mealPaidRatio = totalAmount > 0 ? mealCharges / totalAmount : 0;
    const roomAmountPaid = Math.round(amountPaid * roomPaidRatio);
    const mealAmountPaid = Math.round(amountPaid * mealPaidRatio);
    const roomRemaining = roomCharges - roomAmountPaid;
    const mealRemaining = mealCharges - mealAmountPaid;

    const handlePrint = (type) => {
        // Set which invoice to print
        document.body.classList.add(`print-${type}-invoice`);
        window.print();
        document.body.classList.remove(`print-${type}-invoice`);
    };

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
                        <h1>IIITDM JABALPUR</h1>
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
                {booking.visitorSubCategory && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <p className="label">Sub-Category:</p>
                        <p className="value">{getSubCategoryLabel(booking.visitorSubCategory)}</p>
                    </div>
                )}
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
                    <p className="sig-title">Caretaker/Warden</p>
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

    // Payment Details Component
    const PaymentDetails = ({ charges, paid, remaining, type }) => (
        <div className="payment-details-section">
            <h4 className="section-title">Payment Details</h4>
            <div className="payment-details-grid">
                <div className="payment-detail-row">
                    <span>{type} Charges:</span>
                    <span className="amount">₹{charges.toLocaleString()}</span>
                </div>
                <div className="payment-detail-row">
                    <span>Amount Paid:</span>
                    <span className="amount paid-amount">₹{paid.toLocaleString()}</span>
                </div>
                <div className="payment-detail-row highlight-row">
                    <span><strong>Balance Due:</strong></span>
                    <span className={`amount ${remaining > 0 ? 'due-amount' : 'cleared-amount'}`}>
                        <strong>₹{remaining.toLocaleString()}</strong>
                    </span>
                </div>
                <div className="payment-detail-row">
                    <span>Payment Status:</span>
                    <span className={`status-badge ${booking.paymentStatus === 'Paid' ? 'paid' : booking.paymentStatus === 'Partially Paid' ? 'partial' : 'unpaid'}`}>
                        {booking.paymentStatus || 'Unpaid'}
                    </span>
                </div>
                {booking.paymentMethod && (
                    <div className="payment-detail-row">
                        <span>Payment Method:</span>
                        <span>{booking.paymentMethod}</span>
                    </div>
                )}
                {booking.paymentDate && (
                    <div className="payment-detail-row">
                        <span>Last Payment Date:</span>
                        <span>{formatDate(booking.paymentDate)}</span>
                    </div>
                )}
            </div>
        </div>
    );

    // Room Invoice Content
    const RoomInvoiceContent = () => (
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
                    <tfoot>
                        <tr className="total-row">
                            <td colSpan="4" className="text-right"><strong>Total Room Charges:</strong></td>
                            <td className="text-right"><strong>₹{roomCharges.toLocaleString()}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Payment Details */}
            <PaymentDetails 
                charges={roomCharges} 
                paid={roomAmountPaid} 
                remaining={roomRemaining}
                type="Room"
            />

            <SignatureSection />
            <InvoiceFooter />
        </div>
    );

    // Meal Invoice Content
    const MealInvoiceContent = () => (
        <div className="invoice-content invoice-page" id="meal-invoice">
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
                        {booking.mealRequirements?.meals?.map((meal, idx) => {
                            // Apply Full Day bundle: B+L+D+T = ₹400 (instead of ₹415 individually)
                            const b = meal.breakfast || 0, l = meal.lunch || 0, d = meal.dinner || 0, t = meal.tea || 0, m = meal.milk || 0;
                            const fullDaySets = Math.min(b, l, d, t);
                            const dayTotal = (fullDaySets * 400) +
                                            ((b - fullDaySets) * 100) + ((l - fullDaySets) * 150) +
                                            ((d - fullDaySets) * 150) + ((t - fullDaySets) * 15) + (m * 30);
                            return (
                                <tr key={idx}>
                                    <td className="font-medium">Day {idx + 1}</td>
                                    <td className="text-center">{meal.breakfast || 0}</td>
                                    <td className="text-center">{meal.lunch || 0}</td>
                                    <td className="text-center">{meal.dinner || 0}</td>
                                    <td className="text-center">{meal.tea || 0}</td>
                                    <td className="text-center">{meal.milk || 0}</td>
                                    <td className="text-right font-semibold">₹{dayTotal}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td colSpan="6" className="text-right"><strong>Total Meal Charges:</strong></td>
                            <td className="text-right"><strong>₹{mealCharges.toLocaleString()}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                <p className="tariff-note">
                    <strong>Tariff:</strong> Breakfast ₹100 | Lunch ₹150 | Dinner ₹150 | Tea ₹15 | Milk ₹30/glass
                </p>
            </div>

            {/* Payment Details */}
            <PaymentDetails 
                charges={mealCharges} 
                paid={mealAmountPaid} 
                remaining={mealRemaining}
                type="Meal"
            />

            <SignatureSection />
            <InvoiceFooter />
        </div>
    );

    return (
        <div className="invoice-modal-overlay">
            <div className="invoice-modal-container">
                {/* Header with Tabs - Hide on print */}
                <div className="invoice-modal-header no-print">
                    <div className="invoice-tabs">
                        {hasRooms && (
                            <button
                                onClick={() => setActiveTab('room')}
                                className={`invoice-tab ${activeTab === 'room' ? 'active' : ''}`}
                            >
                                <HiHome className="w-4 h-4" />
                                Room Invoice
                            </button>
                        )}
                        {hasMeals && (
                            <button
                                onClick={() => setActiveTab('meal')}
                                className={`invoice-tab ${activeTab === 'meal' ? 'active' : ''}`}
                            >
                                <HiCake className="w-4 h-4" />
                                Meal Invoice
                            </button>
                        )}
                    </div>
                    <div className="invoice-actions">
                        <button
                            onClick={() => handlePrint(activeTab)}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <HiPrinter className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={() => handlePrint(activeTab)}
                            className="btn-outline py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <HiDownload className="w-4 h-4" />
                            Save PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content - Show based on active tab */}
                <div className="invoice-tab-content">
                    {activeTab === 'room' && <RoomInvoiceContent />}
                    {activeTab === 'meal' && hasMeals && <MealInvoiceContent />}
                </div>
            </div>
        </div>
    );
};

export default Invoice;
