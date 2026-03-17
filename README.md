<p align="center">
  <img src="https://media.9curry.com/uploads/organization/image/497/iiitdmj.png" alt="IIITDMJ Logo" width="120" style="margin-bottom: 20px" />
</p>

<h1 align="center">🏨 Visitor's Hostel Management System</h1>

<h3 align="center">
  <a href="https://vh.iiitdmj.ac.in" target="_blank" style="color: #0066cc; text-decoration: none;">
    vh.iiitdmj.ac.in
  </a>
</h3>

<h4 align="center">PDPM Indian Institute of Information Technology, Design & Manufacturing, Jabalpur</h4>

<p align="center">
  <strong>A comprehensive full-stack web application for managing visitor bookings, billing, staff, and operations</strong>
</p>

<p align="center">
  <strong>Developer:</strong> <a href="https://github.com/Kunal88591">Kunal Meena</a>
</p>

<!-- Tech Stack Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Nginx-Reverse Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/PM2-Process Manager-2B037A?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2" />
</p>

---

## 🎯 What This Project Does

This system replaces the traditional paper-based VH booking process with a modern, secure, and fully digital workflow:

```
Guest Registration 
  ↓
Select visitor category & documents
  ↓
Pick rooms & stay dates
  ↓
Optional meal selection
  ↓
Admin reviews & approves
  ↓
Guest checks in
  ↓
Invoice auto-generated
  ↓
Payment tracked
  ↓
Guest checks out
```

**Live Deployment:** https://vh.iiitdmj.ac.in  
**Repository:** https://github.com/Kunal88591/VH_Management_IIITDMJ

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based login/registration with encrypted passwords (bcrypt)
- Three roles: **Admin** · **Staff** · **Guest** — each with scoped access
- Forgot & reset password via email (Nodemailer)
- Protected API routes + frontend route guards

### 📋 Smart Booking System (3-Step Wizard)

**Step 1** — Category, Subcategory, Guest Details & Documents
- 4 visitor categories (A/B/C/D) with official subcategories
- Multiple guest support with name, age, mobile
- Category-specific document upload requirements
- Mobile number validation rules (self vs others booking)

**Step 2** — Stay Details & Room Selection
- Date picker with check-in/check-out times
- Real-time room availability display
- Room type, floor, amenities, occupancy info

**Step 3** — Meals, Indenter Acceptance & Confirmation
- Optional per-day meal selection with quantity controls
- Full Day Meal bundle auto-discount
- Mandatory indenter responsibility checkbox
- Cancellation policy display
- Booking summary review

### 💰 Category-Based Tariff Engine

**Room Charges (per night) — Normal Rooms:**

| Category | Single Occupancy | Double Occupancy |
|----------|:----------------:|:----------------:|
| **A** — Director/Institute Guests | Free | Free |
| **B** — Employees & Related | ₹800 | ₹1,000 |
| **C** — Academic/Govt/Student | ₹1,200 | ₹1,500 |
| **D** — Contractors/Vendors | ₹1,800 | ₹2,000 |

**Suite Rooms:** A = Free · B/C/D = ₹2,500 (independent of occupancy)

**Meal Charges (staying guests):**

| Item | Rate |
|------|:----:|
| Full Day Meal (Tea + Breakfast + Lunch + Dinner) | ₹400 |
| Breakfast | ₹100 |
| Lunch / Dinner | ₹150 |
| Tea | ₹15 |
| Milk (per glass) | ₹30 |

> Full Day Meal bundle automatically applied when B+L+D+T are all selected — saves ₹15/person/day.

### 📄 Professional Invoice System
- **Dual invoices** — separate Room & Meal tabs
- IIITDM Jabalpur institute header with logo
- Visitor **category + subcategory** printed on every invoice
- Detailed room-wise & day-wise meal breakdown
- Payment tracking: Paid / Partially Paid / Unpaid with balance due
- VH bank account details (Indian Bank, Mehgawan)
- Authorized Signatory + Guest signature fields
- One-click **Print** / **Save as PDF**

### 🏠 Admin Dashboard & Control Panel

**Booking Management:**
- View pending bookings with document previews
- Approve/Reject with optional feedback
- Allocate specific rooms during approval
- Check-in/Check-out guests
- Track booking status lifecycle
- Modify room assignments post-approval
- Cancel bookings with penalty calculation

**Room Management:**
- Create new rooms with pricing & amenities
- Update room information in real-time
- Delete unused rooms
- Block/Unblock individual rooms
- Manage room categories & types
- View occupancy status
- Set floor and capacity limits

**Financial Management:**
- View all invoices with one-click PDF download
- Track payment status (Paid/Partial/Unpaid)
- Manually enter partial payments
- Generate billing reports
- View revenue analytics

**Staff Management:**
- Add/Edit/Remove staff members
- Assign roles and shifts
- Track staff performance
- Manage employee data

**Activity Tracking & Audit Trail:**
- Complete audit trail of all admin actions
- View what each admin approved/rejected/modified
- Track admin role transfers
- Filter by admin, date, or activity type
- Pagination & search functionality
- Activity summary with statistics

**Primary Admin Authority:**
- Create and delete admin accounts
- Transfer primary admin role to other admins
- View all activity logs in the system
- Full booking and financial control
- Monitor other admin activities
- Change system-wide settings

### ✅ Validation & Document Requirements

| Category | Scenario | Required |
|----------|----------|----------|
| **A** | All | Director's approval document |
| **B** | Institute Employee | Employee ID |
| **B** | Other guests | Director approval + Guest ID Card |
| **C** | Student booking for parents | Student Roll Number + Student ID Card |
| **C** | Other visitors | Approval document + Visitor ID |
| **D** | All | Approval document + Visitor ID |

### 🔄 Cancellation Policy (Auto-Calculated)

| Timing | Charge |
|--------|--------|
| More than 7 days before arrival | **Nil** |
| Within 7 days of arrival | **25%** of one-day room rent |
| Same day / No-show | **50%** of one-day room rent |

### 📱 Modern UI/UX
- Fully responsive (mobile, tablet, desktop) with Tailwind CSS
- Animated transitions & micro-interactions
- Real-time toast notifications
- Recharts-powered dashboard analytics
- Clean, professional design

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND          │  BACKEND           │  DATABASE      │
│  ─────────         │  ────────          │  ─────────     │
│  React 18          │  Node.js           │  MongoDB       │
│  Vite 5            │  Express.js        │  Mongoose ODM  │
│  Tailwind CSS 3.4  │  JWT Auth          │  Atlas / Local │
│  React Router v6   │  Multer (uploads)  │  In-Memory     │
│  Axios             │  PDFKit (invoice)  │  Fallback      │
│  Recharts          │  Nodemailer        │                │
│  React Hot Toast   │  bcryptjs          │                │
│  React Icons       │  Cloudinary (opt)  │                │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
VH_Management_IIITDMJ/
│
├── 📦 backend/
│   ├── server.js                      # Express server, DB connect, auto-seed
│   ├── middleware/
│   │   ├── auth.js                    # JWT verify + role authorization
│   │   └── upload.js                  # Multer config (5MB, pdf/jpg/png)
│   ├── models/
│   │   ├── Booking.js                 # Full booking schema (guests, meals, payments, docs)
│   │   ├── Room.js                    # Room (type, suite, AC, floor, amenities)
│   │   ├── User.js                    # User (admin/staff/guest + bcrypt)
│   │   ├── Staff.js                   # Staff (employee ID, role, shift, salary)
│   │   ├── Attendance.js              # Daily attendance records
│   │   ├── Bill.js                    # Billing & invoice entries
│   │   ├── MealOrder.js               # Meal order tracking
│   │   └── Activity.js                # Admin action audit trail
│   ├── routes/
│   │   ├── auth.js                    # Register / Login / Forgot / Reset Password
│   │   ├── bookings.js                # Full booking lifecycle + approval + invoice + payments
│   │   ├── rooms.js                   # Room CRUD + availability check + block/unblock
│   │   ├── billing.js                 # Invoice generation & payment tracking
│   │   ├── staff.js                   # Staff CRUD + role management
│   │   ├── attendance.js              # Attendance tracking & reporting
│   │   ├── dashboard.js               # Admin analytics & statistics
│   │   ├── admin.js                   # Admin user management + role transfer
│   │   ├── activity.js                # Activity logs + audit trail + filtering
│   │   ├── mealOrders.js              # Meal order management
│   │   └── payment_endpoint.js        # Payment processing
│   ├── utils/
│   │   ├── tariffCalculator.js        # Room & meal charge computation engine
│   │   ├── bookingValidator.js        # Category-specific validation rules
│   │   ├── invoiceGenerator.js        # PDF invoice generation
│   │   ├── emailService.js            # Transactional email (Nodemailer, Gmail SMTP)
│   │   ├── activityLogger.js          # Activity logging utility
│   │   └── systemCheck.js             # System utility functions
│   ├── seeds/
│   │   └── seed.js                    # Database seeder with sample data
│   ├── uploads/                       # Temporary file storage
│   ├── ecosystem.config.js            # PM2 process management configuration
│   └── package.json
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── App.jsx                    # Route definitions (public/guest/admin)
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Global styles + Tailwind
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth state + token management
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + API wrappers
│   │   ├── components/
│   │   │   ├── Invoice.jsx            # Tabbed Room/Meal invoice
│   │   │   ├── Invoice.css            # Print-optimized styles
│   │   │   ├── PaymentModal.jsx       # Payment dialog
│   │   │   ├── ApprovalModal.jsx      # Room selection during approval
│   │   │   ├── ActivityPanel.jsx      # Admin activity tracking dashboard
│   │   │   ├── ScrollToTop.jsx        # Route-change scroll reset
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx # Route protection component
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx         # Navigation bar
│   │   │       ├── Footer.jsx         # Site footer
│   │   │       └── AdminLayout.jsx    # Admin dashboard layout
│   │   └── pages/
│   │       ├── Home.jsx               # Landing page
│   │       ├── Rooms.jsx              # Room browsing + filters
│   │       ├── RoomDetails.jsx        # Individual room details
│   │       ├── BookingForm.jsx        # 3-step booking wizard
│   │       ├── BookingConfirmation.jsx # Confirmation screen
│   │       ├── Gallery.jsx            # Photo gallery
│   │       ├── Rules.jsx              # Official VH rules & tariff
│   │       ├── Login.jsx              # Authentication
│   │       ├── Register.jsx           # User registration
│   │       ├── ForgotPassword.jsx     # Request password reset
│   │       ├── ResetPassword.jsx      # Set new password
│   │       ├── admin/
│   │       │   ├── AdminManagement.jsx # Create/manage/transfer admin roles
│   │       │   ├── Bookings.jsx       # Booking approval + room allocation
│   │       │   ├── Rooms.jsx          # Room CRUD operations
│   │       │   ├── Staff.jsx          # Staff management
│   │       │   ├── Attendance.jsx     # Attendance tracking
│   │       │   ├── MealOrders.jsx     # Meal order processing
│   │       │   └── Activity.jsx       # Activity audit trail dashboard
│   │       └── guest/
│   │           ├── MyBookings.jsx     # Guest's bookings history
│   │           ├── BookingDetails.jsx # Single booking details
│   │           ├── MyMealOrders.jsx   # Meal order history
│   │           └── Profile.jsx        # Guest profile management
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── PROJECT_STRUCTURE.md           # Detailed documentation
│   ├── BIOMETRIC_INTEGRATION.md       # Biometric integration guide
│   └── CLOUDINARY_QUICKSTART.md       # File upload configuration
│
├── DEPLOYMENT_GUIDE.md                # Complete deployment instructions
├── QUICK_REFERENCE.md                 # Quick command reference
├── PRE_DEPLOYMENT_CHECKLIST.md        # Pre-deployment checklist
├── NGINX_CONFIG.conf                  # Nginx configuration
├── DEPLOYMENT_README.md               # Deployment overview
├── build.sh                           # Build & deployment script
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- **MongoDB** — Atlas URI, local instance, or leave blank for auto in-memory DB

### 1️⃣ Clone
```bash
git clone https://github.com/Kunal88591/VH_Management_IIITDMJ.git
cd VH_Management_IIITDMJ
```

### 2️⃣ Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3️⃣ Configure Environment
Create **`backend/.env`**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vh_management   # or your Atlas URI
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

> 💡 **No MongoDB?** No problem — the server automatically spins up an in-memory database and seeds it with sample rooms, staff, and users.

### 4️⃣ Run
```bash
# Terminal 1 — Start Backend
cd backend && npm run dev

# Terminal 2 — Start Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

### 5️⃣ Login with Seeded Credentials

| Role | Email | Password |
|:----:|-------|----------|
| 🔑 **Admin** | `vh@iiitdmj.ac.in` | `admin123` |
| 👤 **Guest** | `guest@example.com` | `guest123` |

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get JWT |
| `POST` | `/api/auth/forgot-password` | Send reset email |
| `POST` | `/api/auth/reset-password` | Reset password |

### Bookings
| Method | Endpoint | Description | Access |
|:------:|----------|-------------|:------:|
| `POST` | `/api/bookings` | Create booking | Guest |
| `GET` | `/api/bookings` | List (own or all) | Auth |
| `GET` | `/api/bookings/:id` | Booking details | Auth |
| `PUT` | `/api/bookings/:id/approve` | Approve | Admin |
| `PUT` | `/api/bookings/:id/reject` | Reject | Admin |
| `PUT` | `/api/bookings/:id/check-in` | Check-in | Admin |
| `PUT` | `/api/bookings/:id/check-out` | Check-out | Admin |
| `PUT` | `/api/bookings/:id/cancel` | Cancel | Auth |
| `GET` | `/api/bookings/:id/invoice` | Invoice data | Auth |
| `PUT` | `/api/bookings/:id/payment-status` | Update payment | Admin |

### Rooms · Staff · Dashboard
| Method | Endpoint | Description | Access |
|:------:|----------|-------------|:------:|
| `GET` | `/api/rooms` | List rooms | Public |
| `GET/POST/PUT/DELETE` | `/api/rooms/:id` | Room CRUD | Admin |
| `GET/POST/PUT/DELETE` | `/api/staff` | Staff CRUD | Admin |
| `GET/POST` | `/api/attendance` | Attendance | Admin |
| `GET` | `/api/dashboard` | Analytics | Admin |

---

## 📜 Official Compliance

Built in **100% compliance** with PDPM IIITDM Jabalpur Visitor's Hostel Rules & Regulations:

| Rule | Status |
|------|:------:|
| 4-tier visitor categorization (A/B/C/D) with subcategories | ✅ |
| Category-wise tariff computation (w.e.f. 1 Sep 2023) | ✅ |
| Category-specific document & validation requirements | ✅ |
| Full Day Meal bundle pricing (Tea+B+L+D = ₹400) | ✅ |
| Cancellation charges (Nil / 25% / 50%) | ✅ |
| Indenter responsibility acceptance before booking | ✅ |
| Invoice with institute header, bank details & signatures | ✅ |
| Category + subcategory on invoice | ✅ |
| Category C — max 5 days stay policy | ✅ |
| 24-hour check-in/check-out cycle | ✅ |
| Personal bookings — 10% room cap, confirmed 3 days prior | ✅ |
| No telephonic bookings/cancellations | ✅ |
| Alcohol/narcotics/smoking prohibition notice | ✅ |

---

## 📬 Contact

**Visitor's Hostel Office, PDPM IIITDM Jabalpur**
- 📧 Email: vh@iiitdmj.ac.in
- 📞 Phone: +91 761-2794254
- 📍 Dumna Airport Road, Jabalpur — 482005 (M.P.)

---

## 👨‍💻 Developer

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Kunal88591">
        <img src="https://github.com/Kunal88591.png" width="120" style="border-radius: 50%;" alt="Kunal88591" /><br />
        <sub><b>Kunal88591</b></sub>
      </a>
      <br />
      <sub>Full-Stack Developer</sub>
      <br />
      <a href="https://github.com/Kunal88591">
        <img src="https://img.shields.io/badge/GitHub-Kunal88591-181717?style=flat-square&logo=github" />
      </a>
    </td>
</table>



---

<p align="center">
  ⭐ If you found this useful, give it a star !
</p>

<p align="center">Made with ❤️ by <a href="https://github.com/Kunal88591">Kunal88591</a> for IIITDM Jabalpur</p>
