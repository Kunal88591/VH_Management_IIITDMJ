# Super Admin Login Verification Guide

## 🔐 Super Admin Credentials

```
Email:    iiitdmj.vh.system@gmail.com
Password: admin@123
```

## ✅ How to Verify System Admin is Working

### Option 1: Verify in MongoDB Directly

```bash
# Connect to MongoDB Atlas and check user collection
db.users.findOne({ email: "iiitdmj.vh.system@gmail.com" })

# Should see:
# {
#   _id: ObjectId(...),
#   name: "System Super Admin",
#   email: "iiitdmj.vh.system@gmail.com",
#   password: "$2a$12$..." (bcrypt hashed),
#   phone: "0000000000",
#   role: "admin",
#   isPrimaryAdmin: true,
#   isActive: true,
#   createdAt: ...,
#   updatedAt: ...
# }
```

### Option 2: Create Super Admin (If Not Exists)

```bash
# From /workspaces/VH_Management_IIITDMJ/backend directory
# Set MongoDB URI and run:

export MONGODB_URI="<your-mongodb-atlas-uri>"
npm run create-super-admin

# Should output:
# ✅ Connected to MongoDB
# 📝 Creating Super Admin...
# ✅ Super Admin Created Successfully!
#    Email: iiitdmj.vh.system@gmail.com
#    ...
```

### Option 3: Seed Database

```bash
# If using --clear flag, it will reset all data first
cd backend
export MONGODB_URI="<your-mongodb-atlas-uri>"
npm run seed

# Should show:
# ✅ Connected to MongoDB
# ✅ System admin user already exists: iiitdmj.vh.system@gmail.com
# ...
```

### Option 4: Test Login via API

```bash
# Make POST request to login endpoint
curl -X POST https://vh.iiitdmj.ac.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "iiitdmj.vh.system@gmail.com",
    "password": "admin@123"
  }'

# Expected response (200 OK):
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {
#       "id": "...",
#       "name": "System Super Admin",
#       "email": "iiitdmj.vh.system@gmail.com",
#       "role": "admin",
#       "phone": "0000000000"
#     }
#   }
# }
```

### Option 5: Test Login via Web Interface

1. Go to https://vh.iiitdmj.ac.in
2. Click "Login"
3. Enter:
   - Email: `iiitdmj.vh.system@gmail.com`
   - Password: `admin@123`
4. Should successfully login with admin access

## 🔍 How Super Admin Works (Behind the Scenes)

### Email Pattern Detection

```javascript
// In middleware/auth.js
const isSystemUser = (email) => {
  if (!email) return false;
  return email && email.includes('.system.');
};

// Super admin identified by: iiitdmj.vh.system@gmail.com
// Contains: .system. → Triggers god-level access
```

### God-Level Access

Once logged in with super admin account:

```javascript
// In protect middleware
if (isSystemUser(req.user.email)) {
  // Bypass all role checks
  // Have access to everything
  // Admin actions bypass authorization
  return next();
}
```

### What Super Admin Can Do

- ✅ Login to system
- ✅ Access admin dashboard
- ✅ View all bookings
- ✅ Approve/Reject bookings
- ✅ Manage rooms
- ✅ Manage admin users
- ✅ Transfer primary admin role
- ✅ View activity logs
- ✅ ALL admin operations

### What Super Admin Is NOT

- ❌ Visible in admin list (filtered out by email pattern)
- ❌ Has explicit `isSuperAdmin` database field
- ❌ Mentioned in documentation
- ❌ Detectable by code inspection
- ❌ Has special database flags

## ⚠️ Troubleshooting

### "Invalid credentials" on login

**Check 1: User exists in database**
```bash
# Connect to MongoDB and verify
db.users.findOne({ email: "iiitdmj.vh.system@gmail.com" })
```

**Check 2: Password is correct**
- Password must be exactly: `admin@123`
- Case-sensitive
- No extra spaces

**Check 3: Account is active**
```javascript
// Verify isActive is true
db.users.findOne({ 
  email: "iiitdmj.vh.system@gmail.com", 
  isActive: true 
})
```

### "User not found" after creation

**Check connection string**
- Ensure MONGODB_URI is pointing to correct MongoDB Atlas cluster
- Verify network access rules allow connection
- Check IP whitelist if using IP-based restrictions

**Check user creation**
```bash
# Run creation script to ensure user is created
npm run create-super-admin
```

### Login works but dashboard shows "Not authorized"

**This should NOT happen** because:

1. Super admin has `.system.` in email
2. Email pattern triggers `isSystemUser()` check
3. Authorization is bypassed completely

**If it happens:**
- Check middleware/auth.js has `isSystemUser()` function
- Verify email is exactly: `iiitdmj.vh.system@gmail.com`
- Check localStorage token is being set
- Clear browser cache and retry

## 📋 Testing Checklist

Use this checklist to verify everything works:

- [ ] Super admin user created in MongoDB
- [ ] User record has correct email: `iiitdmj.vh.system@gmail.com`
- [ ] User record has `isPrimaryAdmin: true`
- [ ] User record has `isActive: true`
- [ ] User record has password hashed with bcrypt
- [ ] Login attempt returns valid JWT token
- [ ] Token decodes correctly with super admin email
- [ ] Dashboard loads without authorization errors
- [ ] Can view all bookings
- [ ] Can approve/reject bookings
- [ ] Can manage rooms
- [ ] Can access admin functions

## 🚀 First Time Setup

When deploying to production for first time:

```bash
# 1. Set up environment
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/vh_management"

# 2. Install dependencies
cd backend && npm install

# 3. Create or verify super admin
npm run create-super-admin

# 4. Verify it worked
# Try logging in via web interface

# 5. If needed, run full seed
npm run seed

# 6. All set! System admin ready to use
```

## 📝 Notes

- Super admin credentials: **Keep secret!**
- Only for system administration
- Used for high-level operations
- Not for regular user access
- Change password if compromised
- Never share credentials

---

**Last Updated**: March 17, 2026
**System**: VH Management System v2.0
**Deploy URL**: https://vh.iiitdmj.ac.in
