# 🏨 IIITDMJ Visitors' Hostel Management System

<div align="center">

![MERN Stack](https://img.shields.io/badge/MERN-Stack-00C58E?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A comprehensive, modern web-based management system for IIITDMJ's Visitors' Hostel**

[Live Demo](#) • [Report Bug](https://github.com/Kunal88591/VH_Management_IIITDMJ/issues) • [Request Feature](https://github.com/Kunal88591/VH_Management_IIITDMJ/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

The **IIITDMJ Visitors' Hostel Management System** is a full-stack web application designed to digitize and streamline the entire process of managing the institute's visitor accommodation. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it offers a seamless experience for both guests and administrators.

### Key Highlights
- ✨ **Modern UI/UX** - Built with React and Tailwind CSS for a responsive, intuitive interface
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Live booking status and availability tracking
- 📄 **PDF Generation** - Automated billing with professional PDF invoices
- 📧 **Email Integration** - Password reset functionality via email
- 🖼️ **File Management** - Document upload and storage for bookings

---

## 🌟 Features

### 👥 For Guests

#### Authentication & Profile
- 🔑 Secure registration and login with JWT
- 👤 Profile management with password change
- 🔄 Forgot password with email reset link
- 📧 Email verification system

#### Room Booking
- 🏠 Browse available rooms with beautiful image galleries
- 🔍 Advanced filtering (type, category, price, dates)
- 📅 Real-time availability checking
- 📝 Easy booking process with form validation
- 📤 Upload approval documents (permissions/receipts)
- 📱 Booking confirmation with details

#### Booking Management
- 📊 View all bookings (pending, approved, completed)
- 🔍 Detailed booking information
- 📄 Download uploaded documents
- 📜 Booking history tracking
- ⏱️ Real-time status updates

### 👨‍💼 For Administrators

#### Dashboard
- 📈 Real-time statistics (bookings, revenue, occupancy)
- 📊 Visual charts and graphs
- 🔔 Recent activity feed
- 📅 Upcoming check-ins/outs

#### Booking Operations
- ✅ Approve or reject booking requests
- 🏁 Check-in and check-out management
- 📄 View and download guest documents
- 🔍 Advanced search and filtering
- 📧 Automated notifications

#### Room Management
- ➕ Add new rooms with details and amenities
- ✏️ Edit room information and pricing
- 🚫 Block/unblock rooms for maintenance
- 🗑️ Delete rooms
- 📊 Room occupancy tracking
- 💰 Dynamic pricing management

#### Financial Management
- 💵 Generate itemized bills
- 📄 Professional PDF invoice generation
- 💳 Track payments and dues
- 📊 Revenue reports
- 🧾 Billing history

#### Staff Operations
- 👥 Add and manage staff members
- 📋 Role assignment
- 📅 Attendance tracking system
- 📊 Staff performance metrics

#### Admin Management (Primary Admin Only)
- 🛡️ Create new admin accounts
- 👤 View all administrators
- 🗑️ Remove admin privileges
- 🔒 Protected primary admin account

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI Framework |
| React Router | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Styling framework |
| Axios | 1.x | HTTP client |
| React Hot Toast | 2.x | Notifications |
| React Icons | 5.x | Icon library |
| Vite | 5.x | Build tool |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.x | Web framework |
| MongoDB | 6.x | Database |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Authentication |
| Bcrypt | 5.x | Password hashing |
| Multer | 1.x | File uploads |
| Nodemailer | 6.x | Email service |
| PDFKit | 0.x | PDF generation |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v20 or higher)
- **npm** or **yarn**
- **MongoDB** account ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git**

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/Kunal88591/VH_Management_IIITDMJ.git
cd VH_Management_IIITDMJ

# Backend setup
cd backend
npm install
# Create .env file with your MongoDB URI
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
\`\`\`


## 👨‍💻 Developer

**Kunal Meena**
- LinkedIn: [kunal8859](https://www.linkedin.com/in/kunal8859/)
- GitHub: [@Kunal88591](https://github.com/Kunal88591)

Made with ❤️ for IIITDMJ
