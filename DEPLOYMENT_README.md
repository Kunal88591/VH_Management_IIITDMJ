# 🚀 VH Management System - Deployment Documentation

This directory contains complete deployment instructions for the VH Management System on IIITDMJ server (`172.27.16.37`).

---

## 📚 Documentation Files

### 1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** ← Start Here!
Complete step-by-step deployment guide with detailed explanations.
- Pre-deployment checklist
- Email service setup
- Environment variables configuration
- Backend deployment with PM2
- Frontend build & deployment
- Nginx configuration
- Verification & testing
- Troubleshooting guide

**Use this when:** You're deploying for the first time or need detailed explanations.

---

### 2. **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** ← Verification
Comprehensive checkbox-based pre-deployment verification.
- Prerequisites setup
- Email service configuration
- Database setup
- Security configuration
- Backend/Frontend setup verification
- Nginx configuration
- Testing protocols
- Post-deployment verification

**Use this when:** You want to verify everything is ready before going live.

---

### 3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ← Daily Operations
Quick reference guide for common commands and troubleshooting.
- SSH access & navigation
- PM2 commands (start, stop, logs, restart)
- Nginx commands (status, reload, logs)
- Frontend build commands
- Verification tests
- Update deployment steps
- Database operations
- Security checks
- Troubleshooting commands

**Use this when:** You need to quickly run a command or remember how to do something.

---

### 4. **[backend/.env.example](./backend/.env.example)**
Complete environment variables template for backend.
- All required variables documented
- Instructions for each variable
- Example values provided
- Security warnings included

**Use this when:** Creating the actual `.env` file on the server.

---

### 5. **[backend/ecosystem.config.js](./backend/ecosystem.config.js)**
PM2 ecosystem configuration file.
- Auto-restart configuration
- Cluster mode for multi-core systems
- Memory management
- Log file locations
- Graceful shutdown settings

**Use this when:** Starting PM2 with full configuration.

---

### 6. **[NGINX_CONFIG.conf](./NGINX_CONFIG.conf)**
Ready-to-use Nginx configuration file.
- Frontend static file serving
- SPA routing configuration
- API reverse proxy configuration
- Security headers
- Gzip compression
- Logging configuration
- WebSocket support

**Use this when:** Setting up Nginx on the server.

---

## 🎯 Quick Start (5 Minutes)

### For Experienced DevOps:

```bash
# 1. SSH to server
ssh vh@172.27.16.37

# 2. Clone/update repository
cd /home/vh
git clone <repo-url> VH_Management_IIITDMJ
cd VH_Management_IIITDMJ

# 3. Backend setup
cd backend
cp .env.example .env
# Edit .env with actual values (MongoDB, Gmail, etc.)
npm install
pm2 start ecosystem.config.js
pm2 save

# 4. Frontend setup
cd ../frontend
npm install
npm run build

# 5. Nginx setup
sudo cp NGINX_CONFIG.conf /etc/nginx/sites-available/vh
sudo ln -s /etc/nginx/sites-available/vh /etc/nginx/sites-enabled/vh
sudo nginx -t
sudo systemctl reload nginx

# 6. Verify
curl http://172.27.16.37/api/rooms
pm2 status
```

---

## 📋 Detailed Deployment (20-30 Minutes)

1. **Read:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) completely
2. **Prepare:** Complete [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
3. **Deploy:** Follow DEPLOYMENT_GUIDE.md step-by-step
4. **Verify:** Run all verification tests from DEPLOYMENT_GUIDE.md
5. **Bookmark:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for future use

---

## 🔐 Critical Security Items

### BEFORE GOING LIVE:

- [ ] `.env` file created on server (NOT in Git)
- [ ] `.env.example` in repository (with placeholders only)
- [ ] Gmail App Password generated (16 characters)
- [ ] JWT_SECRET is random 32+ characters
- [ ] MongoDB Atlas IP whitelist includes server IP
- [ ] NODE_ENV=production in `.env`
- [ ] No secrets printed in logs
- [ ] HTTPS/SSL configured (using Let's Encrypt)

### NEVER:
- Push `.env` file to Git
- Use regular Gmail password (use app password)
- Use weak JWT secret
- Share credentials in messages/emails/logs
- Run with NODE_ENV=development in production

---

## 🔄 Daily Operations

### Check System Status:
```bash
pm2 status              # Backend process
sudo systemctl status nginx  # Web server
curl http://172.27.16.37    # Frontend access
```

### View Logs:
```bash
pm2 logs vh-backend              # Backend logs
sudo tail -f /var/log/nginx/error.log  # Nginx errors
```

### Restart Components:
```bash
pm2 restart vh-backend           # Restart backend
sudo systemctl reload nginx      # Reload nginx
```

---

## 🆘 Troubleshooting Guide

### API Returns 502
**Probable causes:** Backend not running, Nginx config wrong
```bash
pm2 status                    # Check if vh-backend is online
pm2 logs vh-backend          # Check for errors
sudo nginx -t                # Validate Nginx config
```

### Email Not Sending
**Probable causes:** Wrong Gmail password, 2FA not enabled, credentials wrong
```bash
pm2 logs vh-backend | grep -i "email"
# Check .env for correct EMAIL_PASS (16 char app password)
# Verify 2-Step Verification enabled on Gmail account
```

### Frontend Shows 404
**Probable causes:** dist folder missing, Nginx not serving files
```bash
ls -la frontend/dist/index.html    # Verify build exists
npm run build                      # Rebuild if needed
sudo systemctl reload nginx        # Reload web server
```

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for complete troubleshooting.

---

## 📊 File Structure

```
VH_Management_IIITDMJ/
├── DEPLOYMENT_GUIDE.md              # ← Full deployment steps
├── PRE_DEPLOYMENT_CHECKLIST.md      # ← Pre-deployment checklist
├── QUICK_REFERENCE.md               # ← Quick command reference
├── NGINX_CONFIG.conf                # ← Nginx configuration
├── backend/
│   ├── .env.example                 # ← Environment variables template
│   ├── ecosystem.config.js          # ← PM2 configuration
│   ├── server.js                    # ← Express server
│   ├── routes/
│   │   └── auth.js                  # ← Forgot/Reset password routes
│   ├── utils/
│   │   ├── emailService.js          # ← Gmail SMTP setup
│   │   └── ...
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js               # ← API configuration
│   │   └── ...
│   ├── vite.config.js               # ← Vite dev proxy
│   ├── package.json
│   └── ...
└── ...
```

---

## 🔗 Important URLs

| Service | URL | Status Check |
|---------|-----|---|
| Frontend | `http://172.27.16.37/` | Browse in browser |
| Domain | `http://vh.iiitdmj.ac.in/` | If DNS configured |
| API Health | `http://172.27.16.37/api/rooms` | `curl` command |
| Backend Direct | `http://localhost:5000/api/rooms` | On server only |
| SSH Access | `ssh vh@172.27.16.37` | Terminal command |

---

## 📱 Common Tasks

### Update Backend Code
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main
cd backend
npm install
pm2 restart vh-backend
```

### Update Frontend Code
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main
cd frontend
npm install
npm run build
sudo systemctl reload nginx
```

### Check Database Connection
```bash
cd backend
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message))"
```

### Monitor in Real-Time
```bash
pm2 monit    # Real-time process monitoring
```

### View Recent Logs
```bash
pm2 logs vh-backend --lines 50    # Last 50 log lines
```

---

## 📞 Support & Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)

### For Issues:
1. Check logs: `pm2 logs vh-backend`
2. Check Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) troubleshooting
4. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section

---

## ✨ Features & Components

### Backend (Node.js + Express)
- ✅ User authentication & authorization
- ✅ Room management & booking system
- ✅ Meal ordering system
- ✅ Staff management
- ✅ Billing & attendance tracking
- ✅ Password reset via email
- ✅ MongoDB database integration
- ✅ JWT token-based auth

### Frontend (React + Vite)
- ✅ Responsive design (Tailwind CSS)
- ✅ Admin dashboard
- ✅ User portal
- ✅ Booking form & management
- ✅ Payment integration
- ✅ Protected routes
- ✅ Real-time validation
- ✅ Invoice generation

---

## 🎉 Deployment Success Criteria

Your deployment is successful when:
- ✅ Frontend loads at `http://172.27.16.37/`
- ✅ API responds at `http://172.27.16.37/api/rooms`
- ✅ Users can register and login
- ✅ Password reset email works
- ✅ Admin dashboard functional
- ✅ Bookings can be created
- ✅ PM2 process is running: `pm2 status`
- ✅ Nginx is serving correctly: `sudo systemctl status nginx`

---

## 📅 Maintenance Schedule

### Daily
- Monitor `pm2 status`
- Check nginx error logs
- Review backend logs for errors

### Weekly
- Review user registrations
- Check database size
- Verify email service working
- Test password reset functionality

### Monthly
- Backup database (MongoDB Atlas handles this)
- Review log files and archive
- Update dependencies (npm update)
- Security audit

---

**Version:** 1.0  
**Last Updated:** March 17, 2026  
**Status:** Ready for Production ✅  
**Server:** 172.27.16.37  
**Domain:** vh.iiitdmj.ac.in (when DNS configured)
