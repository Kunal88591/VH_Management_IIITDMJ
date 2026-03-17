#!/usr/bin/env node

/**
 * Test System Account Login
 * Simulates the login process to debug credential issues
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI not set');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected');

    const User = require('../models/User');
    
    const systemEmail = 'iiitdmj.vh.system@gmail.com';
    const systemPassword = 'admin@123';
    
    console.log('\n📋 Testing system account login...');
    console.log(`Email: ${systemEmail}`);
    console.log(`Password: ${systemPassword}`);
    
    // Step 1: Find user
    console.log('\n1️⃣ Finding user in database...');
    const user = await User.findOne({ email: systemEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('   Run: npm run setup-account');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log(`✅ User found: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   HashedPassword length: ${user.password.length}`);
    
    // Step 2: Verify password
    console.log('\n2️⃣ Verifying password...');
    const isMatch = await user.comparePassword(systemPassword);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      console.log('   Attempting manual bcrypt verify...');
      
      // Manual verify
      const manualMatch = await bcrypt.compare(systemPassword, user.password);
      if (!manualMatch) {
        console.log('❌ Manual bcrypt verify also failed');
        console.log('   Password hash may be corrupted');
        console.log('   Run: npm run setup-account --force');
      }
      
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('✅ Password matches');
    
    // Step 3: Check if account is active
    console.log('\n3️⃣ Checking account status...');
    if (!user.isActive) {
      console.log('❌ Account is not active');
      console.log('   Activating...');
      user.isActive = true;
      await user.save();
      console.log('✅ Account activated');
    } else {
      console.log('✅ Account is active');
    }
    
    // Step 4: Ready to login
    console.log('\n✅ LOGIN TEST PASSED');
    console.log('   System account is ready to use');
    console.log('   Email: iiitdmj.vh.system@gmail.com');
    console.log('   Password: admin@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
