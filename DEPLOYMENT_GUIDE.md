# 🚀 IIITDMJ Server Deployment Guide

Complete deployment instructions for VH Management System on `172.27.16.37`

---

## 📋 Pre-Deployment Checklist

- [ ] Server SSH access available (`ssh vh@172.27.16.37`)
- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] Gmail account created for email service
- [ ] Gmail App Password generated (not regular password)
- [ ] Node.js 18+ and npm installed on server
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Nginx installed and running
- [ ] Git installed and repository cloned

---

## 🔐 Step 1: Email Service Setup (CRITICAL)

### Gmail Configuration:
1. Create a dedicated Gmail account (e.g., `vh-system@gmail.com`)
2. Enable 2-Step Verification:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
3. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or equivalent)
   - Copy the 16-character app password (format: `xxxx xxxx xxxx xxxx`)
4. Add to `.env`:
   ```
   EMAIL_USER=vh-system@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

### Testing Email Service:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🔗 Step 2: Environment Variables Setup

### Backend Configuration:

1. SSH into server:
   ```bash
   ssh vh@172.27.16.37
   ```

2. Navigate to project:
   ```bash
   cd /home/vh/VH_Management_IIITDMJ/backend
   ```

3. Create `.env` file (use `.env.example` as template):
   ```bash
   cp .env.example .env
   nano .env
   ```

4. Update required variables:
   ```env
   PORT=5000
   NODE_ENV=production
   
   MONGODB_URI=your_full_mongodb_connection_string
   JWT_SECRET=generate_a_long_random_string_min_32_chars
   
   EMAIL_USER=vh-system@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=noreply@vh.iiitdmj.ac.in
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   
   CLIENT_URL=http://172.27.16.37
   FRONTEND_URL=http://172.27.16.37
   ```

5. Verify `.env` is in `.gitignore` (already added by default)

---

## 🖥️ Step 3: Backend Deployment with PM2

### Install Dependencies:
```bash
cd /home/vh/VH_Management_IIITDMJ/backend
npm install --production
```

### Start Backend with PM2:
```bash
pm2 start server.js --name "vh-backend"
pm2 save
pm2 startup
```

### Verify Backend is Running:
```bash
pm2 status
pm2 logs vh-backend
```

### Test Backend API:
```bash
curl http://localhost:5000/api/health
# or test any endpoint
curl http://localhost:5000/api/rooms
```

---

## 🎨 Step 4: Frontend Build & Deployment

### Build Frontend:
```bash
cd /home/vh/VH_Management_IIITDMJ/frontend
npm install --production
npm run build
```

### Verify Build Output:
```bash
ls -la dist/
# Should contain: index.html, assets/, etc.
```

---

## 🌐 Step 5: Nginx Configuration

### Create Nginx Config:
```bash
sudo nano /etc/nginx/sites-available/vh
```

### Paste Configuration:
```nginx
server {
    listen 80;
    server_name vh.iiitdmj.ac.in 172.27.16.37;

    # Frontend root directory
    root /home/vh/VH_Management_IIITDMJ/frontend/dist;
    index index.html;

    # SPA routing - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API reverse proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Enable Nginx Config:
```bash
sudo ln -s /etc/nginx/sites-available/vh /etc/nginx/sites-enabled/vh
```

### Test Nginx Config:
```bash
sudo nginx -t
```

### Reload Nginx:
```bash
sudo systemctl reload nginx
```

### Restart Nginx (if needed):
```bash
sudo systemctl restart nginx
```

### Check Nginx Status:
```bash
sudo systemctl status nginx
```

---

## ✅ Step 6: Verification & Testing

### Test Frontend Access:
```bash
curl http://172.27.16.37/
# Should return HTML content
```

### Test API Access:
```bash
curl http://172.27.16.37/api/rooms
# Should return rooms data
```

### Test Backend Directly:
```bash
curl http://localhost:5000/api/rooms
# Should work
```

### Test Password Reset (Email):
1. Go to http://172.27.16.37/forgot-password
2. Enter email
3. Check email inbox for reset link
4. Verify link format: `http://172.27.16.37/reset-password/<token>`

### Check PM2 Process:
```bash
pm2 logs vh-backend --lines 50
```

---

## 🔧 Step 7: Monitoring & Maintenance

### PM2 Commands:
```bash
# View all processes
pm2 list

# View process status
pm2 status

# View logs
pm2 logs vh-backend

# View specific error logs
pm2 logs vh-backend --err

# Restart backend
pm2 restart vh-backend

# Stop backend
pm2 stop vh-backend

# Delete process
pm2 delete vh-backend
```

### Check Service Status:
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://172.27.16.37/

# Nginx
sudo systemctl status nginx
```

---

## 🚨 Troubleshooting

### API Returns 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs vh-backend

# Restart backend
pm2 restart vh-backend

# Check Nginx config
sudo nginx -t

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Email Not Sending
```bash
# Check email credentials in .env
cat .env | grep EMAIL

# Check backend logs
pm2 logs vh-backend

# Test email manually:
# 1. Use forgot-password endpoint
# 2. Check PM2 logs for "Email sending failed" messages
# 3. Verify Gmail App Password (16 chars, not regular password)
# 4. Ensure 2-Step Verification is enabled on Gmail account
```

### Frontend Shows 404 Errors
```bash
# Verify dist folder exists
ls -la /home/vh/VH_Management_IIITDMJ/frontend/dist/

# Rebuild frontend
cd /home/vh/VH_Management_IIITDMJ/frontend
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

### Cannot Connect to MongoDB
```bash
# Check MongoDB URI in .env
cat .env | grep MONGODB_URI

# Verify IP whitelist in MongoDB Atlas:
# - Go to https://cloud.mongodb.com
# - Network Access → IP Whitelist
# - Add 172.27.16.37 or 0.0.0.0/0

# Test connection manually
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI);"
```

---

## 🔐 Security Checklist

### Must Do Before Going Live:
- [ ] `.env` is in `.gitignore` 
- [ ] `.env` file is NEVER committed to Git
- [ ] JWT_SECRET is a random 32+ character string
- [ ] Email password is Gmail App Password (not regular password)
- [ ] MongoDB Atlas IP whitelist includes server IP
- [ ] HTTPS configured (let's encrypt SSL)
- [ ] No debug logs in production
- [ ] NODE_ENV=production in backend `.env`

### Files to Never Commit:
```
.env
node_modules/
dist/
build/
*.log
uploads/*
```

---

## 📊 Performance Tips

### Backend Optimization:
```bash
# Use NODE_ENV=production
NODE_ENV=production pm2 start server.js

# Increase PM2 max memory (if needed)
pm2 start server.js --max-memory-restart 500M
```

### Frontend Optimization:
- [ ] Run `npm run build` to create optimized bundle
- [ ] Enable Gzip compression in Nginx
- [ ] Use CDN for static assets (optional)

---

## 🔄 Updating Deployment

### Update Backend Code:
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main
cd backend
npm install
pm2 restart vh-backend
```

### Update Frontend Code:
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main
cd frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## 📝 MongoDB Operations

### Delete All Bookings:
```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vh_management" --eval "db.bookings.deleteMany({})"
```

### Delete Expired Bookings:
```bash
db.bookings.deleteMany({ checkOut: { $lt: new Date() } })
```

### Clear Database:
```bash
# Connect to MongoDB, then:
db.dropDatabase()
```

---

## 📞 Support

For issues or questions:
1. Check logs: `pm2 logs vh-backend`
2. Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Verify all `.env` variables are set correctly
4. Ensure MongoDB connection string is valid
5. Test API endpoints with `curl` commands

---

**Last Updated:** March 17, 2026  
**Deployment Status:** Ready for Production ✅
