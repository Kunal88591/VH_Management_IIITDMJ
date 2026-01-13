const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection with fallback to memory server
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vh_management';
    
    // If it's a remote URI (Atlas), connect directly
    if (mongoURI.includes('mongodb+srv') || mongoURI.includes('mongodb.net')) {
      await mongoose.connect(mongoURI);
      console.log('✅ MongoDB Atlas Connected Successfully');
    } else {
      // Try local MongoDB first, fallback to in-memory
      try {
        await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ MongoDB Local Connected Successfully');
      } catch (localErr) {
        console.log('⚠️ Local MongoDB not available, using in-memory database...');
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
        console.log('✅ MongoDB In-Memory Connected Successfully');
      }
    }
    
    // Seed database if empty
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Seeding initial data...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Seed function for in-memory database
const seedDatabase = async () => {
  const User = require('./models/User');
  const Room = require('./models/Room');
  const Staff = require('./models/Staff');
  
  // Create admin user
  const adminExists = await User.findOne({ email: 'vh@iiitdmj.ac.in' });
  if (!adminExists) {
    await User.create({
      name: 'VH Admin',
      email: 'vh@iiitdmj.ac.in',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210'
    });
    console.log('👤 Admin user created');
  }
  
  // Create guest user
  const guestExists = await User.findOne({ email: 'guest@example.com' });
  if (!guestExists) {
    await User.create({
      name: 'Test Guest',
      email: 'guest@example.com',
      password: 'guest123',
      role: 'guest',
      phone: '9876543211'
    });
    console.log('👤 Guest user created');
  }
  
  // Create sample rooms
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    const rooms = [
      { roomNumber: '101', roomType: 'Single', category: 'AC', floor: 1, maxOccupancy: 1, pricePerNight: 800, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom'] },
      { roomNumber: '102', roomType: 'Single', category: 'AC', floor: 1, maxOccupancy: 1, pricePerNight: 800, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom'] },
      { roomNumber: '103', roomType: 'Double', category: 'AC', floor: 1, maxOccupancy: 2, pricePerNight: 1200, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Refrigerator'] },
      { roomNumber: '201', roomType: 'Double', category: 'AC', floor: 2, maxOccupancy: 2, pricePerNight: 1200, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom'] },
      { roomNumber: '202', roomType: 'Suite', category: 'AC', floor: 2, maxOccupancy: 4, pricePerNight: 2500, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Refrigerator', 'Balcony'] },
      { roomNumber: '203', roomType: 'Single', category: 'Non-AC', floor: 2, maxOccupancy: 1, pricePerNight: 500, amenities: ['WiFi', 'Attached Bathroom'] },
      { roomNumber: '301', roomType: 'Double', category: 'Non-AC', floor: 3, maxOccupancy: 2, pricePerNight: 700, amenities: ['WiFi', 'TV', 'Attached Bathroom'] },
      { roomNumber: '302', roomType: 'Deluxe', category: 'AC', floor: 3, maxOccupancy: 6, pricePerNight: 3000, amenities: ['WiFi', 'AC', 'TV', 'Refrigerator', 'Balcony'] },
    ];
    await Room.insertMany(rooms);
    console.log('🛏️ Sample rooms created');
  }
  
  // Create sample staff
  const staffCount = await Staff.countDocuments();
  if (staffCount === 0) {
    const staff = [
      { employeeId: 'EMP001', name: 'Rajesh Kumar', phone: '9876543001', role: 'Reception', shift: 'Morning', salary: 25000 },
      { employeeId: 'EMP002', name: 'Priya Sharma', phone: '9876543002', role: 'Housekeeping', shift: 'Morning', salary: 18000 },
      { employeeId: 'EMP003', name: 'Amit Singh', phone: '9876543003', role: 'Security', shift: 'Night', salary: 20000 },
      { employeeId: 'EMP004', name: 'Sunita Devi', phone: '9876543004', role: 'Kitchen', shift: 'Morning', salary: 22000 },
    ];
    await Staff.insertMany(staff);
    console.log('👷 Sample staff created');
  }
  
  console.log('✅ Database seeded successfully');
};

connectDB();

// Import Routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const billingRoutes = require('./routes/billing');
const staffRoutes = require('./routes/staff');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Visitors\' Hostel Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
