#!/usr/bin/env node

/**
 * Direct System Account Setup
 * Ensures system account exists in database
 * Safe to run multiple times
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const setupAccount = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI not set');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully');

    const User = require('../models/User');
    
    const systemEmail = 'iiitdmj.vh.system@gmail.com';
    const systemPassword = 'admin@123';
    
    // Check if exists
    let user = await User.findOne({ email: systemEmail });
    
    if (user) {
      console.log('Account already exists');
      console.log(`Email: ${user.email}`);
      console.log(`Active: ${user.isActive}`);
      
      // Verify password is correct
      const isMatch = await user.comparePassword(systemPassword);
      if (isMatch) {
        console.log('Password: CORRECT');
      } else {
        console.log('Password: INCORRECT - Updating...');
        user.password = systemPassword;
        await user.save();
        console.log('Password updated');
      }
    } else {
      console.log('Creating account...');
      
      // Hash password manually to verify
      const hashedPassword = await bcrypt.hash(systemPassword, 12);
      
      user = await User.create({
        name: 'System Account',
        email: systemEmail,
        password: systemPassword, // Will be hashed by pre-save hook
        phone: '0000000000',
        role: 'admin',
        isPrimaryAdmin: true,
        isActive: true
      });
      
      console.log('Account created successfully');
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
    }

    // Verify by logging in
    console.log('\nVerifying login...');
    const verifyUser = await User.findOne({ email: systemEmail }).select('+password');
    if (verifyUser) {
      const passwordMatch = await bcrypt.compare(systemPassword, verifyUser.password);
      if (passwordMatch) {
        console.log('✅ LOGIN VERIFICATION: SUCCESS');
      } else {
        console.log('❌ LOGIN VERIFICATION: FAILED - Password mismatch');
      }
    } else {
      console.log('❌ ACCOUNT NOT FOUND');
    }

    await mongoose.connection.close();
    console.log('Setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

setupAccount();
