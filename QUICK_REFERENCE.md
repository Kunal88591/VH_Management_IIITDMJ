# 🚀 Quick Deployment Reference

## SSH Access

```bash
ssh vh@172.27.16.37
cd /home/vh/VH_Management_IIITDMJ
```

---

## Backend Management (PM2)

### Start Backend
```bash
cd /home/vh/VH_Management_IIITDMJ/backend

# Using ecosystem config (recommended)
pm2 start ecosystem.config.js --env production

# Or manually
pm2 start server.js --name "vh-backend"
```

### View Status
```bash
pm2 status                    # List all processes
pm2 list                      # Detailed process list
pm2 info vh-backend          # Info about specific process
pm2 monit                    # Real-time monitoring
```

### Logs
```bash
pm2 logs vh-backend                    # View logs
pm2 logs vh-backend --lines 100        # Last 100 lines
pm2 logs vh-backend --err              # Error logs only
pm2 flush                              # Clear all logs
pm2 save                               # Save state
```

### Control
```bash
pm2 restart vh-backend      # Restart process
pm2 reload vh-backend       # Graceful restart
pm2 stop vh-backend         # Stop process
pm2 start vh-backend        # Start process
pm2 delete vh-backend       # Remove process
```

### Startup on Boot
```bash
pm2 startup                 # Create startup script
pm2 save                    # Save current state
sudo systemctl status pm2-vh  # Check if pm2 service is active
```

---

## Frontend Management (Nginx)

### Build
```bash
cd /home/vh/VH_Management_IIITDMJ/frontend
npm install
npm run build
# Output: dist/ directory
```

### Nginx Status
```bash
sudo systemctl status nginx              # Check status
sudo systemctl restart nginx             # Restart
sudo systemctl reload nginx              # Reload config
sudo nginx -t                            # Test config
sudo tail -f /var/log/nginx/error.log   # Error logs
```

### Nginx Logs
```bash
sudo tail -50 /var/log/nginx/access.log          # Access logs
sudo tail -50 /var/log/nginx/error.log           # Error logs
sudo journalctl -u nginx -n 50 --no-pager       # System logs
```

---

## Verify Everything is Working

### Test Frontend
```bash
curl http://172.27.16.37/         # Should return HTML
curl http://vh.iiitdmj.ac.in/     # With domain
```

### Test Backend
```bash
curl http://localhost:5000/api/rooms        # Direct
curl http://172.27.16.37/api/rooms          # Via Nginx
# Should return JSON room data
```

### Test Email (Forgot Password)
```bash
curl -X POST http://172.27.16.37/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Update Deployment

### Update Backend
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main
cd backend
npm install
pm2 restart vh-backend
pm2 save
```

### Update Frontend
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main
cd frontend
npm install
npm run build
sudo systemctl reload nginx
```

### Full Update (Backend + Frontend)
```bash
cd /home/vh/VH_Management_IIITDMJ
git pull origin main

# Backend
cd backend
npm install
pm2 restart vh-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## Configuration Files

### .env Location
```
/home/vh/VH_Management_IIITDMJ/backend/.env
```

### Nginx Config
```
/etc/nginx/sites-available/vh
/etc/nginx/sites-enabled/vh -> symlink to above
```

### Backend Server
```
/home/vh/VH_Management_IIITDMJ/backend/server.js
```

### Frontend Build Output
```
/home/vh/VH_Management_IIITDMJ/frontend/dist/
```

---

## Database Operations

### Connect to MongoDB
```bash
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vh_management"

# Common commands once connected:
db.collections()                              # List collections
db.bookings.find({}).count()                  # Count bookings
db.bookings.deleteMany({})                    # Delete all
db.bookings.deleteMany({ checkOut: { $lt: new Date() } })  # Delete expired
```

---

## Security Checks

### Verify .env NOT in Git
```bash
git log --all --full-history -- backend/.env  # Should not appear
git status                                    # .env should NOT be listed
cat backend/.gitignore | grep "^.env"        # Should find .env
```

### Check File Permissions
```bash
ls -la backend/.env              # Should NOT be world-readable
chmod 600 backend/.env          # If needed
```

### Verify Secrets Not in Code
```bash
git log -p | grep -i "email_pass|jwt_secret|mongodb_uri"  # Should be empty
```

---

## Troubleshooting

### Backend Down?
```bash
pm2 status                       # Check status
pm2 logs vh-backend              # Check logs
pm2 restart vh-backend
pm2 save
```

### API Returns 502?
```bash
curl http://localhost:5000/api/rooms       # Test direct connection
pm2 logs vh-backend                        # Check backend logs
sudo tail -f /var/log/nginx/error.log     # Check nginx logs
sudo nginx -t                              # Verify nginx config
```

### Frontend Not Loading?
```bash
ls -la frontend/dist/index.html   # Verify build exists
npm run build                     # Rebuild if missing
sudo systemctl reload nginx
curl http://172.27.16.37/        # Test
```

### Email Not Working?
```bash
pm2 logs vh-backend | grep -i "email"      # Check logs
cat backend/.env | grep EMAIL              # Verify credentials
# Test with: forgot-password endpoint
```

---

## Common Commands Cheatsheet

```bash
# Monitor in real-time
pm2 monit

# Restart everything
pm2 restart all

# Stop everything
pm2 stop all

# Purge logs
pm2 flush

# Check which Node version is running
node --version
npm --version

# Check disk space
df -h

# Check memory usage
free -h
ps aux | grep node

# Check ports
netstat -tulpn | grep :5000    # Backend
netstat -tulpn | grep :80      # Nginx
netstat -tulpn | grep :443     # HTTPS (if configured)
```

---

## Important Reminders

🔐 **SECURITY:**
- Never commit `.env` file
- Use Gmail App Password (not regular password)
- Keep JWT_SECRET random and long
- Whitelist server IP in MongoDB Atlas

⚡ **PERFORMANCE:**
- NODE_ENV=production in .env
- Run `npm run build` for frontend
- Use PM2 cluster mode
- Monitor with `pm2 monit`

📊 **MONITORING:**
- Check logs: `pm2 logs vh-backend`
- Monitor: `pm2 monit`
- Health check: `curl http://172.27.16.37/api/rooms`

🔄 **UPDATES:**
- Git pull before npm install
- Rebuild frontend after updates
- Restart PM2 after backend updates
- Reload Nginx after frontend updates

---

**Last Updated:** March 17, 2026
