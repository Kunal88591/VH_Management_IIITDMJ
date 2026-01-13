const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Room = require('../models/Room');
const Staff = require('../models/Staff');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vh_management');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Staff.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@iiitdmj.ac.in',
      password: adminPassword,
      phone: '9876543210',
      role: 'admin',
      isActive: true
    });
    console.log('Created admin user: admin@iiitdmj.ac.in / admin123');

    // Create Sample Guest User
    const guestPassword = await bcrypt.hash('guest123', 12);
    await User.create({
      name: 'Sample Guest',
      email: 'guest@example.com',
      password: guestPassword,
      phone: '9876543211',
      address: '123 Main Street, City',
      role: 'guest',
      isActive: true
    });
    console.log('Created guest user: guest@example.com / guest123');

    // Create Rooms
    const rooms = [
      // AC Single Rooms
      { roomNumber: '101', roomType: 'Single', category: 'AC', pricePerNight: 1500, maxOccupancy: 1, floor: 1, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom'], description: 'Comfortable AC single room with modern amenities' },
      { roomNumber: '102', roomType: 'Single', category: 'AC', pricePerNight: 1500, maxOccupancy: 1, floor: 1, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom'], description: 'Comfortable AC single room with modern amenities' },
      { roomNumber: '103', roomType: 'Single', category: 'Non-AC', pricePerNight: 1000, maxOccupancy: 1, floor: 1, amenities: ['WiFi', 'TV', 'Fan', 'Attached Bathroom'], description: 'Budget-friendly non-AC single room' },
      
      // AC Double Rooms
      { roomNumber: '201', roomType: 'Double', category: 'AC', pricePerNight: 2500, maxOccupancy: 2, floor: 2, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Mini Fridge'], description: 'Spacious AC double room for couples or colleagues' },
      { roomNumber: '202', roomType: 'Double', category: 'AC', pricePerNight: 2500, maxOccupancy: 2, floor: 2, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Mini Fridge'], description: 'Spacious AC double room for couples or colleagues' },
      { roomNumber: '203', roomType: 'Double', category: 'Non-AC', pricePerNight: 1800, maxOccupancy: 2, floor: 2, amenities: ['WiFi', 'TV', 'Fan', 'Attached Bathroom'], description: 'Budget-friendly non-AC double room' },
      
      // Suite Rooms
      { roomNumber: '301', roomType: 'Suite', category: 'AC', pricePerNight: 4000, maxOccupancy: 4, floor: 3, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Mini Fridge', 'Living Area', 'Work Desk'], description: 'Premium suite with separate living area' },
      { roomNumber: '302', roomType: 'Suite', category: 'AC', pricePerNight: 4000, maxOccupancy: 4, floor: 3, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Mini Fridge', 'Living Area', 'Work Desk'], description: 'Premium suite with separate living area' },
      
      // Deluxe Rooms
      { roomNumber: '401', roomType: 'Deluxe', category: 'AC', pricePerNight: 5500, maxOccupancy: 4, floor: 4, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Mini Fridge', 'Living Area', 'Work Desk', 'Balcony', 'Room Service'], description: 'Luxury deluxe room with premium amenities and balcony' },
      { roomNumber: '402', roomType: 'Deluxe', category: 'AC', pricePerNight: 5500, maxOccupancy: 4, floor: 4, amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom', 'Mini Fridge', 'Living Area', 'Work Desk', 'Balcony', 'Room Service'], description: 'Luxury deluxe room with premium amenities and balcony' },
    ];

    await Room.insertMany(rooms);
    console.log(`Created ${rooms.length} rooms`);

    // Create Staff Members
    const staffMembers = [
      { name: 'Rajesh Kumar', phone: '9876543221', email: 'rajesh@iiitdmj.ac.in', role: 'Reception', shift: 'Morning', shiftTimings: { start: '06:00', end: '14:00' }, salary: 25000 },
      { name: 'Priya Singh', phone: '9876543222', email: 'priya@iiitdmj.ac.in', role: 'Reception', shift: 'Evening', shiftTimings: { start: '14:00', end: '22:00' }, salary: 25000 },
      { name: 'Amit Verma', phone: '9876543223', email: 'amit@iiitdmj.ac.in', role: 'Security', shift: 'Night', shiftTimings: { start: '22:00', end: '06:00' }, salary: 20000 },
      { name: 'Sunita Devi', phone: '9876543224', email: 'sunita@iiitdmj.ac.in', role: 'Housekeeping', shift: 'Morning', shiftTimings: { start: '07:00', end: '15:00' }, salary: 18000 },
      { name: 'Ramesh Yadav', phone: '9876543225', email: 'ramesh@iiitdmj.ac.in', role: 'Housekeeping', shift: 'Evening', shiftTimings: { start: '15:00', end: '23:00' }, salary: 18000 },
      { name: 'Vikram Sharma', phone: '9876543226', email: 'vikram@iiitdmj.ac.in', role: 'Maintenance', shift: 'Morning', shiftTimings: { start: '08:00', end: '16:00' }, salary: 22000 },
      { name: 'Geeta Kumari', phone: '9876543227', email: 'geeta@iiitdmj.ac.in', role: 'Kitchen', shift: 'Morning', shiftTimings: { start: '05:00', end: '13:00' }, salary: 20000 },
      { name: 'Suresh Pandey', phone: '9876543228', email: 'suresh@iiitdmj.ac.in', role: 'Manager', shift: 'Morning', shiftTimings: { start: '09:00', end: '18:00' }, salary: 40000 },
    ];

    await Staff.insertMany(staffMembers);
    console.log(`Created ${staffMembers.length} staff members`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@iiitdmj.ac.in / admin123');
    console.log('Guest: guest@example.com / guest123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
