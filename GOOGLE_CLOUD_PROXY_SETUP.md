# Google Cloud Free Tier - Proxy Setup for Bybit API

## Overview
- **$300 credit** valid for 90 days (3 months)
- **Free f1-micro VM** with static IP
- After credit expires: ~$5-7/month for continued use
- Static IP remains yours as long as VM is running

---

## Step 1: Create Google Cloud Account

1. Go to **https://cloud.google.com/free**
2. Click **"Get started for free"**
3. Sign in with your Google account
4. Enter payment details (required but won't be charged during free trial)
5. Activate your **$300 free credit**

> ⚠️ You won't be charged until you manually upgrade to a paid account

---

## Step 2: Create a New Project

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Click the project dropdown (top left, next to "Google Cloud")
3. Click **"New Project"**
4. Name it: `bybit-proxy-server`
5. Click **"Create"**
6. Select your new project from the dropdown

---

## Step 3: Enable Compute Engine API

1. In the search bar, type **"Compute Engine API"**
2. Click on **"Compute Engine API"**
3. Click **"Enable"** (if not already enabled)
4. Wait 2-3 minutes for activation

---

## Step 4: Create VM Instance with Static IP

### 4.1 Create the VM

1. Go to **Compute Engine** → **VM instances** (or search "VM instances")
2. Click **"Create Instance"**
3. Configure as follows:

**Basic Settings:**
- **Name**: `bybit-proxy`
- **Region**: Choose a region close to you or allowed by Bybit:
  - `us-central1` (Iowa, USA)
  - `europe-west1` (Belgium)
  - `asia-southeast1` (Singapore)
- **Zone**: Any (e.g., `us-central1-a`)

**Machine Configuration:**
- **Series**: E2
- **Machine type**: `e2-micro` (2 vCPU, 1 GB memory)
  - This is **FREE tier eligible** (~$7.50/month after credits)
  - OR choose `f1-micro` (1 vCPU, 0.6 GB) for lower cost

**Boot Disk:**
- Click **"Change"**
- **Operating System**: Ubuntu
- **Version**: Ubuntu 22.04 LTS
- **Boot disk type**: Standard persistent disk
- **Size**: 10 GB (sufficient)
- Click **"Select"**

**Firewall:**
- ✅ Check **"Allow HTTP traffic"**
- ✅ Check **"Allow HTTPS traffic"**

4. Click **"Create"** at the bottom
5. Wait 1-2 minutes for VM to start

### 4.2 Reserve Static IP

1. While VM is creating, go to **VPC network** → **IP addresses** (left menu)
2. Click **"Reserve External Static Address"**
3. Configure:
   - **Name**: `bybit-proxy-static-ip`
   - **Network Service Tier**: Premium
   - **IP version**: IPv4
   - **Type**: Regional
   - **Region**: Same as your VM (e.g., `us-central1`)
   - **Attached to**: Select your VM `bybit-proxy`
4. Click **"Reserve"**
5. **Copy the IP address** - this is your permanent static IP! 📝

---

## Step 5: Configure Firewall Rules

1. Go to **VPC network** → **Firewall** (left menu)
2. Click **"Create Firewall Rule"**
3. Configure:
   - **Name**: `allow-proxy-8888`
   - **Direction**: Ingress
   - **Action on match**: Allow
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: 
     - ✅ TCP
     - Ports: `8888`
4. Click **"Create"**

---

## Step 6: Connect to VM and Install Proxy

### 6.1 SSH into VM

1. Go back to **Compute Engine** → **VM instances**
2. Find your `bybit-proxy` instance
3. Click the **"SSH"** button (opens browser terminal)

### 6.2 Install and Configure TinyProxy

Once connected via SSH, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install TinyProxy
sudo apt install tinyproxy -y

# Backup original config
sudo cp /etc/tinyproxy/tinyproxy.conf /etc/tinyproxy/tinyproxy.conf.backup

# Edit configuration
sudo nano /etc/tinyproxy/tinyproxy.conf
```

### 6.3 Configure TinyProxy

In the nano editor, make these changes:

**Find and modify these lines:**

```conf
# Change port (optional, default is 8888)
Port 8888

# Comment out or remove this line to allow external access:
# Allow 127.0.0.1
# (Add # in front or delete it)

# Allow all IPs (or restrict to your Replit IP for security)
Allow 0.0.0.0/0

# Disable Via header for privacy
DisableViaHeader Yes

# Allow HTTPS connections
ConnectPort 443
ConnectPort 80
```

**Save and exit:**
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

### 6.4 Restart and Enable TinyProxy

```bash
# Restart TinyProxy with new config
sudo systemctl restart tinyproxy

# Enable to start on boot
sudo systemctl enable tinyproxy

# Check status (should show "active (running)")
sudo systemctl status tinyproxy

# If you see green "active (running)" - success! ✅
```

---

## Step 7: Test Your Proxy

From your **local computer** or **Replit shell**, test:

```bash
# Replace <YOUR_GCP_STATIC_IP> with your actual IP from Step 4.2
curl -x http://<YOUR_GCP_STATIC_IP>:8888 https://api.bybit.com/v5/market/time
```

**Expected output:**
```json
{
  "retCode": 0,
  "retMsg": "OK",
  "result": {
    "timeSecond": "1729282345",
    "timeNano": "1729282345123456789"
  }
}
```

✅ If you see this JSON response, your proxy is working!

---

## Step 8: Update Replit Environment

1. In your Replit project, go to **Tools** → **Secrets**
2. Update or create the secret:
   - **Key**: `BYBIT_PROXY_URL`
   - **Value**: `http://<YOUR_GCP_STATIC_IP>:8888`
3. Click **"Save"**
4. Restart your workflow

---

## Step 9: Whitelist IP in Bybit

1. Log into **Bybit.com**
2. Go to **Account & Security** → **API Management**
3. Click on your API key (or create new one)
4. In **"IP addresses"** field, enter:
   ```
   <YOUR_GCP_STATIC_IP>
   ```
5. Click **"Confirm"**
6. Enter 2FA code if prompted
7. Save changes

---

## Step 10: Test Bybit Connection

In your Replit project, test the API:

```typescript
// Your app should now successfully connect to Bybit API
// The validation endpoint should work:
POST /api/copy-trading/validate-key
{
  "apiKey": "your-key",
  "apiSecret": "your-secret"
}
```

Expected: ✅ Success response with account info!

---

## 💰 Cost Breakdown

| Period | Cost | Notes |
|--------|------|-------|
| **First 90 days** | $0 | $300 free credit |
| **After credits** | ~$5-7/month | e2-micro VM + static IP |
| **Static IP cost** | ~$3/month | When VM is running (free if attached) |

### Cost Optimization:
- Static IPs are **FREE when attached to a running VM**
- Static IPs cost **$3/month when reserved but not attached**
- Stop VM when not in use to save costs (but static IP will cost $3/month)

---

## 🔒 Security Best Practices

### 1. Restrict Proxy Access (Recommended)

Edit TinyProxy config to allow only your Replit IP:

```bash
sudo nano /etc/tinyproxy/tinyproxy.conf

# Remove: Allow 0.0.0.0/0
# Add your Replit IP range instead:
Allow <YOUR_REPLIT_IP>
```

### 2. Set Up Firewall on VM

```bash
# Enable UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8888/tcp  # Proxy
sudo ufw enable
sudo ufw status
```

### 3. Monitor VM Activity

1. Go to **Monitoring** in GCP Console
2. Set up **alerts** for:
   - High CPU usage
   - High network egress
   - Unusual traffic patterns

### 4. Regular Updates

```bash
# SSH into VM and run weekly:
sudo apt update && sudo apt upgrade -y
sudo systemctl restart tinyproxy
```

---

## 🔧 Troubleshooting

### Problem: "Connection refused"
**Solution:**
```bash
# Check if TinyProxy is running
sudo systemctl status tinyproxy

# Check if port 8888 is listening
sudo netstat -tlnp | grep 8888

# Restart if needed
sudo systemctl restart tinyproxy
```

### Problem: "Forbidden" or "Access denied"
**Solution:**
- Check firewall rule allows port 8888
- Verify TinyProxy config has `Allow 0.0.0.0/0`
- Check GCP firewall rules in console

### Problem: VM stopped unexpectedly
**Solution:**
```bash
# In GCP Console, start the VM
# Then SSH and check logs:
sudo journalctl -u tinyproxy -n 50
```

---

## 📊 Monitoring & Maintenance

### Keep VM Active

GCP doesn't auto-delete free tier VMs, but you should monitor:

```bash
# Add to crontab to keep proxy active
crontab -e

# Add this line (pings Bybit API every 10 minutes):
*/10 * * * * curl -x http://127.0.0.1:8888 https://api.bybit.com/v5/market/time > /dev/null 2>&1
```

### Check Proxy Logs

```bash
# View live TinyProxy logs
sudo tail -f /var/log/tinyproxy/tinyproxy.log

# Check for errors
sudo grep -i error /var/log/tinyproxy/tinyproxy.log
```

---

## ✅ Final Checklist

- [ ] GCP account created with $300 credit
- [ ] VM instance running (e2-micro)
- [ ] Static IP reserved and attached
- [ ] Firewall rule allows port 8888
- [ ] TinyProxy installed and running
- [ ] Proxy tested with curl command
- [ ] Replit secret updated with proxy URL
- [ ] Bybit API key whitelisted with static IP
- [ ] Connection test successful

---

## 🎉 You're Done!

Your Google Cloud proxy is now set up with a permanent static IP. Your AlvaCapital platform can now:
- ✅ Connect to Bybit API through GCP proxy
- ✅ Validate API keys successfully
- ✅ Receive WebSocket data streams
- ✅ Execute trades without geo-restrictions

**Your static IP:** `<YOUR_GCP_STATIC_IP>`  
**Proxy URL:** `http://<YOUR_GCP_STATIC_IP>:8888`

---

## 📞 Need Help?

- **GCP Documentation**: https://cloud.google.com/compute/docs
- **TinyProxy Docs**: https://tinyproxy.github.io/
- **Bybit API Docs**: https://bybit-exchange.github.io/docs/v5/intro

---

**Estimated Setup Time:** 20-30 minutes  
**Monthly Cost (after free credit):** ~$5-7  
**Reliability:** ⭐⭐⭐⭐⭐
