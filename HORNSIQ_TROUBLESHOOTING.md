# HornsIQ Troubleshooting Guide

**Issue:** HornsIQ chat doesn't connect when accessing from remote machine
**Server:** 192.168.1.197 (Local Network) / 100.111.213.15 (Tailscale)

---

## Quick Test - Is HornsIQ Accessible?

### **1. Test from your remote machine:**

Open browser and navigate to:
```
http://192.168.1.197:3978
```

**Expected:** You should see the HornsIQ chat interface load.

**If the page doesn't load at all:**
- Check firewall on server
- Verify Docker container is running: `docker ps | grep hornsiq`
- Check if port 3978 is exposed: `sudo netstat -tulpn | grep 3978`

---

## Common Issues

### **Issue 1: Page Loads but Chat Says "Can't Connect"**

**Symptom:** The HornsIQ interface appears, but when you send a message, you get an error like "Failed to send message" or "Connection error"

**Cause:** The backend (HornsIQ server) can't reach the Onyx server

**Check:**

1. **Verify Onyx is running on the other machine:**
   ```bash
   curl http://192.168.1.160:3080/health
   ```

2. **Check HornsIQ container logs:**
   ```bash
   docker logs horns-demo-hornsiq-1 --tail 50
   ```

   Look for errors like:
   - `Connection refused`
   - `Timeout`
   - `401 Unauthorized`

3. **Test Onyx API from the HornsIQ container:**
   ```bash
   docker exec horns-demo-hornsiq-1 python3 -c "import urllib.request; print(urllib.request.urlopen('http://192.168.1.160:3080/api/health', timeout=5).read())"
   ```

**Solution if Onyx isn't reachable:**

Update the Onyx URL in docker-compose.yml:
```bash
cd /home/horns/horns-demo
```

Edit `docker-compose.yml` and change line 44:
```yaml
- ONYX_API_URL=http://[CORRECT_IP]:3080
```

Then rebuild:
```bash
docker compose up -d hornsiq
```

---

### **Issue 2: Browser Console Errors**

**How to Check:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try sending a message in HornsIQ
4. Look for red error messages

**Common errors and fixes:**

#### **Error: "Failed to fetch" or "Network Error"**

**Cause:** Browser can't reach the HornsIQ server

**Fix:** Make sure you're using the correct URL:
- ✅ `http://192.168.1.197:3978` (if on same network)
- ✅ `http://100.111.213.15:3978` (if on Tailscale)
- ❌ `http://localhost:3978` (only works on server itself)

#### **Error: "CORS policy blocked"**

**Cause:** CORS misconfiguration (unlikely - we have `allow_origins=["*"]`)

**Fix:** Check if you're accessing via HTTPS (you should use HTTP):
- ✅ `http://192.168.1.197:3978`
- ❌ `https://192.168.1.197:3978`

---

### **Issue 3: Mixed Content Warnings**

**Symptom:** If you access HornsIQ via HTTPS (which you shouldn't), the browser blocks HTTP API calls

**Fix:** Always use HTTP for the demo:
```
http://192.168.1.197:3978  ✅
https://192.168.1.197:3978 ❌
```

---

## Testing HornsIQ Locally First

Before the demo, test from the server itself:

### **1. Test on localhost (from server):**
```bash
curl http://localhost:3978/health
```

Should return:
```json
{"status":"healthy","service":"hornsiq-web"}
```

### **2. Test chat endpoint:**
```bash
curl -X POST http://localhost:3978/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, test message","persona_id":0}'
```

Should return a JSON response (not an error).

---

## Step-by-Step Remote Access Test

### **From your demo machine (not the server):**

1. **Open browser**

2. **Navigate to HornsIQ:**
   ```
   http://192.168.1.197:3978
   ```

3. **Open browser DevTools** (F12)

4. **Go to Network tab** in DevTools

5. **Send a test message** in the chat

6. **Look at the Network tab:**
   - You should see a POST request to `/api/chat`
   - Click on it to see the response
   - **If response is 200 OK:** Backend is working
   - **If response is 500 Error:** Check HornsIQ logs (Onyx connection issue)
   - **If no request shows up:** Browser can't reach the server

---

## Docker Container Checks

### **Verify all containers are running:**
```bash
docker ps
```

Should show:
- `horns-demo-dashboard-1` (port 3002)
- `horns-demo-api-1` (port 8001)
- `horns-demo-hornsiq-1` (port 3978)

### **Check HornsIQ logs for errors:**
```bash
docker logs horns-demo-hornsiq-1 --follow
```

Leave this running and try sending a chat message. You should see:
- `POST /api/chat HTTP/1.1" 200 OK` (success)

Or you might see:
- Connection errors to Onyx
- Timeout errors
- 500 errors

### **Restart HornsIQ if needed:**
```bash
docker compose restart hornsiq
```

---

## Onyx Server Configuration

### **Current Configuration:**

From docker-compose.yml:
```yaml
ONYX_API_URL=http://192.168.1.160:3080
```

### **Verify Onyx is Accessible:**

From the server running HornsIQ:
```bash
curl -I http://192.168.1.160:3080
```

Should return HTTP headers (not connection refused).

### **If Onyx IP Changed:**

1. Find the correct IP:
   ```bash
   ping welcometocostco
   ```

2. Update docker-compose.yml:
   ```yaml
   - ONYX_API_URL=http://[NEW_IP]:3080
   ```

3. Restart:
   ```bash
   docker compose up -d hornsiq
   ```

---

## Quick Fixes

### **Fix 1: Restart Everything**
```bash
cd /home/horns/horns-demo
docker compose down
docker compose up -d
```

Wait 10 seconds, then test again.

### **Fix 2: Clear Browser Cache**

On your demo machine:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### **Fix 3: Check Firewall**

On the server:
```bash
sudo ufw status
```

If active, ensure ports are allowed:
```bash
sudo ufw allow 3002  # Dashboard
sudo ufw allow 8001  # API
sudo ufw allow 3978  # HornsIQ
```

---

## Expected vs Actual Behavior

### **✅ Working:**
- Load http://192.168.1.197:3978 → Chat interface appears
- Type "Hello" and press Enter → Response appears after 2-3 seconds
- Network tab shows POST to `/api/chat` with 200 OK

### **❌ Not Working:**
- Page doesn't load at all → Firewall/networking issue
- Page loads but "Can't connect" error → Onyx backend issue
- Infinite loading → Timeout connecting to Onyx

---

## For the Demo (Emergency Backup)

If HornsIQ doesn't work from remote machine:

### **Option 1: Present from Server**
- Connect monitor/screen share from the server directly
- Access: `http://localhost:3978`

### **Option 2: Use Screenshots/Recording**
- Pre-record HornsIQ demo
- Show functionality via recording

### **Option 3: SSH Port Forward**
From your demo machine:
```bash
ssh -L 3978:localhost:3978 horns@192.168.1.197
```

Then access: `http://localhost:3978` (it will tunnel through SSH)

---

## Most Likely Issue

Based on the symptoms, the most common issue is:

**The Onyx server (at 192.168.1.160:3080) requires authentication or the API endpoints have changed.**

The HornsIQ container logs showed successful connections, but when I tested the Onyx API, it returned an HTML login page instead of JSON. This means:

1. Onyx might require authentication (API key)
2. The API endpoint path might have changed
3. Onyx might be redirecting unauthenticated requests to the login page

### **Quick Test:**

From the server, check what Onyx returns:
```bash
curl -v http://192.168.1.160:3080/api/chat/create-chat-session \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"persona_id":0}'
```

If you get HTML back (not JSON), then Onyx needs authentication configured.

### **Fix:**

Check if there's an Onyx API key and add it to `.env`:
```bash
cd /home/horns/horns-demo
echo "ONYX_API_KEY=your_api_key_here" >> .env
docker compose up -d hornsiq
```

---

## Contact Info for Debugging

When asking for help, provide:

1. **Error message** (exact text from browser or logs)
2. **Browser console output** (F12 → Console tab)
3. **HornsIQ logs:** `docker logs horns-demo-hornsiq-1 --tail 50`
4. **Network tab** (F12 → Network → screenshot of failed request)

---

**Last Updated:** 2026-01-18
**Demo Date:** January 21, 2026

Good luck! 🚀
