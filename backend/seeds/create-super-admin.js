#!/usr/bin/env node

/**
 * System Account Creation Script
 * Creates a system-level account for application management
 * 
 * Usage environment variables:
 * - MONGODB_URI: MongoDB connection string (Atlas or local)
 * 
 * Run with: node seeds/create-super-admin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ ERROR: MONGODB_URI environment variable not set!');
      console.error('Please set MONGODB_URI before running this script.');
      console.error('\nExample:');
      console.error('  export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/vh_management"');
      console.error('  node seeds/create-super-admin.js');
      process.exit(1);
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check if system account already exists
    const existingSystemAccount = await User.findOne({ email: 'iiitdmj.vh.system@gmail.com' });
    
    if (existingSystemAccount) {
      console.log('ℹ️  System account already exists');
    } else {
      // Create system account
      const systemAccount = await User.create({
        name: 'System Account',
        email: 'iiitdmj.vh.system@gmail.com',
        password: 'admin@123',
        phone: '0000000000',
        role: 'admin',
        isPrimaryAdmin: true,
        isActive: true
      });

      console.log('✅ System account created successfully');
    }

    console.log('✅ Setup complete');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection refused. Make sure:');
      console.error('   1. MongoDB is running (if local)');
      console.error('   2. MONGODB_URI is set correctly');
      console.error('   3. Network access is allowed (if Atlas)');
    }
    process.exit(1);
  }
};

// Run the script
createSuperAdmin();
