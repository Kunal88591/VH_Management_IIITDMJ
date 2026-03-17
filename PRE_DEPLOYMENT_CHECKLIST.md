# 📦 Pre-Deployment Checklist

Complete this checklist before deploying to `172.27.16.37`

---

## 📋 Prerequisites

- [ ] Server SSH access: `ssh vh@172.27.16.37`
- [ ] Repository cloned on server: `/home/vh/VH_Management_IIITDMJ`
- [ ] Node.js v18+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Git installed: `git --version`
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Nginx installed: `sudo systemctl status nginx`
- [ ] MongoDB Atlas cluster created
- [ ] Repository access (git credentials configured)

---

## 🔐 Email Service Configuration

### Gmail Account Setup
- [ ] Create dedicated Gmail account (e.g., `vh-system@gmail.com`)
- [ ] Enable 2-Step Verification
  - [ ] Visit https://myaccount.google.com/security
  - [ ] Enable 2-Step Verification
- [ ] Generate App Password
  - [ ] Visit https://myaccount.google.com/apppasswords
  - [ ] Select "Mail" → "Windows Computer"
  - [ ] Copy 16-character app password
  - [ ] Store safely (format: `xxxx xxxx xxxx xxxx`)

### Email Service Code
- [ ] Backend `.env` includes EMAIL_USER
- [ ] Backend `.env` includes EMAIL_PASS (16-char app password)
- [ ] Backend `.env` includes EMAIL_FROM  
- [ ] Backend `.env` includes CLIENT_URL = `http://172.27.16.37`
- [ ] Backend `.env` includes FRONTEND_URL = `http://172.27.16.37`
- [ ] `emailService.js` uses nodemailer with Gmail SMTP
- [ ] Password reset route uses `process.env.FRONTEND_URL`
- [ ] Email config: `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`

---

## 🗄️ Database Configuration

### MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created (username + password)
- [ ] Full connection string copied
- [ ] IP Whitelist includes:
  - [ ] Server IP: `172.27.16.37`
  - [ ] Or `0.0.0.0/0` (all IPs) for development

### Backend Configuration
- [ ] `.env` includes valid `MONGODB_URI`
- [ ] Connection string format verified:
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vh_management?retryWrites=true&w=majority
  ```
- [ ] Test connection before deployment

---

## 🔑 Security Configuration

### JWT & Secrets
- [ ] JWT_SECRET is random and 32+ characters: `openssl rand -base64 32`
- [ ] JWT_SECRET in `.env`, NOT in code
- [ ] Set NODE_ENV=production in backend `.env`

### .gitignore Verification
- [ ] `.env` is in `.gitignore`
- [ ] `.gitignore` includes `node_modules/`, `dist/`, `build/`
- [ ] No `backend/uploads/` tracked (except `.gitkeep`)
- [ ] Git credentials or SSH keys NOT in repository
- [ ] Verify: `git status` shows no `.env` files

### API Security
- [ ] Frontend calls `/api/*` endpoints (with leading slash)
- [ ] Backend API routes correctly configured
- [ ] Auth middleware implemented for protected routes
- [ ] Password reset token expires after 1 hour

---

## 🖥️ Backend Configuration

### Package & Dependencies
- [ ] `backend/package.json` exists with all dependencies
- [ ] `npm install` runs without errors
- [ ] `npm install --production` works for production

### Server Files
- [ ] `backend/server.js` exists
- [ ] `backend/server.js` listens on PORT from env
- [ ] Database models in `backend/models/`
- [ ] Routes in `backend/routes/`
- [ ] `auth.js` has forgot-password route
- [ ] `auth.js` has reset-password route

### Environment Variables
Required `.env` variables in backend:
- [ ] `PORT=5000`
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=...`
- [ ] `JWT_SECRET=...`
- [ ] `JWT_EXPIRE=7d`
- [ ] `EMAIL_USER=...`
- [ ] `EMAIL_PASS=...`
- [ ] `EMAIL_FROM=...`
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `CLIENT_URL=http://172.27.16.37`
- [ ] `FRONTEND_URL=http://172.27.16.37`

### API Endpoints
- [ ] Test: `curl http://localhost:5000/api/rooms`
- [ ] Routes respond with JSON
- [ ] Error handling implemented
- [ ] CORS configured (if needed)

---

## 🎨 Frontend Configuration

### Build & Output
- [ ] `frontend/package.json` exists
- [ ] `npm install` runs without errors
- [ ] `npm run build` creates `frontend/dist/` folder
- [ ] `frontend/dist/index.html` exists after build
- [ ] `frontend/dist/assets/` folder has JavaScript bundles

### Vite Configuration
- [ ] `vite.config.js` configured for production build
- [ ] Development proxy points to `http://localhost:5000`
- [ ] API service uses `/api/` prefix

### API Integration
- [ ] `frontend/src/services/api.js` exists
- [ ] API base URL is `/api` in development
- [ ] All API calls use relative paths `/api/*`
- [ ] No hardcoded `localhost:5000` in code
- [ ] Environment variables for API URL (if needed)

### Test Build
- [ ] Run: `npm run build`
- [ ] Verify `dist/index.html` created
- [ ] Verify `dist/assets/` has bundles
- [ ] Bundle size reasonable (<5MB)

---

## 🌐 Nginx Configuration

### Configuration Files
- [ ] Nginx installed: `npm -v` ... wait, nginx is system package
- [ ] Actually: `sudo nginx -v`
- [ ] Nginx service running: `sudo systemctl status nginx`
- [ ] Create config at `/etc/nginx/sites-available/vh`
- [ ] Config includes reverse proxy to `http://localhost:5000`
- [ ] Config serves frontend from `/home/vh/.../frontend/dist`
- [ ] Config has SPA routing: `try_files $uri $uri/ /index.html`

### Nginx Config Content
- [ ] Listen on port 80
- [ ] Server name: `vh.iiitdmj.ac.in` and `172.27.16.37`
- [ ] Frontend root: `/home/vh/VH_Management_IIITDMJ/frontend/dist`
- [ ] API location `/api/`: proxy to `http://localhost:5000`
- [ ] Security headers configured
- [ ] Gzip compression enabled
- [ ] Upload size limit set to 50M

### Nginx Enablement
- [ ] Create symlink: `sudo ln -s /etc/nginx/sites-available/vh /etc/nginx/sites-enabled/vh`
- [ ] Test config: `sudo nginx -t` (should say OK)
- [ ] Reload: `sudo systemctl reload nginx`
- [ ] Or restart: `sudo systemctl restart nginx`

---

## 🚀 PM2 Configuration

### PM2 Setup
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] `ecosystem.config.js` exists in backend folder
- [ ] Config specifies correct path to `server.js`
- [ ] Config sets `NODE_ENV=production`
- [ ] Config sets `PORT=5000`

### PM2 Ecosystem File
- [ ] File location: `/home/vh/VH_Management_IIITDMJ/backend/ecosystem.config.js`
- [ ] Start command: `pm2 start ecosystem.config.js --env production`
- [ ] Or manual: `pm2 start server.js --name "vh-backend"`
- [ ] Startup on reboot: `pm2 startup` + `pm2 save`

---

## 🧪 Pre-Deployment Testing

### Backend Testing
- [ ] SSH to server
- [ ] Navigate to backend folder
- [ ] Run: `npm install`
- [ ] Create `.env` with all variables
- [ ] Run: `pm2 start server.js --name "test-server"`
- [ ] Test: `curl http://localhost:5000/api/rooms`
- [ ] Verify: JSON response received
- [ ] Check logs: `pm2 logs test-server`
- [ ] Cleanup: `pm2 delete test-server`

### Frontend Testing
- [ ] Navigate to frontend folder
- [ ] Run: `npm install`
- [ ] Run: `npm run build`
- [ ] Verify: `dist/` folder created with HTML/JS/CSS
- [ ] Test build size: `du -sh dist/`

### End-to-End Testing
- [ ] Start backend: `pm2 start server.js --name "test-backend"`
- [ ] Copy frontend dist to temp location
- [ ] Configure temporary Nginx to serve it
- [ ] Test: Can access frontend at `http://172.27.16.37/`
- [ ] Test: Can reach API at `http://172.27.16.37/api/rooms`
- [ ] Test: SPA routing works (visit `/rooms`, should load)
- [ ] Cleanup PM2: `pm2 delete test-backend`

---

## 🚀 Actual Deployment Steps

### Step 1: Backend
- [ ] SSH: `ssh vh@172.27.16.37`
- [ ] Navigate: `cd /home/vh/VH_Management_IIITDMJ/backend`
- [ ] Update code: `git pull origin main` (if not first deploy)
- [ ] Install deps: `npm install --production`
- [ ] Create `.env` with all variables
- [ ] Start PM2: `pm2 start ecosystem.config.js --env production`
- [ ] Save state: `pm2 save`
- [ ] Setup boot: `pm2 startup` (follow instructions)
- [ ] Verify: `pm2 status`
- [ ] Check logs: `pm2 logs vh-backend`

### Step 2: Frontend
- [ ] Navigate: `cd /home/vh/VH_Management_IIITDMJ/frontend`
- [ ] Update code: `git pull origin main` (if not first deploy)
- [ ] Install deps: `npm install --production`
- [ ] Build: `npm run build`
- [ ] Verify: `ls -la dist/index.html`

### Step 3: Nginx
- [ ] Copy config: Follow NGINX_CONFIG.conf
- [ ] Or use file in repo: `NGINX_CONFIG.conf`
- [ ] Create: `sudo cp NGINX_CONFIG.conf /etc/nginx/sites-available/vh`
- [ ] Enable: `sudo ln -s /etc/nginx/sites-available/vh /etc/nginx/sites-enabled/vh`
- [ ] Test: `sudo nginx -t`
- [ ] Reload: `sudo systemctl reload nginx`
- [ ] Verify status: `sudo systemctl status nginx`

---

## ✅ Post-Deployment Verification

### Access & Connectivity
- [ ] Frontend loads: `curl http://172.27.16.37/`
- [ ] API accessible: `curl http://172.27.16.37/api/rooms`
- [ ] Returns JSON (not HTML error)
- [ ] Nginx accessing backend: Check `/var/log/nginx/vh_error.log`

### Backend Health
- [ ] Process running: `pm2 status` shows `vh-backend online`
- [ ] Listening on 5000: `netstat -tulpn | grep 5000`
- [ ] Logs clean: `pm2 logs vh-backend` shows no errors
- [ ] Database connected: Check logs for "MongoDB Atlas Connected"

### Frontend Rendering
- [ ] Page HTML loads: `curl http://172.27.16.37/ | head -50`
- [ ] React app initializes
- [ ] No console errors (check browser DevTools)
- [ ] CSS loaded properly (page looks formatted)

### Email Testing
- [ ] Use forgot-password endpoint
- [ ] Email should arrive in inbox
- [ ] Link format: `http://172.27.16.37/reset-password/<token>`
- [ ] Link works (can access reset password page)

### API Testing
- [ ] GET /api/rooms → returns room list
- [ ] GET /api/auth/me (with token) → returns user
- [ ] POST /api/auth/forgot-password → sends email
- [ ] All endpoints respond with correct status codes

---

## 🔒 Security Verification

### Code Safety
- [ ] `.env` NOT in Git: `git log --all -- .env | head`
- [ ] No secrets in code: `git log -p | grep -i "email_pass|jwt_secret|password"`
- [ ] `.env` example provided: `.env.example` exists with placeholders

### File Permissions
- [ ] `.env` file permissions: `ls -la backend/.env` (should NOT show world-readable)
- [ ] If needed: `chmod 600 backend/.env`
- [ ] backend folder readable by nginx user

### Environment
- [ ] NODE_ENV=production in .env
- [ ] JWT_SECRET is random
- [ ] Email password is app password (not regular password)
- [ ] MongoDB IP whitelist includes server IP

---

## 📊 Monitoring Setup

### Logging
- [ ] PM2 logs location: `/home/vh/VH_Management_IIITDMJ/backend/logs/`
- [ ] Nginx access logs: `/var/log/nginx/vh_access.log`
- [ ] Nginx error logs: `/var/log/nginx/vh_error.log`
- [ ] Set up log rotation (optional)

### Monitoring Commands
- [ ] Real-time: `pm2 monit`
- [ ] Status: `pm2 status`
- [ ] Logs: `pm2 logs vh-backend --lines 100`
- [ ] Nginx: `sudo tail -f /var/log/nginx/vh_error.log`

---

## 🎉 Deployment Complete!

- [ ] All items above are checked
- [ ] System is running in production
- [ ] Users can access: `http://172.27.16.37`
- [ ] Admin can access admin features
- [ ] Email notifications working
- [ ] Password reset functional
- [ ] Bookings working
- [ ] Payment system functional
- [ ] Database persisting data

---

## 📝 Post-Deployment Documentation

- [ ] Create deployment date record
- [ ] Document any customizations made
- [ ] List emergency contacts
- [ ] Create disaster recovery plan
- [ ] Set up automated backups (MongoDB)
- [ ] Configure monitoring/alerting (optional)

---

## 🆘 If Something Goes Wrong

### Backend Not Starting
```bash
pm2 logs vh-backend
# Check for missing dependencies, env variables, DB connection
npm install
pm2 restart vh-backend
```

### API Returns 502
```bash
pm2 status                           # Is backend running?
curl http://localhost:5000/api/rooms  # Direct connection works?
sudo nginx -t                        # Config valid?
pm2 logs vh-backend                  # Check logs
```

### Email Not Sending
```bash
# Check credentials
cat backend/.env | grep EMAIL
# Test with forgot-password endpoint
pm2 logs vh-backend | grep -i "email"
```

### Frontend Shows 404
```bash
# Rebuild and verify dist
npm run build
ls -la frontend/dist/index.html
sudo systemctl reload nginx
```

---

**Deployment Version:** 1.0  
**Last Updated:** March 17, 2026  
**Server:** Production (172.27.16.37)
