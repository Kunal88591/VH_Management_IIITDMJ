# 📂 Project Structure

```
VH_Management_IIITDMJ/
├── 📄 README.md                    # Main project documentation
├── 📄 package.json                 # Root package configuration
├── 📄 vercel.json                  # Vercel deployment config
├── 🔧 build.sh                     # Production build script
├── 📁 docs/                        # Documentation files
│   ├── IMAGE_OPTIMIZATION_GUIDE.md
│   ├── GALLERY_GUIDE.md
│   ├── QUICK_START_GALLERY.md
│   └── VERCEL_DEPLOYMENT.md
│
├── 📁 scripts/                     # Helper scripts
│   ├── setup-gallery-images.sh
│   └── check-gallery.sh
│
├── 📁 backend/                     # Backend API Server
│   ├── 📄 package.json
│   ├── 📄 server.js               # Main server file
│   ├── 📁 middleware/             # Custom middleware
│   │   ├── auth.js               # JWT authentication
│   │   └── upload.js             # File upload handling
│   ├── 📁 models/                # MongoDB schemas
│   │   ├── Attendance.js
│   │   ├── Bill.js
│   │   ├── Booking.js
│   │   ├── Room.js
│   │   ├── Staff.js
│   │   └── User.js
│   ├── 📁 routes/                # API route handlers
│   │   ├── admin.js
│   │   ├── attendance.js
│   │   ├── auth.js
│   │   ├── billing.js
│   │   ├── bookings.js
│   │   ├── dashboard.js
│   │   ├── rooms.js
│   │   └── staff.js
│   ├── 📁 seeds/                 # Database seeders
│   │   └── seed.js
│   ├── 📁 uploads/               # Uploaded files storage
│   └── 📁 utils/                 # Utility functions
│       └── emailService.js
│
└── 📁 frontend/                   # React Frontend
    ├── 📄 index.html
    ├── 📄 package.json
    ├── 📄 vite.config.js
    ├── 📄 tailwind.config.js
    ├── 📄 postcss.config.js
    │
    ├── 📁 public/                # Static assets
    │   └── 📁 images/
    │       ├── hero.jpg          # Homepage hero image
    │       ├── room.jpg          # Room showcase image
    │       ├── iiitdmj-logo.png  # Institute logo
    │       └── 📁 gallery/       # Gallery photos
    │           ├── photo-1.jpg
    │           ├── photo-2.jpg
    │           ├── ... (up to photo-15.jpg)
    │           └── README.md
    │
    └── 📁 src/                   # Source code
        ├── 📄 main.jsx           # App entry point
        ├── 📄 App.jsx            # Main App component
        ├── 📄 index.css          # Global styles
        │
        ├── 📁 components/        # Reusable components
        │   ├── 📁 auth/
        │   │   └── ProtectedRoute.jsx
        │   └── 📁 layout/
        │       ├── AdminLayout.jsx
        │       ├── Footer.jsx
        │       └── Navbar.jsx
        │
        ├── 📁 context/           # React Context API
        │   └── AuthContext.jsx
        │
        ├── 📁 pages/             # Page components
        │   ├── Home.jsx
        │   ├── Rooms.jsx
        │   ├── RoomDetails.jsx
        │   ├── Gallery.jsx       # 🆕 Photo gallery
        │   ├── Rules.jsx
        │   ├── BookingForm.jsx
        │   ├── BookingConfirmation.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── ForgotPassword.jsx
        │   ├── ResetPassword.jsx
        │   │
        │   ├── 📁 admin/         # Admin pages
        │   │   ├── Dashboard.jsx
        │   │   ├── Bookings.jsx
        │   │   ├── Rooms.jsx
        │   │   ├── Billing.jsx
        │   │   ├── Staff.jsx
        │   │   ├── Attendance.jsx
        │   │   └── AdminManagement.jsx
        │   │
        │   └── 📁 guest/         # Guest user pages
        │       ├── MyBookings.jsx
        │       ├── BookingDetails.jsx
        │       └── Profile.jsx
        │
        └── 📁 services/          # API service layer
            └── api.js
```

## 🎯 Key Directories Explained

### `/backend`
- **Purpose**: Node.js/Express REST API server
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based auth with bcrypt
- **Port**: 5000

### `/frontend`
- **Purpose**: React SPA with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Port**: 3000 (dev), 5173 (vite default)

### `/docs`
- **Purpose**: Project documentation and guides
- **Contains**: Setup guides, deployment docs, optimization tips

### `/scripts`
- **Purpose**: Helper scripts for development
- **Contains**: Image setup scripts, gallery checkers

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `build.sh` | Production build automation |
| `vite.config.js` | Vite bundler configuration |
| `tailwind.config.js` | Tailwind CSS customization |
| `postcss.config.js` | PostCSS processing config |

## 🚀 Recent Additions

- ✅ Gallery page with 15 photo capacity
- ✅ Lazy loading for optimized performance
- ✅ IIITDMJ logo integration
- ✅ Image optimization guide
- ✅ Organized documentation structure

## 📦 Dependencies

### Backend
- express, mongoose, cors
- bcryptjs, jsonwebtoken
- multer (file uploads)
- nodemailer (emails)

### Frontend
- react, react-router-dom
- axios
- react-hot-toast
- react-icons
- tailwindcss

## 🔗 Quick Links

- [Main README](../README.md)
- [Image Optimization Guide](docs/IMAGE_OPTIMIZATION_GUIDE.md)
- [Gallery Setup Guide](docs/GALLERY_GUIDE.md)
- [Deployment Guide](docs/VERCEL_DEPLOYMENT.md)

---

**Last Updated**: January 2026
