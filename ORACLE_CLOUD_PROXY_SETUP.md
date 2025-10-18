# Oracle Cloud Free Tier - Proxy Setup for Bybit API

## Step 1: Create Oracle Cloud Account
1. Go to https://www.oracle.com/cloud/free/
2. Sign up for Always Free tier (no credit card charges)
3. Verify your account

## Step 2: Create VM Instance
1. Go to Compute → Instances → Create Instance
2. Choose **Always Free eligible** shape:
   - VM.Standard.A1.Flex (ARM)
   - 1 OCPU, 6GB RAM (or split into 2 VMs)
3. Select **Ubuntu 22.04** image
4. Download SSH key pair
5. Note the **Public IP address** - this is your static IP!

## Step 3: Configure Network Security
1. Go to Networking → Virtual Cloud Networks
2. Click your VCN → Security Lists → Default Security List
3. Add Ingress Rule:
   - Source CIDR: 0.0.0.0/0
   - Destination Port: 8888
   - Protocol: TCP

## Step 4: Install TinyProxy on VM
```bash
# SSH into your Oracle VM
ssh -i /path/to/key ubuntu@<YOUR_ORACLE_IP>

# Install TinyProxy
sudo apt update
sudo apt install tinyproxy -y

# Configure TinyProxy
sudo nano /etc/tinyproxy/tinyproxy.conf

# Make these changes:
# 1. Change Port to 8888 (or keep 8888)
# 2. Comment out or remove: Allow 127.0.0.1
# 3. Add: Allow 0.0.0.0/0  (allows all IPs - secure with firewall)
# 4. Set: DisableViaHeader Yes
# 5. Set: ConnectPort 443 80

# Restart TinyProxy
sudo systemctl restart tinyproxy
sudo systemctl enable tinyproxy

# Check status
sudo systemctl status tinyproxy
```

## Step 5: Update Your Replit Environment
In your Replit secrets, update:
```
BYBIT_PROXY_URL=http://<YOUR_ORACLE_IP>:8888
```

## Step 6: Test the Proxy
```bash
# From your local machine or Replit
curl -x http://<YOUR_ORACLE_IP>:8888 https://api.bybit.com/v5/market/time
```

If you see JSON response with server time, it's working!

## Step 7: Whitelist IP in Bybit
1. Go to Bybit → API Management
2. Edit your API key
3. In "IP addresses" field, add: `<YOUR_ORACLE_IP>`
4. Save changes

## Benefits
- ✅ 100% FREE forever
- ✅ Static IP (never changes)
- ✅ Fast ARM processors
- ✅ 10TB bandwidth/month free
- ✅ Located in allowed regions

## Maintenance
Oracle Cloud Free Tier VMs can be deleted if idle for too long. Keep them active by:
```bash
# Add to crontab to keep VM active
crontab -e
# Add: */10 * * * * curl https://api.bybit.com/v5/market/time
```

## Security Best Practices
1. Use SSH keys (not passwords)
2. Set up UFW firewall:
```bash
sudo ufw allow 22
sudo ufw allow 8888
sudo ufw enable
```
3. Restrict proxy access to your Replit IP in tinyproxy.conf if possible
