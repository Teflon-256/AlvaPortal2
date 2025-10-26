# Residential Proxy Setup for Bybit WebSocket Copy Trading

## Why Do You Need a Residential Proxy?

Bybit blocks ALL datacenter IPs (including AWS, Google Cloud, Azure, Oracle Cloud, and Replit) from accessing their API. This affects both REST API calls and WebSocket connections for real-time trade monitoring.

### What You've Built
Your platform now includes:
- ✅ **WebSocket-based copy trading** (<100ms latency instead of 2 seconds)
- ✅ **Real-time trade replication** via Socket.io
- ✅ **Instant dashboard updates** without page refreshes
- ✅ **Master account monitoring** through Bybit WebSocket

All of this works perfectly - **except** Bybit blocks the server IP.

## Solution: Residential Proxy

A residential proxy routes your traffic through a real residential IP address (like someone's home internet). Bybit allows these connections because they come from legitimate home networks.

### Budget-Friendly Options with Free Trials

Here are the **cheapest** residential proxy providers with free trials so you can test before committing:

---

## 1. **Proxy-Cheap** ⭐ BEST VALUE
- **Free Trial**: Yes! Email support for trial credits
- **Pricing**: Starting at $10/month for 1GB
- **Type**: Rotating residential proxies
- **Perfect for**: Low-volume copy trading (1GB can handle thousands of trades)

### How to Set Up Proxy-Cheap:

1. **Sign up**: Visit [proxy-cheap.com](https://www.proxy-cheap.com)
2. **Request Trial**: Contact support via live chat and ask for trial credits
3. **Get Credentials**: 
   - Once approved, go to Dashboard → Residential Proxies
   - You'll see: `Username`, `Password`, and `Proxy Address`

4. **Format for AlvaCapital**:
   ```
   http://username:password@proxy-address:port
   ```
   
   Example:
   ```
   http://customer-abc123:mypass@pr.proxy-cheap.com:31112
   ```

5. **Set the Secret**:
   - In Replit, open the Secrets panel
   - Add a new secret:
     - Key: `BYBIT_PROXY_URL`
     - Value: `http://customer-abc123:mypass@pr.proxy-cheap.com:31112`

6. **Restart the server** and your WebSocket will connect through the residential proxy!

---

## 2. **IPRoyal**
- **Free Trial**: 7-day money-back guarantee
- **Pricing**: $1.75/GB (pay-as-you-go, minimum $7)
- **Type**: Residential rotating proxies
- **Good for**: Testing with minimal commitment

### Setup Process:
1. Sign up at [iproyal.com](https://iproyal.com)
2. Purchase minimum credits ($7)
3. Dashboard → Residential Proxies → Create Proxy
4. Copy proxy URL in format: `http://username:password@geo.iproyal.com:12321`
5. Add to Replit secrets as `BYBIT_PROXY_URL`

---

## 3. **Smartproxy**
- **Free Trial**: 3-day money-back or contact sales for trial
- **Pricing**: Starting at $12.50/month for 1GB
- **Type**: Residential rotating proxies
- **Features**: 55M+ residential IPs, good reliability

### Setup Process:
1. Sign up at [smartproxy.com](https://smartproxy.com)
2. Contact sales for trial or start with basic plan
3. Dashboard → Endpoint Generator
4. Generate HTTP proxy endpoint
5. Format: `http://username:password@gate.smartproxy.com:7000`
6. Add to Replit secrets as `BYBIT_PROXY_URL`

---

## 4. **Webshare.io** 💰 CHEAPEST FOR LIGHT USE
- **Free Plan**: 10 proxies (datacenter, not residential) - won't work for Bybit
- **Residential**: $2.99/GB (100MB minimum = $0.30!)
- **Perfect for**: Absolute minimum cost testing

### Setup Process:
1. Sign up at [webshare.io](https://www.webshare.io)
2. Navigate to Residential Proxies
3. Purchase minimum amount (100MB for $0.30)
4. Get proxy credentials from Dashboard
5. Format: `http://username:password@p.webshare.io:9999`
6. Add to Replit secrets as `BYBIT_PROXY_URL`

---

## Testing Your Proxy

Once you've added `BYBIT_PROXY_URL` to Replit secrets:

1. **Restart your application**
2. **Check the server logs** for:
   ```
   ✅ Master account WebSocket initialized
   ✅ Client connected: [socket-id]
   📡 WebSocket connected to master account
   ```

3. **Visit the dashboard** - you should see:
   - Real-time balance updates
   - Copy trading status indicator
   - Instant trade notifications

4. **Test the WebSocket status**:
   - Go to `/api/copy-trading/websocket-status`
   - Should show `{ "connected": true, ... }`

---

## Troubleshooting

### "Connection failed" or "403 Forbidden"
- **Issue**: Proxy credentials are incorrect or expired
- **Fix**: Double-check the proxy URL format and credentials

### "Still getting datacenter IP blocked"
- **Issue**: You might have set up a datacenter proxy instead of residential
- **Fix**: Ensure you selected "Residential Proxies" not "Datacenter Proxies"

### "WebSocket keeps reconnecting"
- **Issue**: Proxy connection is unstable
- **Fix**: Try a different proxy provider or region

### "High latency (>500ms)"
- **Issue**: Proxy server is far from Bybit servers
- **Fix**: Choose a proxy with Asia/Singapore region if available

---

## Cost Estimate

For typical copy trading usage:
- **WebSocket connection**: ~1-5 MB/day
- **REST API calls**: ~10-50 MB/day
- **Total monthly**: ~500MB - 1.5GB

### Recommended Budget Options:
1. **Testing**: Webshare 100MB ($0.30) - enough for 3-7 days
2. **Light use**: Proxy-Cheap 1GB ($10/month) - ~2 months of usage
3. **Active trading**: IPRoyal pay-as-you-go ($1.75/GB) - flexible scaling

---

## Next Steps

1. **Choose a provider** (recommend starting with Proxy-Cheap free trial)
2. **Sign up and get credentials**
3. **Add `BYBIT_PROXY_URL` to Replit secrets**
4. **Restart the server**
5. **Watch real-time trades appear instantly!** 🚀

Your WebSocket-based copy trading system is ready - you just need to give it a residential IP to connect through!

---

## Technical Details (Optional)

### How It Works
Your Bybit WebSocket service automatically uses the proxy:
```typescript
// From server/bybitWebSocket.ts
const proxyUrl = process.env.BYBIT_PROXY_URL;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const client = new WebsocketClient({
  key: apiKey,
  secret: apiSecret,
  market: 'v5',
  requestOptions: {
    agent // Proxy applied to both REST and WebSocket
  }
});
```

The `https-proxy-agent` package handles HTTP CONNECT tunneling, routing both REST and WebSocket traffic through the residential proxy transparently.

### Why HTTP Proxy Works for WebSocket
- WebSocket connections start with an HTTP upgrade request
- HTTP proxies support WebSocket via CONNECT tunneling
- Same proxy URL works for both REST API and WebSocket
- No separate configuration needed!
