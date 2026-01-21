# Biometric Machine Integration Guide

## Overview
This guide explains how to connect your existing biometric attendance device to the VH Management System.

---

## Prerequisites

1. **Staff Employee IDs in Database**
   - Each staff member must have an `employeeId` field
   - This ID should match the employee ID in your biometric device
   - Update staff records if needed

2. **Network Connectivity**
   - Biometric device should be on the same network as server
   - OR server should be accessible via public IP/domain

---

## Integration Code Added

### Webhook Endpoint
**URL:** `http://your-server:5000/api/attendance/biometric-webhook`

**Accepts:** POST requests with JSON data
```json
{
  "employeeId": "EMP001",
  "timestamp": "2026-01-21T09:30:00Z",
  "action": "check-in",
  "apiKey": "your-secret-key"
}
```

### Bulk Import Endpoint
**URL:** `http://your-server:5000/api/attendance/biometric-bulk`

**Accepts:** POST requests with array of records
```json
{
  "records": [
    {"employeeId": "EMP001", "timestamp": "2026-01-21T09:30:00Z", "action": "check-in"},
    {"employeeId": "EMP001", "timestamp": "2026-01-21T18:00:00Z", "action": "check-out"}
  ]
}
```

---

## Setup Instructions

### Step 1: Add Endpoint to Server

The example code has been created in `attendance_biometric_example.js`. 

**To activate:**
1. Copy the webhook endpoints to your main `attendance.js` file
2. Or import and use them in `server.js`

### Step 2: Configure Security (Important!)

Add to `.env` file:
```
BIOMETRIC_API_KEY=your-secret-key-here
```

Uncomment the API key validation in the webhook code.

### Step 3: Configure Your Biometric Device

**Option A: If device supports HTTP webhooks**
- Configure webhook URL in device settings
- Point to: `http://your-server-ip:5000/api/attendance/biometric-webhook`
- Set payload format to JSON
- Include employee ID and timestamp

**Option B: If device doesn't support webhooks**
- Set up a scheduled script to read device logs/database
- POST data to bulk import endpoint every 5-15 minutes

### Step 4: Test the Integration

```bash
# Test webhook with curl
curl -X POST http://localhost:5000/api/attendance/biometric-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "timestamp": "2026-01-21T09:30:00Z",
    "action": "check-in",
    "apiKey": "your-secret-key"
  }'
```

---

## Common Biometric Device Brands

### ZKTeco Devices
- Usually support HTTP push
- Configure in device web interface
- Can also use ZKTeco SDK for custom integration

### eSSL Devices
- Some models support webhooks
- May need middleware software
- Can export logs to CSV for batch import

### Suprema/BioStar
- Advanced API support
- Good webhook capabilities
- Check BioStar 2 documentation

### Hikvision
- Supports event notifications
- Configure HTTP notification in web interface

---

## Troubleshooting

**Issue:** Device not sending data
- Check network connectivity
- Verify webhook URL is correct and accessible
- Check device logs for error messages

**Issue:** Staff not found errors
- Ensure `employeeId` in database matches device
- Check case sensitivity
- Verify employee ID format

**Issue:** Duplicate entries
- Webhook includes duplicate detection
- Check device isn't sending same event multiple times

---

## Next Steps

Please provide:
1. **Biometric device brand/model**
2. **Does it support HTTP notifications?**
3. **Sample of employee ID format used in device**
4. **Can you access device admin interface?**

This will help customize the integration for your specific device!
