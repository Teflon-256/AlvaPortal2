# Bybit Proxy Deployment Guide

This proxy service provides a **static IP address** for your Bybit API calls, allowing you to whitelist a specific IP instead of using `0.0.0.0/0`.

## Prerequisites

1. Install Fly.io CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up/login to Fly.io:
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

## Deployment Steps

### 1. Navigate to Proxy Directory
```bash
cd flyio-proxy
```

### 2. Launch the App
```bash
fly launch
```

When prompted:
- **App name**: Choose a unique name (e.g., `your-name-bybit-proxy`)
- **Region**: Select closest to you (or `iad` for US East)
- **PostgreSQL**: **No**
- **Redis**: **No**
- **Deploy now**: **Yes**

### 3. Get Static IP Address
```bash
fly ips allocate-v4
```

**Copy the IPv4 address shown** - this is your static IP!

### 4. Set Environment Variables (Optional)
```bash
# Restrict access to only your Replit app
fly secrets set ALLOWED_ORIGINS=https://your-repl.replit.app
```

### 5. Get Your Proxy URL
```bash
fly status
```

Look for the **Hostname** (e.g., `your-name-bybit-proxy.fly.dev`)

## Whitelist IP in Bybit

1. Go to Bybit API Management
2. Edit your API key
3. **Replace `0.0.0.0/0` with your Fly.io static IPv4 address**
4. Save changes

## Update Your Replit App

Add these environment variables to your Replit:

```env
PROXY_URL=https://your-name-bybit-proxy.fly.dev
USE_PROXY=true
```

Then update your Bybit API calls in `server/bybit.ts` to route through the proxy.

## Testing

```bash
# Health check
curl https://your-name-bybit-proxy.fly.dev/health

# Test Bybit proxy
curl -X POST https://your-name-bybit-proxy.fly.dev/bybit \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "endpoint": "/v5/market/time",
    "headers": {}
  }'
```

## Costs

- **Dedicated IPv4**: $2/month
- **Free tier**: 3 shared-CPU VMs with 256MB RAM (proxy uses minimal resources)
- **Total**: ~$2/month

## Monitoring

```bash
# View logs
fly logs

# Check app status
fly status

# SSH into the machine
fly ssh console
```

## Updating the Proxy

```bash
cd flyio-proxy
fly deploy
```

## Troubleshooting

### Proxy not responding
```bash
fly logs --tail
fly status
```

### Need to restart
```bash
fly apps restart
```

### Remove and redeploy
```bash
fly apps destroy your-app-name
fly launch
```
