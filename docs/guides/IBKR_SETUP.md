# Interactive Brokers (IBKR) Integration Setup Guide

## Overview
This guide will help you integrate your Interactive Brokers account with the Alva Capital platform for automated trading of stocks, bonds, options, futures, and forex.

## Prerequisites
- Active Interactive Brokers account
- Completed funding and verification
- API access enabled
- Trader Workstation (TWS) or IB Gateway installed
- Basic understanding of securities trading

## Step 1: Create Your IBKR Account

1. Visit [InteractiveBrokers.com](https://www.interactivebrokers.com)
2. Click "Open Account"
3. Choose account type:
   - **Individual**: For personal trading
   - **Joint**: For multiple account holders
   - **IRA**: For retirement accounts (US residents)
   - **Entity**: For businesses/trusts
4. Complete the application with:
   - Personal information
   - Financial information (net worth, income)
   - Investment experience
   - Trading permissions requested
5. Submit identity verification documents:
   - Government-issued photo ID
   - Proof of address (bank statement or utility bill)

## Step 2: Fund Your Account

### Minimum Funding Requirements:
- **US Stocks/ETFs**: $0 (no minimum)
- **Margin Trading**: $2,000 minimum
- **Pattern Day Trading**: $25,000 minimum (US regulations)
- **Futures**: $10,000 recommended
- **Options**: Varies by strategy

### Funding Methods:

1. **Bank Wire Transfer** (Recommended for large amounts)
   - Log in to Client Portal
   - Go to "Transfer & Pay" → "Deposit Funds"
   - Select "Wire Transfer"
   - Note the IBKR bank details
   - Initiate transfer from your bank
   - Processing time: 1-3 business days

2. **ACH Transfer** (US only)
   - Free for deposits over $100
   - Processing time: 3-5 business days
   - Link your bank account in Client Portal first

3. **Check Deposit** (US only)
   - Mail check to IBKR address (provided in portal)
   - Processing time: 5-10 business days

4. **ACATS Transfer** (Transfer existing positions)
   - Transfer stocks/funds from another broker
   - Processing time: 5-8 business days
   - IBKR may reimburse transfer fees

## Step 3: Request Trading Permissions

1. Log in to Client Portal: https://www.interactivebrokers.com/portal
2. Go to "Settings" → "Account Settings"
3. Click "Trading Permissions"
4. Request access for:
   - ☑ US Stocks
   - ☑ US Options (if needed)
   - ☑ Futures (if needed)
   - ☑ Forex (if needed)
   - ☑ International Markets (if needed)
5. Complete the relevant experience questionnaires
6. Wait for approval (usually instant for stocks, 1-2 days for options/futures)

## Step 4: Enable API Access

### Method 1: Through Client Portal

1. Log in to Client Portal
2. Go to "Settings" → "Account Settings"
3. Click "API" → "Settings"
4. Enable "Enable ActiveX and Socket Clients"
5. Set up API permissions:
   - ☑ Read account data
   - ☑ Place orders
   - ☑ Modify orders
   - ☑ Cancel orders
   - ☑ View positions and balances
6. Configure IP whitelist (add your server IPs):
   ```
   0.0.0.0/0  (for Replit - allows all IPs)
   ```
   Note: For production, restrict to specific IPs for security
7. Click "Save"

### Method 2: Through TWS

1. Open Trader Workstation (TWS)
2. Go to "File" → "Global Configuration"
3. Select "API" → "Settings"
4. Enable "Enable ActiveX and Socket Clients"
5. Set socket port (default: 7496 for live, 7497 for paper)
6. Enable "Allow connections from localhost only" for testing
7. Click "OK"

## Step 5: Install IB Gateway (Recommended for Automation)

IB Gateway is lighter than TWS and better suited for automated trading.

### Download and Install:

1. Go to: https://www.interactivebrokers.com/en/trading/ibgateway-stable.php
2. Download IB Gateway for your operating system
3. Install the application
4. Launch IB Gateway

### Configure IB Gateway:

1. Log in with your IBKR credentials
2. Select "Live Trading" or "Paper Trading"
3. Go to "Configure" → "Settings" → "API"
4. Enable "Enable ActiveX and Socket Clients"
5. Set "Socket port" to 4001 (recommended for production)
6. Configure "Trusted IP addresses":
   ```
   127.0.0.1
   0.0.0.0/0  (for Replit)
   ```
7. Set "Master API client ID" (optional, but recommended: 1)
8. Click "OK"

## Step 6: Get Your API Credentials

Interactive Brokers uses account number authentication rather than API keys.

You'll need:
- **Account Number**: Your IBKR account number (e.g., U1234567)
- **Username**: Your IBKR username
- **Password**: Your IBKR password
- **Host**: `127.0.0.1` (if IB Gateway is local) or your server IP
- **Port**: `4001` (IB Gateway) or `7496` (TWS live) or `7497` (TWS paper)
- **Client ID**: Unique ID for your connection (any number 1-999)

## Step 7: Configure IBKR Connector in Alva Capital

### Option A: Using Replit Secrets (Recommended)

1. In your Replit environment, go to "Tools" → "Secrets"
2. Add the following secrets:
   ```
   IBKR_ACCOUNT_NUMBER=U1234567
   IBKR_USERNAME=your_username
   IBKR_PASSWORD=your_password
   IBKR_HOST=127.0.0.1
   IBKR_PORT=4001
   IBKR_CLIENT_ID=1
   IBKR_TRADING_MODE=paper
   ```
   Note: Set `IBKR_TRADING_MODE=live` for real trading

### Option B: Using Admin Portal

1. Log in to Alva Capital as an admin
2. Navigate to "Admin" → "Master Account" tab
3. Click "Configure Broker" and select "Interactive Brokers"
4. Enter your credentials:
   - Account Number
   - Username
   - Password
   - Host Address
   - Port
   - Client ID
   - Trading Mode (paper/live)
5. Click "Save Configuration"
6. Click "Test Connection" to verify

## Step 8: Start IB Gateway for Connection

### For Replit Hosting:

Since Replit doesn't run IB Gateway directly, you have two options:

#### Option 1: Run IB Gateway on Local Machine (Easiest)
1. Run IB Gateway on your local computer
2. Use a tool like ngrok to create a tunnel:
   ```bash
   ngrok tcp 4001
   ```
3. Use the ngrok URL in your IBKR_HOST configuration
4. Keep IB Gateway running 24/7 on your computer

#### Option 2: Run IB Gateway on Cloud Server (Recommended for Production)
1. Set up a cloud server (AWS EC2, DigitalOcean, etc.)
2. Install IB Gateway on the cloud server
3. Configure IB Gateway to run on startup
4. Set up auto-login for IB Gateway
5. Configure firewall to allow connections from Replit
6. Use the cloud server IP in your IBKR_HOST configuration

### Auto-Login Configuration:

Create a file `jts.ini` in the IB Gateway settings folder:

**Windows**: `C:\Users\[YourUsername]\Jts\jts.ini`
**Mac**: `~/Jts/jts.ini`
**Linux**: `~/Jts/jts.ini`

Add the following:
```ini
[IBGateway]
LoginName=your_username
Password=your_encrypted_password
TradingMode=live
PortNumber=4001
```

To get encrypted password:
1. Log in to IB Gateway once manually
2. Check the "Store credentials" box
3. IB Gateway will save encrypted credentials

## Step 9: Verify Connection

The IBKR connector will automatically test the connection by:
1. Connecting to IB Gateway
2. Retrieving account information
3. Fetching portfolio positions
4. Getting account equity and buying power

You should see:
- ✓ Connection Status: Active
- ✓ Account Balance: $X,XXX.XX
- ✓ Buying Power: $X,XXX.XX
- ✓ Open Positions: X
- ✓ API Access: Enabled

## Step 10: Test the Integration

### Paper Trading Test (Recommended First):

1. Configure IBKR connector for paper trading
2. In Alva Capital, go to "Dashboard"
3. Check that your IBKR account appears in "Trading Accounts"
4. Verify that the balance is correct
5. Try placing a small test trade:
   - Go to "Trading" (when implemented)
   - Select a stock (e.g., AAPL)
   - Place a limit order for 1 share
   - Cancel the order or let it fill
6. Verify the trade appears in both Alva Capital and TWS/Gateway

### Live Trading Test:

1. Switch to live trading mode
2. Repeat the test with a small position
3. Monitor execution quality
4. Verify commissions and fees

## Step 11: Set Up Order Types and Risk Controls

### In IBKR Client Portal:

1. Go to "Settings" → "Trading" → "Order Presets"
2. Configure default order types:
   - Market Orders
   - Limit Orders
   - Stop Loss Orders
   - Trailing Stop Orders
3. Set up risk controls:
   - Maximum order size
   - Maximum position size
   - Daily loss limit
   - Gross position value limit

### In Alva Capital:

1. Go to "Admin" → "Risk Management"
2. Configure:
   - Position size limits
   - Maximum drawdown
   - Daily loss limits
   - Symbol restrictions

## Troubleshooting

### Connection Failed
- **Check IB Gateway**: Ensure IB Gateway is running and logged in
- **Check port**: Verify port number matches your configuration
- **Check firewall**: Ensure firewall allows connections to IB Gateway port
- **Check API settings**: Verify API is enabled in IB Gateway configuration

### Authentication Error
- **Verify credentials**: Double-check account number and password
- **Check account status**: Ensure account is funded and approved
- **Check 2FA**: IBKR may require 2FA - use IB Key mobile app

### Orders Not Executing
- **Check trading hours**: Markets may be closed
- **Check permissions**: Verify you have permission for that asset class
- **Check buying power**: Ensure sufficient funds for the order
- **Check symbol**: Verify symbol format (e.g., "AAPL" not "AAPL.US")

### Balance Not Updating
- **Refresh connection**: Click "Refresh" in the dashboard
- **Check sync**: Balance updates every 60 seconds
- **Check settlement**: Some transactions take T+2 to settle

## Important Notes

1. **Market Data Subscriptions**: You may need to subscribe to market data feeds
   - US Securities Snapshot: $1.50/month
   - US Options: $1.00/month
   - Real-time data: $10-30/month per exchange
   
2. **Commissions**: IBKR charges commissions per share/contract
   - US Stocks: $0.005/share (min $1/order)
   - Options: $0.65/contract
   - Futures: $0.85/contract

3. **Pattern Day Trading**: If you make 4+ day trades in 5 days with account < $25,000, you'll be flagged as PDT and restricted

4. **Margin Requirements**: 
   - Initial margin: Typically 50% for stocks
   - Maintenance margin: Typically 25% for stocks
   - Higher for volatile stocks and options

5. **Settlement Times**:
   - Stocks: T+2 (trade date + 2 business days)
   - Options: T+1
   - Cash only: Requires settled funds for purchases

6. **Tax Reporting**: IBKR provides Form 1099 for US residents

## Support Resources

- **IBKR Support**: https://www.interactivebrokers.com/support
- **API Documentation**: https://interactivebrokers.github.io/tws-api/
- **Client Portal**: https://www.interactivebrokers.com/portal
- **Trading Hours**: https://www.interactivebrokers.com/en/index.php?f=1562
- **IB Key (2FA App)**: Download from App Store/Play Store

## Next Steps

After successful integration:
1. Set up risk parameters in "Admin" → "Risk Management"
2. Configure trading strategies for stocks/options/futures
3. Enable automated signal execution
4. Monitor performance in "Analytics" dashboard
5. Set up automated reporting for compliance

---

**Last Updated**: October 2025
**Version**: 1.0
