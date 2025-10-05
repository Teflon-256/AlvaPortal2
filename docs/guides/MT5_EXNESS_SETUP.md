# MetaTrader 5 (Exness) Integration Setup Guide

## Overview
This guide will help you integrate your Exness MetaTrader 5 account with the Alva Capital platform for automated trading of forex, indices, and commodities.

## Prerequisites
- Active Exness trading account
- MetaTrader 5 platform installed
- Basic understanding of forex trading
- API access enabled on your Exness account

## Step 1: Create Your Exness Account

1. Visit [Exness.com](https://exness.com) and click "Open Account"
2. Complete the registration process with your email and password
3. Verify your email address
4. Complete identity verification (KYC) by uploading:
   - Government-issued ID (passport or driver's license)
   - Proof of address (utility bill or bank statement)

## Step 2: Open a MetaTrader 5 Account

1. Log in to your Exness Personal Area
2. Click "Open New Account"
3. Select "MetaTrader 5" as your platform
4. Choose account type:
   - **Standard**: Best for beginners (low spreads, no commission)
   - **Raw Spread**: Best for high-volume traders (very low spreads + commission)
   - **Pro**: For experienced traders (lower spreads than Standard)
5. Select your account currency (USD, EUR, etc.)
6. Set your leverage (recommended: 1:100 for forex, 1:500 for crypto)
7. Click "Create Account"

## Step 3: Download and Install MetaTrader 5

1. Go to your Exness Personal Area
2. Navigate to "My Accounts" and find your MT5 account
3. Click "Download MT5" for your operating system:
   - Windows Desktop
   - MacOS Desktop
   - Mobile (iOS/Android)
4. Install the application
5. Launch MetaTrader 5

## Step 4: Connect to Your MT5 Account

1. Open MetaTrader 5
2. Click "File" → "Login to Trade Account"
3. Enter your account credentials:
   - **Login**: Your MT5 account number (from Exness Personal Area)
   - **Password**: Your MT5 trading password
   - **Server**: Select your Exness server (e.g., "Exness-MT5Real")
4. Click "OK" to connect

## Step 5: Enable API Access

### For Expert Advisor (EA) API:

1. In MetaTrader 5, click "Tools" → "Options"
2. Go to the "Expert Advisors" tab
3. Enable the following settings:
   - ☑ Allow algorithmic/automated trading
   - ☑ Allow DLL imports (important for external connections)
   - ☑ Allow WebRequest for listed URL
4. Add these URLs to the WebRequest allowed list:
   ```
   https://api.exness.com
   https://mt5.exness.com
   https://*.replit.app
   https://*.replit.dev
   ```
5. Click "OK"

### For REST API Access:

1. Log in to your Exness Personal Area
2. Go to "Settings" → "API"
3. Click "Create New API Key"
4. Set the following permissions:
   - ☑ Read account information
   - ☑ Read trading history
   - ☑ Place orders
   - ☑ Modify orders
   - ☑ Close positions
5. Save your API credentials:
   - **API Key**: (save this securely)
   - **API Secret**: (save this securely - shown only once!)
   - **Account Number**: Your MT5 account number
   - **Server**: Your MT5 server address

## Step 6: Configure MT5 Connector in Alva Capital

### Option A: Using Replit Secrets (Recommended)

1. In your Replit environment, go to "Tools" → "Secrets"
2. Add the following secrets:
   ```
   MT5_ACCOUNT_NUMBER=your_mt5_account_number
   MT5_PASSWORD=your_mt5_trading_password
   MT5_SERVER=your_exness_server_address
   MT5_API_KEY=your_exness_api_key
   MT5_API_SECRET=your_exness_api_secret
   ```
3. The platform will automatically use these credentials

### Option B: Using Admin Portal

1. Log in to Alva Capital as an admin
2. Navigate to "Admin" → "Master Account" tab
3. Click "Configure Broker" and select "Exness MT5"
4. Enter your credentials:
   - Account Number
   - Password
   - Server Address
   - API Key (if using REST API)
   - API Secret (if using REST API)
5. Click "Save Configuration"
6. Click "Test Connection" to verify

## Step 7: Verify Connection

The MT5 connector will automatically test the connection by:
1. Retrieving account balance
2. Fetching open positions
3. Getting account equity and margin information

You should see:
- ✓ Connection Status: Active
- ✓ Account Balance: $X,XXX.XX
- ✓ Open Positions: X
- ✓ API Access: Enabled

## Step 8: Fund Your Account

1. Log in to Exness Personal Area
2. Go to "Deposit"
3. Select your payment method:
   - **Credit/Debit Card**: Instant (Visa, Mastercard)
   - **Bank Transfer**: 1-5 business days
   - **E-wallets**: Instant (Skrill, Neteller, Perfect Money)
   - **Crypto**: 10-60 minutes (Bitcoin, USDT, Ethereum)
4. Enter the amount and follow the instructions
5. Funds will appear in your MT5 account

## Step 9: Test the Integration

1. In Alva Capital, go to "Dashboard"
2. Check that your MT5 account appears in "Trading Accounts"
3. Verify that the balance is correct
4. Try placing a small test trade:
   - Go to "Trading" (when implemented)
   - Select a currency pair (e.g., EUR/USD)
   - Place a micro lot order (0.01 lots = $1,000 position)
   - Close the position immediately
5. Verify the trade appears in both Alva Capital and MT5

## Troubleshooting

### Connection Failed
- **Check credentials**: Verify your account number, password, and server
- **Check API permissions**: Ensure WebRequest is enabled in MT5
- **Check firewall**: Ensure MT5 can connect to the internet
- **Check server status**: Visit Exness status page for outages

### Authentication Error
- **Verify password**: Re-enter your trading password (not login password)
- **Check API key**: Ensure API key and secret are correct
- **Check expiry**: Some API keys expire - regenerate if needed

### Orders Not Executing
- **Check margin**: Ensure sufficient margin for the trade size
- **Check market hours**: Forex markets are closed on weekends
- **Check symbols**: Verify symbol names match (e.g., "EURUSD" vs "EURUSDm")
- **Check lot size**: Minimum lot size is 0.01 for most pairs

### Balance Not Updating
- **Refresh connection**: Click "Refresh" in the dashboard
- **Check timezone**: MT5 uses server time (usually GMT+2/+3)
- **Wait for sync**: Balance updates every 30 seconds

## Important Notes

1. **Security**: Never share your trading password or API secrets
2. **Risk Management**: Start with small positions to test the system
3. **Leverage**: Higher leverage = higher risk. Use conservatively.
4. **Margin Calls**: Monitor margin level - below 50% triggers margin call
5. **Stop Loss**: Always use stop loss orders to limit losses
6. **Slippage**: Market orders may execute at different prices during high volatility
7. **Spreads**: Spreads widen during news events and low liquidity periods
8. **Swaps**: Positions held overnight incur swap fees (can be positive or negative)

## Support Resources

- **Exness Support**: support@exness.com or live chat 24/7
- **MT5 Documentation**: https://www.metatrader5.com/en/terminal/help
- **Exness API Docs**: https://developers.exness.com
- **Alva Capital Support**: [Your support email/contact]

## Next Steps

After successful integration:
1. Set up risk parameters in "Admin" → "Risk Management"
2. Configure copy trading ratios for clients
3. Enable automated signal execution
4. Monitor performance in "Analytics" dashboard
5. Set up profit sharing schedules

---

**Last Updated**: October 2025
**Version**: 1.0
