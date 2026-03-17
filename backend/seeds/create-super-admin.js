#!/usr/bin/env node

/**
 * Create Super Admin User for VH Management System
 * This script creates the hidden system admin account
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

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'iiitdmj.vh.system@gmail.com' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists!');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Active: ${existingSuperAdmin.isActive}`);
      
      // Update to ensure password is correct if needed
      const passwordMatch = await existingSuperAdmin.comparePassword('admin@123');
      if (!passwordMatch) {
        console.log('\n🔄 Updating super admin password...');
        existingSuperAdmin.password = 'admin@123';
        await existingSuperAdmin.save();
        console.log('✅ Password updated');
      } else {
        console.log('✅ Password is correct');
      }
    } else {
      // Create super admin
      console.log('\n📝 Creating Super Admin...');
      const superAdmin = await User.create({
        name: 'System Super Admin',
        email: 'iiitdmj.vh.system@gmail.com',
        password: 'admin@123', // Will be hashed by pre-save hook
        phone: '0000000000',
        role: 'admin',
        isPrimaryAdmin: true,
        isActive: true
      });

      console.log('✅ Super Admin Created Successfully!');
      console.log(`   ID: ${superAdmin._id}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Name: ${superAdmin.name}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Active: ${superAdmin.isActive}`);
    }

    console.log('\n📋 Super Admin Login Credentials:');
    console.log('   Email: iiitdmj.vh.system@gmail.com');
    console.log('   Password: admin@123');
    console.log('\n⚠️  Keep these credentials SECRET!');
    console.log('   This is a hidden system admin account.\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
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
