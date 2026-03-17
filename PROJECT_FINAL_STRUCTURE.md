# Final Project Deliverable - VH Management System

## 🎯 Project Overview

**Project Name:** Visitor's Hostel Management System  
**Institution:** PDPM IIITDM Jabalpur  
**Live URL:** http://vh.iiitdmj.ac.in  
**Repository:** https://github.com/Kunal88591/VH_Management_IIITDMJ  
**Developer:** Kunal Meena  
**Status:** ✅ Production Ready

---

## 📦 Complete Project Structure

```
VH_Management_IIITDMJ/
│
├── 📚 Documentation Files
│   ├── README.md                       # Main project documentation
│   ├── DEPLOYMENT_GUIDE.md             # Step-by-step deployment instructions
│   ├── DEPLOYMENT_README.md            # Deployment overview
│   ├── QUICK_REFERENCE.md              # Quick command reference
│   ├── PRE_DEPLOYMENT_CHECKLIST.md     # Pre-deployment checklist
│   ├── NGINX_CONFIG.conf               # Nginx reverse proxy configuration
│   └── docs/
│       ├── PROJECT_STRUCTURE.md        # Detailed project structure
│       ├── BIOMETRIC_INTEGRATION.md    # Biometric integration guide
│       └── CLOUDINARY_QUICKSTART.md    # File upload setup guide
│
├── 🎨 Frontend (React + Vite SPA)
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.jsx                 # Main routing (public/guest/admin routes)
│   │   │   ├── main.jsx                # React entry point
│   │   │   ├── index.css               # Global styles with TailwindCSS
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── Invoice.jsx         # PDF invoice component (Room & Meal tabs)
│   │   │   │   ├── Invoice.css         # Print-optimized invoice styling
│   │   │   │   ├── PaymentModal.jsx    # Payment processing dialog
│   │   │   │   ├── ApprovalModal.jsx   # Room selection during booking approval
│   │   │   │   ├── ActivityPanel.jsx   # Admin activity tracking dashboard
│   │   │   │   ├── ScrollToTop.jsx     # Auto-scroll on route change
│   │   │   │   ├── auth/
│   │   │   │   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   │   │   │   └── layout/
│   │   │   │       ├── Navbar.jsx      # Navigation bar
│   │   │   │       ├── Footer.jsx      # Site footer with contact info
│   │   │   │       └── AdminLayout.jsx # Admin dashboard layout & menu
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx     # Global auth state (user, login, logout)
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── api.js              # Axios client with interceptors & API wrappers
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── Guest Pages:
│   │   │       │   ├── Home.jsx        # Landing page with hostel info
│   │   │       │   ├── Rooms.jsx       # Room browse with filtering
│   │   │       │   ├── RoomDetails.jsx # Individual room details view
│   │   │       │   ├── BookingForm.jsx # 3-step booking wizard
│   │   │       │   ├── BookingConfirmation.jsx # Booking confirmation
│   │   │       │   ├── Gallery.jsx     # Photo gallery
│   │   │       │   ├── Rules.jsx       # Official hostel rules & tariff
│   │   │       │
│   │   │       ├── Auth Pages:
│   │   │       │   ├── Login.jsx       # Login form
│   │   │       │   ├── Register.jsx    # Guest registration
│   │   │       │   ├── ForgotPassword.jsx  # Password reset request
│   │   │       │   └── ResetPassword.jsx   # New password set
│   │   │       │
│   │   │       ├── Guest Dashboard (guest/):
│   │   │       │   ├── MyBookings.jsx  # Guest's bookings list
│   │   │       │   ├── BookingDetails.jsx  # Single booking details
│   │   │       │   ├── MyMealOrders.jsx    # Meal order history
│   │   │       │   └── Profile.jsx     # Profile management
│   │   │       │
│   │   │       └── Admin Dashboard (admin/):
│   │   │           ├── AdminManagement.jsx # Create/delete/transfer admin roles
│   │   │           ├── Bookings.jsx    # Booking approval workflow
│   │   │           ├── Rooms.jsx       # Room management CRUD
│   │   │           ├── Staff.jsx       # Staff management
│   │   │           ├── Attendance.jsx  # Staff attendance tracking
│   │   │           ├── MealOrders.jsx  # Meal order management
│   │   │           └── Activity.jsx    # Admin activity audit trails
│   │   │
│   │   ├── public/
│   │   │   └── images/gallery/         # Hostel photos
│   │   │
│   │   ├── package.json                # Frontend dependencies
│   │   ├── vite.config.js              # Vite build configuration
│   │   ├── tailwind.config.js          # TailwindCSS configuration
│   │   └── postcss.config.js           # PostCSS plugins
│
├── 🔧 Backend (Node.js + Express)
│   ├── backend/
│   │   ├── server.js                   # Express app setup, DB connection, auto-seed
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification & role-based authorization
│   │   │   └── upload.js               # Multer file upload handler
│   │   │
│   │   ├── models/ (MongoDB Schemas)
│   │   │   ├── User.js                 # User (admin/staff/guest)
│   │   │   ├── Booking.js              # Booking with guests, meals, payments
│   │   │   ├── Room.js                 # Room details & pricing
│   │   │   ├── Staff.js                # Staff member details
│   │   │   ├── Attendance.js           # Daily attendance records
│   │   │   ├── Bill.js                 # Invoice & billing data
│   │   │   ├── MealOrder.js            # Meal orders
│   │   │   └── Activity.js             # Admin action audit trail
│   │   │
│   │   ├── routes/ (API Endpoints)
│   │   │   ├── auth.js                 # /api/auth/* (login, register, reset password)
│   │   │   ├── bookings.js             # /api/bookings/* (CRUD, approval, check-in/out)
│   │   │   ├── rooms.js                # /api/rooms/* (CRUD, availability, block/unblock)
│   │   │   ├── billing.js              # /api/billing/* (invoices, payments)
│   │   │   ├── staff.js                # /api/staff/* (CRUD, roles, shifts)
│   │   │   ├── attendance.js           # /api/attendance/* (tracking, reports)
│   │   │   ├── dashboard.js            # /api/dashboard/* (analytics, charts)
│   │   │   ├── admin.js                # /api/admin/* (admin management, role transfer)
│   │   │   ├── activity.js             # /api/activities/* (audit logs, filtering)
│   │   │   ├── mealOrders.js           # /api/meal-orders/* (meal management)
│   │   │   ├── payment_endpoint.js     # Payment processing
│   │   │   └── attendance_biometric_example.js # Biometric integration example
│   │   │
│   │   ├── utils/ (Business Logic)
│   │   │   ├── tariffCalculator.js     # Room & meal pricing calculation
│   │   │   ├── bookingValidator.js     # Validation rules & document requirements
│   │   │   ├── invoiceGenerator.js     # PDF invoice creation
│   │   │   ├── emailService.js         # Nodemailer + Gmail SMTP configuration
│   │   │   ├── activityLogger.js       # Activity logging utility
│   │   │   └── systemCheck.js          # System utility functions
│   │   │
│   │   ├── seeds/
│   │   │   └── seed.js                 # Database initialization script
│   │   │
│   │   ├── uploads/                    # Temporary file storage
│   │   │
│   │   ├── ecosystem.config.js         # PM2 process management configuration
│   │   ├── package.json                # Backend dependencies
│   │   └── .env.example                # Environment variables template
│
├── 🚀 Deployment Configuration
│   ├── build.sh                        # Build and deployment script
│   ├── NGINX_CONFIG.conf               # Nginx reverse proxy configuration
│   └── package.json                    # Root package.json with build scripts
│
└── 📋 Version Control
    ├── .gitignore                      # Git ignore rules
    └── .git/                           # Git repository

```

---

## 🌟 Key Features Implemented

### ✅ Booking System
- 3-step wizard (Category → Room Selection → Meals & Confirmation)
- Real-time room availability
- Category-based (A/B/C/D) visitor classification
- Automatic room assignment during approval
- Room reassignment capability
- Cancellation with penalty calculation
- Check-in/Check-out tracking

### ✅ Financial Management
- Dynamic tariff calculation (category & occupancy-based)
- Meal order management with bundle discounts
- Automatic invoice generation (PDF)
- Payment tracking (Paid/Partial/Unpaid)
- Manual payment entry by admin
- Invoice download & viewing

### ✅ Admin Features
- Booking approval workflow with document review
- Room management (Create, Update, Delete, Block)
- Staff management & shift scheduling
- Attendance tracking
- Financial dashboard with analytics
- Activity audit trail with filtering
- Primary admin role transfer capability
- Admin account creation/deletion

### ✅ Security & Authentication
- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (Admin/Staff/Guest)
- Protected routes with middleware
- Email-based password reset
- Token expiration & refresh
- Protected file uploads

### ✅ Database
- MongoDB Atlas for cloud storage
- 8 well-designed collections with relationships
- Mongoose ODM for schema validation
- Indexes for performance optimization
- Automatic data seeding on first run

### ✅ Deployment Infrastructure
- Ubuntu 24.04.3 LTS server (172.27.16.37)
- Nginx reverse proxy (port 80)
- Node.js backend on port 5000 (PM2 managed)
- React frontend served via Nginx
- Domain: vh.iiitdmj.ac.in
- MongoDB Atlas cloud database

---

## 🔐 Security Measures

1. **Authentication:** JWT tokens with configurable expiry
2. **Password Security:** Bcrypt hashing (12 salt rounds)
3. **Authorization:** Role-based access control middleware
4. **API Security:** Input validation on all endpoints
5. **File Uploads:** Type/size validation, Cloudinary CDN storage
6. **Data Protection:** Sensitive fields excluded from queries
7. **CORS:** Configured for frontend domain
8. **Environment:** Secrets stored in .env (not in code)
9. **Nginx:** Reverse proxy shields backend
10. **Activity Logging:** Complete audit trail of all admin actions

---

## 📊 Database Schema

**8 Collections:**
1. **Users** - Authentication & user data
2. **Bookings** - Guest bookings with status tracking
3. **Rooms** - Room availability & pricing
4. **Staff** - Staff member information
5. **Attendance** - Daily attendance records
6. **Bills** - Invoice & billing information
7. **MealOrders** - Meal order tracking
8. **Activities** - Admin action audit trail

---

## 🔑 Admin Credentials

### Primary Admin
- **Email:** `vh@iiitdmj.ac.in`
- **Password:** `admin123` (change after deployment)
- **Permissions:** All admin features, activity management, role transfer

### Sample Guest
- **Email:** `guest@example.com`
- **Password:** `guest123`

---

## 📱 Frontend Technologies

- **React 18.2** - UI library
- **Vite 5** - Build tool & dev server
- **TailwindCSS 3.4** - Styling
- **React Router v6** - Client routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **React DatePicker** - Date selection
- **Recharts** - Data visualization
- **Form validation** - React Hook Form

---

## 🛠️ Backend Technologies

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File uploads
- **PDFKit** - PDF generation
- **Cloudinary** - File storage
- **PM2** - Process manager

---

## 📈 API Endpoints (40+)

### Authentication (7 endpoints)
- Register, Login, Get Profile, Update Profile, Change Password, Forgot Password, Reset Password

### Bookings (12 endpoints)
- List, Create, Get Details, Approve, Reject, Check-in, Check-out, Cancel, Modify Rooms, Available Rooms, Payment Status, Invoices

### Rooms (6 endpoints)
- List, Get Details, Create, Update, Delete, Block/Unblock

### Admin (5 endpoints)
- List Admins, Create Admin, Delete Admin, Transfer Primary Role, Get Admin Info

### Activity (3 endpoints)
- List Activities, Activity Summary, Booking-specific Activities

### Additional (Staff, Attendance, Dashboard, Billing, Meal Orders, Payment)

---

## 🚀 Deployment Checklist

✅ Backend setup with PM2  
✅ Frontend build optimization  
✅ Nginx configuration  
✅ MongoDB Atlas connection  
✅ Email service (Nodemailer + Gmail SMTP)  
✅ SSL/TLS ready  
✅ Environment variables configured  
✅ Database seeding  
✅ File upload handlers  
✅ API documentation  
✅ Error handling  
✅ Activity logging  
✅ Role-based access control  

---

## 📝 Documentation Provided

1. **README.md** - Main project documentation
2. **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
3. **QUICK_REFERENCE.md** - Command reference
4. **PRE_DEPLOYMENT_CHECKLIST.md** - Deployment verification
5. **PROJECT_STRUCTURE.md** - Detailed architecture
6. **BIOMETRIC_INTEGRATION.md** - Biometric setup guide
7. **CLOUDINARY_QUICKSTART.md** - File upload configuration

---

## 🎯 Project Metrics

- **Frontend Code:** ~2,500 lines (React components, pages, services)
- **Backend Code:** ~1,500 lines (routes, models, utilities)
- **Database:** 8 collections with complex relationships
- **API Endpoints:** 40+ REST endpoints
- **React Components:** 25+ components
- **Documentation:** 7 comprehensive guides
- **Test Coverage:** Manual integration testing
- **Performance:** Optimized with lazy loading, code splitting, caching

---

## ✨ Future Enhancements

- SMS notifications for bookings
- Biometric attendance integration
- Mobile app (React Native)
- Payment gateway integration (Razorpay/Stripe)
- Advanced reporting & exports
- Occupancy forecasting
- Email scheduling
- Two-factor authentication
- Bulk guest imports

---

## 📞 Support & Contact

- **GitHub:** https://github.com/Kunal88591/VH_Management_IIITDMJ
- **Live Site:** https://vh.iiitdmj.ac.in
- **Developer:** Kunal Meena
- **Email:** Contact VH office at IIITDM Jabalpur

---

## 📄 License

Proprietary software for **PDPM IIITDM Jabalpur**  
© 2024-2026 Kunal Meena. All rights reserved.

---

**Status: ✅ PRODUCTION READY**  
**Last Updated: March 17, 2026**  
**Version: 2.0 (Final)**
