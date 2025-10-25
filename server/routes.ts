import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTradingAccountSchema, 
  insertReferralEarningSchema, 
  insertMasterCopierConnectionSchema, 
  insertBrokerRequestSchema,
  tradingAccounts,
  copierSettings,
  syncStatus,
  actionLog,
  tradeMirroringLog,
  copyTradingTasks,
  users
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { encrypt, decrypt } from "./crypto";
import { BybitService } from "./bybit";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Public system info - proxy static IP for users to whitelist
  app.get('/api/system/proxy-ip', async (_req, res) => {
    try {
      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      
      // Extract IP from proxy URL (format: http://IP:PORT)
      let proxyIP = 'Not configured';
      if (proxyUrl) {
        const match = proxyUrl.match(/http:\/\/([^:]+):/);
        if (match && match[1]) {
          proxyIP = match[1];
        }
      }
      
      res.json({ 
        proxyIP,
        configured: proxyUrl.length > 0
      });
    } catch (error) {
      console.error("Error fetching proxy IP:", error);
      res.status(500).json({ message: "Failed to fetch proxy IP" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, country, username, email } = req.body;

      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        country,
        username,
        email,
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User preferences - balance hiding toggle
  app.patch('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { balancesHidden, sessionTimeout } = req.body;

      await storage.updateUserPreferences(userId, {
        balancesHidden,
        sessionTimeout
      });

      const updatedUser = await storage.getUser(userId);

      res.json({ 
        message: "Preferences updated successfully",
        preferences: {
          balancesHidden: updatedUser?.balancesHidden,
          sessionTimeout: updatedUser?.sessionTimeout
        }
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get user preferences
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        balancesHidden: user.balancesHidden || false,
        sessionTimeout: user.sessionTimeout || 15
      });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Dashboard data endpoint
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get all dashboard data in parallel
      const [
        tradingAccounts,
        referralEarnings,
        totalEarnings,
        referralCount,
        masterCopierConnections,
        referralLinks
      ] = await Promise.all([
        storage.getTradingAccounts(userId),
        storage.getReferralEarnings(userId),
        storage.getTotalReferralEarnings(userId),
        storage.getReferralCount(userId),
        storage.getMasterCopierConnections(userId),
        storage.getReferralLinks(userId)
      ]);

      // Fetch real-time Bybit balances for connected accounts
      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const accountsWithBalance = await Promise.all(
        tradingAccounts.map(async (account) => {
          if (account.broker === 'bybit' && account.apiKeyEncrypted && account.apiSecretEncrypted) {
            try {
              const bybitService = BybitService.createFromEncrypted(
                account.apiKeyEncrypted,
                account.apiSecretEncrypted,
                proxyUrl
              );
              const balances = await bybitService.getWalletBalance('UNIFIED');
              const totalBalance = balances.reduce((sum, balance) => {
                return sum + parseFloat(balance.usdValue || balance.walletBalance || '0');
              }, 0);
              
              // Get performance stats for P&L
              const performance = await bybitService.getPerformanceStats();
              
              return {
                ...account,
                balance: totalBalance.toString(),
                dailyPnL: performance.totalUnrealizedPnl
              };
            } catch (error) {
              console.error(`Error fetching Bybit balance for account ${account.id}:`, error);
              return account; // Return account with stored balance if API call fails
            }
          }
          return account;
        })
      );

      // Calculate total portfolio balance
      const totalBalance = accountsWithBalance.reduce((sum, account) => {
        return sum + parseFloat(account.balance || '0');
      }, 0);

      // Calculate today's P&L
      const dailyPnL = accountsWithBalance.reduce((sum, account) => {
        return sum + parseFloat(account.dailyPnL || '0');
      }, 0);

      // Calculate total performance percentage
      let totalPerformancePercentage = 0;
      let accountsWithCapital = 0;
      
      accountsWithBalance.forEach(account => {
        const currentBalance = parseFloat(account.balance || '0');
        const initialCapital = parseFloat(account.tradingCapital || '0');
        
        if (initialCapital > 0) {
          const performancePercent = ((currentBalance - initialCapital) / initialCapital) * 100;
          totalPerformancePercentage += performancePercent;
          accountsWithCapital++;
        }
      });
      
      const averagePerformance = accountsWithCapital > 0 
        ? (totalPerformancePercentage / accountsWithCapital).toFixed(2)
        : '0.00';

      res.json({
        totalBalance: totalBalance.toFixed(2),
        dailyPnL: dailyPnL.toFixed(2),
        referralCount: referralCount.count,
        referralEarnings: totalEarnings.total,
        tradingAccounts: accountsWithBalance,
        recentReferralEarnings: referralEarnings.slice(0, 5), // Latest 5 earnings
        masterCopierConnections,
        referralLinks,
        performancePercentage: averagePerformance
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Trading account routes
  app.post('/api/trading-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertTradingAccountSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", error: fromZodError(validation.error).toString() });
      }

      const accountData = { ...validation.data, userId };
      const account = await storage.createTradingAccount(accountData);
      
      res.json(account);
    } catch (error) {
      console.error("Error creating trading account:", error);
      res.status(500).json({ message: "Failed to create trading account" });
    }
  });

  app.delete('/api/trading-accounts/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;
      
      if (!accountId) {
        return res.status(400).json({ message: "Account ID is required" });
      }
      
      console.log(`[Delete Account] User ${userId} attempting to delete account ${accountId}`);
      
      await storage.deleteTradingAccount(accountId, userId);
      
      console.log(`[Delete Account] Successfully deleted account ${accountId} for user ${userId}`);
      res.json({ message: "Trading account disconnected successfully" });
    } catch (error) {
      console.error(`[Delete Account] Error deleting account ${req.params.accountId} for user ${req.user?.claims?.sub}:`, error);
      res.status(500).json({ message: "Failed to disconnect trading account" });
    }
  });

  // Update account balance (for future API integration)
  app.patch('/api/trading-accounts/:accountId/balance', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const { balance, dailyPnL } = req.body;
      
      if (!balance || !dailyPnL) {
        return res.status(400).json({ message: "Balance and dailyPnL are required" });
      }
      
      await storage.updateTradingAccountBalance(accountId, balance, dailyPnL);
      res.json({ message: "Account balance updated successfully" });
    } catch (error) {
      console.error("Error updating account balance:", error);
      res.status(500).json({ message: "Failed to update account balance" });
    }
  });

  // Master copier routes
  app.post('/api/master-copier/connect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMasterCopierConnectionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", error: fromZodError(validation.error).toString() });
      }

      const connectionData = { ...validation.data, userId };
      const connection = await storage.createMasterCopierConnection(connectionData);
      
      res.json(connection);
    } catch (error) {
      console.error("Error connecting to master copier:", error);
      res.status(500).json({ message: "Failed to connect to master copier" });
    }
  });

  app.patch('/api/master-copier/:connectionId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { connectionId } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }
      
      await storage.updateMasterCopierStatus(connectionId, isActive);
      res.json({ message: "Master copier status updated successfully" });
    } catch (error) {
      console.error("Error updating master copier status:", error);
      res.status(500).json({ message: "Failed to update master copier status" });
    }
  });

  // Referral earnings routes
  app.post('/api/referral-earnings', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertReferralEarningSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", error: fromZodError(validation.error).toString() });
      }

      const earning = await storage.createReferralEarning(validation.data);
      res.json(earning);
    } catch (error) {
      console.error("Error creating referral earning:", error);
      res.status(500).json({ message: "Failed to create referral earning" });
    }
  });

  // Referral link tracking
  app.post('/api/referral-links/:linkId/click', async (req, res) => {
    try {
      const { linkId } = req.params;
      await storage.updateReferralLinkStats(linkId, 1);
      res.json({ message: "Click tracked successfully" });
    } catch (error) {
      console.error("Error tracking referral click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Copy referral link endpoint
  app.get('/api/referral-links/:broker', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { broker } = req.params;
      
      const links = await storage.getReferralLinks(userId);
      const brokerLink = links.find(link => link.broker === broker);
      
      if (!brokerLink) {
        return res.status(404).json({ message: "Referral link not found for this broker" });
      }
      
      res.json(brokerLink);
    } catch (error) {
      console.error("Error fetching referral link:", error);
      res.status(500).json({ message: "Failed to fetch referral link" });
    }
  });

  // Broker request routes
  app.post('/api/broker-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBrokerRequestSchema.parse({
        ...req.body,
        userId
      });
      
      const brokerRequest = await storage.createBrokerRequest(validatedData);
      res.status(201).json(brokerRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      console.error("Error creating broker request:", error);
      res.status(500).json({ message: "Failed to create broker request" });
    }
  });

  app.get('/api/broker-requests', isAuthenticated, async (req: any, res) => {
    try {
      // For now, only allow admin access - you can add admin check here later
      const requests = await storage.getBrokerRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching broker requests:", error);
      res.status(500).json({ message: "Failed to fetch broker requests" });
    }
  });

  app.patch('/api/broker-requests/:requestId', isAuthenticated, async (req: any, res) => {
    try {
      // For now, only allow admin access - you can add admin check here later
      const { requestId } = req.params;
      const { status, adminNotes } = req.body;
      
      await storage.updateBrokerRequestStatus(requestId, status, adminNotes);
      res.json({ message: "Broker request updated successfully" });
    } catch (error) {
      console.error("Error updating broker request:", error);
      res.status(500).json({ message: "Failed to update broker request" });
    }
  });

  // Bybit API routes
  app.post('/api/bybit/connect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { apiKey, apiSecret, tradingCapital, maxRiskPercentage } = req.body;
      
      if (!apiKey || !apiSecret) {
        return res.status(400).json({ message: "API key and secret are required" });
      }

      // Skip server-side validation - user will validate from their browser (their IP works)
      // Server validation fails because Replit's datacenter IP is blocked by Bybit CloudFront
      console.log('Storing Bybit credentials without server-side validation (user will validate from browser)');
      
      // Encrypt API credentials
      const apiKeyEncrypted = encrypt(apiKey);
      const apiSecretEncrypted = encrypt(apiSecret);
      
      // Use default balance since we can't fetch it from server
      const totalBalance = parseFloat(tradingCapital || '0');
      
      // Create trading account
      const tradingAccount = await storage.createTradingAccount({
        userId,
        broker: 'bybit',
        accountId: `bybit_${Date.now()}`,
        accountName: 'Bybit Account',
        balance: '0',
        dailyPnL: '0',
        apiKeyEncrypted,
        apiSecretEncrypted,
        tradingCapital: tradingCapital || '0',
        maxRiskPercentage: maxRiskPercentage || '2.00',
        copyStatus: 'active'
      });

      // Auto-connect as copier to master account (sahabyoona@gmail.com)
      // Query database to find master user by email
      const { users } = await import ('@shared/schema');
      const { eq } = await import('drizzle-orm');
      const { db } = await import('./db');
      
      const [masterUser] = await db.select().from(users).where(eq(users.email, 'sahabyoona@gmail.com')).limit(1);
      
      if (masterUser) {
        const masterAccounts = await storage.getTradingAccounts(masterUser.id);
        const masterBybitAccount = masterAccounts.find(acc => acc.broker === 'bybit');
        
        if (masterBybitAccount) {
          // Create master-copier connection
          await storage.createMasterCopierConnection({
            userId,
            masterAccountId: masterBybitAccount.id,
            tradingAccountId: tradingAccount.id,
            copyRatio: '1.0',
            isActive: true
          });
        }
      }

      await storage.createActionLog({
        userId,
        action: 'connect_bybit_account',
        description: 'Connected Bybit account with API keys and auto-joined copy trading',
        metadata: { accountId: tradingAccount.id },
        ipAddress: req.ip,
      });

      res.json({ 
        message: "Bybit account connected successfully and joined copy trading",
        accountId: tradingAccount.id 
      });
    } catch (error: any) {
      console.error("Error connecting Bybit account:", error);
      res.status(500).json({ message: error.message || "Failed to connect Bybit account" });
    }
  });

  app.get('/api/bybit/balance/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const account = await storage.getTradingAccountById(accountId);
      
      if (!account || !account.apiKeyEncrypted || !account.apiSecretEncrypted) {
        return res.status(404).json({ message: "Bybit account not found or not connected" });
      }

      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted,
        proxyUrl
      );
      
      const balances = await bybitService.getWalletBalance();
      res.json({ balances });
    } catch (error: any) {
      console.error("Error fetching Bybit balance:", error);
      res.status(500).json({ message: error.message || "Failed to fetch balance" });
    }
  });

  app.get('/api/bybit/positions/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const account = await storage.getTradingAccountById(accountId);
      
      if (!account || !account.apiKeyEncrypted || !account.apiSecretEncrypted) {
        return res.status(404).json({ message: "Bybit account not found or not connected" });
      }

      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted,
        proxyUrl
      );
      
      const positions = await bybitService.getPositions();
      res.json({ positions });
    } catch (error: any) {
      console.error("Error fetching Bybit positions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch positions" });
    }
  });

  app.get('/api/bybit/transactions/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const account = await storage.getTradingAccountById(accountId);
      
      if (!account || !account.apiKeyEncrypted || !account.apiSecretEncrypted) {
        return res.status(404).json({ message: "Bybit account not found or not connected" });
      }

      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted,
        proxyUrl
      );
      
      const transactions = await bybitService.getTransactionHistory();
      res.json({ transactions });
    } catch (error: any) {
      console.error("Error fetching Bybit transactions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch transactions" });
    }
  });

  app.get('/api/bybit/performance/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const account = await storage.getTradingAccountById(accountId);
      
      if (!account || !account.apiKeyEncrypted || !account.apiSecretEncrypted) {
        return res.status(404).json({ message: "Bybit account not found or not connected" });
      }

      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted,
        proxyUrl
      );
      
      const performance = await bybitService.getPerformanceStats();
      res.json(performance);
    } catch (error: any) {
      console.error("Error fetching Bybit performance:", error);
      res.status(500).json({ message: error.message || "Failed to fetch performance stats" });
    }
  });

  // Copy trading control endpoints
  app.post('/api/copy-trading/sync/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const userId = req.user.claims.sub;
      const { copyTradingScheduler } = await import('./copyTradingScheduler');
      
      await copyTradingScheduler.syncPositions();
      res.json({ success: true, message: "Position sync initiated" });
    } catch (error: any) {
      console.error("Error syncing positions:", error);
      res.status(500).json({ message: error.message || "Failed to sync positions" });
    }
  });

  app.post('/api/copy-trading/profit-split', isAuthenticated, async (req: any, res) => {
    try {
      const { copyTradingScheduler } = await import('./copyTradingScheduler');
      
      await copyTradingScheduler.processWeeklyProfitSplits();
      res.json({ success: true, message: "Profit split process initiated" });
    } catch (error: any) {
      console.error("Error processing profit splits:", error);
      res.status(500).json({ message: error.message || "Failed to process profit splits" });
    }
  });

  app.get('/api/action-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getActionLogs(userId);
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching action logs:", error);
      res.status(500).json({ message: error.message || "Failed to fetch action logs" });
    }
  });

  app.get('/api/profit-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transfers = await storage.getProfitTransfers(userId);
      res.json(transfers);
    } catch (error: any) {
      console.error("Error fetching profit transfers:", error);
      res.status(500).json({ message: error.message || "Failed to fetch profit transfers" });
    }
  });

  // Admin settings routes
  app.get('/api/admin/settings/:key', isAuthenticated, async (req: any, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getAdminSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      console.error("Error fetching admin setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const { settingKey, settingValue, description } = req.body;
      
      const encryptedValue = settingKey.includes('api_key') || settingKey.includes('api_secret') 
        ? encrypt(settingValue)
        : settingValue;
      
      const setting = await storage.setAdminSetting({
        settingKey,
        settingValue: encryptedValue,
        description,
      });
      
      res.json(setting);
    } catch (error) {
      console.error("Error setting admin setting:", error);
      res.status(500).json({ message: "Failed to set setting" });
    }
  });

  // Master Account Configuration - Admin Only
  app.get('/api/admin/master-account', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { db } = await import('./db');
      const { adminSettings } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');

      const [setting] = await db.select()
        .from(adminSettings)
        .where(eq(adminSettings.settingKey, 'master_bybit_config'))
        .limit(1);

      if (!setting) {
        return res.json({ configured: false });
      }

      const config = JSON.parse(setting.settingValue || '{}');
      
      // Return only non-sensitive info
      res.json({
        configured: true,
        transferUserId: config.transfer_user_id || '',
        hasApiKey: !!config.api_key,
        hasApiSecret: !!config.api_secret,
      });
    } catch (error) {
      console.error('Error fetching master account config:', error);
      res.status(500).json({ message: 'Failed to fetch master account configuration' });
    }
  });

  app.post('/api/admin/master-account', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { apiKey, apiSecret, transferUserId } = req.body;

      if (!apiKey || !apiSecret) {
        return res.status(400).json({ message: 'API Key and Secret are required' });
      }

      // Store master account configuration
      const config = {
        api_key: apiKey,
        api_secret: apiSecret,
        transfer_user_id: transferUserId || '',
      };

      const { db } = await import('./db');
      const { adminSettings } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');

      // Check if setting exists
      const [existing] = await db.select()
        .from(adminSettings)
        .where(eq(adminSettings.settingKey, 'master_bybit_config'))
        .limit(1);

      if (existing) {
        await db.update(adminSettings)
          .set({
            settingValue: JSON.stringify(config),
            updatedAt: new Date(),
          })
          .where(eq(adminSettings.settingKey, 'master_bybit_config'));
      } else {
        await db.insert(adminSettings).values({
          settingKey: 'master_bybit_config',
          settingValue: JSON.stringify(config),
          description: 'Master Bybit account configuration for copy trading',
        });
      }

      // Log the action
      const { actionLog } = await import('@shared/schema');
      await db.insert(actionLog).values({
        userId: req.user.claims.sub,
        action: 'MASTER_ACCOUNT_CONFIGURED',
        description: 'Updated master Bybit account configuration',
        metadata: JSON.stringify({ hasApiKey: !!apiKey, hasApiSecret: !!apiSecret }),
      });

      res.json({ 
        success: true, 
        message: 'Master account configured successfully. All copiers will now receive trades from this account.' 
      });
    } catch (error: any) {
      console.error('Error configuring master account:', error);
      res.status(500).json({ message: error.message || 'Failed to configure master account' });
    }
  });

  // Profit transfers routes
  app.get('/api/profit-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transfers = await storage.getProfitTransfers(userId);
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching profit transfers:", error);
      res.status(500).json({ message: "Failed to fetch profit transfers" });
    }
  });

  // Action logs routes
  app.get('/api/action-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getActionLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching action logs:", error);
      res.status(500).json({ message: "Failed to fetch action logs" });
    }
  });

  // Admin routes - Stats dashboard
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { db } = await import('./db');
      const { users, tradingAccounts, actionLog, withdrawalRequests } = await import('@shared/schema');

      const [clientsResult, accountsResult, actionsResult, withdrawalsResult] = await Promise.all([
        db.select().from(users),
        db.select().from(tradingAccounts),
        db.select().from(actionLog).orderBy(desc(actionLog.createdAt)).limit(10),
        db.select().from(withdrawalRequests).where(eq(withdrawalRequests.status, 'pending'))
      ]);

      const totalClients = clientsResult.length;
      const totalAUM = accountsResult.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance || '0'), 0);
      const todayPnL = accountsResult.reduce((sum: number, acc: any) => sum + parseFloat(acc.dailyPnL || '0'), 0);
      const pendingActions = withdrawalsResult.length;

      res.json({
        totalClients,
        totalAUM: Math.round(totalAUM),
        todayPnL: Math.round(todayPnL),
        pendingActions,
        recentActivity: actionsResult
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  // Admin routes - All clients
  app.get('/api/admin/clients', isAuthenticated, async (req: any, res) =>{
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { db } = await import('./db');
      const { users, tradingAccounts } = await import('@shared/schema');

      const clientsWithAccounts = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          accountCount: sql<number>`count(${tradingAccounts.id})`,
          totalBalance: sql<number>`COALESCE(sum(${tradingAccounts.balance}), 0)`,
          totalPnL: sql<number>`COALESCE(sum(${tradingAccounts.dailyPnL}), 0)`,
          totalDeposits: sql<number>`COALESCE(sum(${tradingAccounts.totalDeposits}), 0)`,
          totalWithdrawals: sql<number>`COALESCE(sum(${tradingAccounts.totalWithdrawals}), 0)`
        })
        .from(users)
        .leftJoin(tradingAccounts, eq(users.id, tradingAccounts.userId))
        .groupBy(users.id);

      res.json(clientsWithAccounts);
    } catch (error) {
      console.error('Error fetching admin clients:', error);
      res.status(500).json({ message: 'Failed to fetch admin clients' });
    }
  });

  // Admin routes - Broker statistics
  app.get('/api/admin/broker-stats', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { db } = await import('./db');
      const { tradingAccounts } = await import('@shared/schema');

      const brokerStats = await db
        .select({
          broker: tradingAccounts.broker,
          accountCount: sql<number>`count(${tradingAccounts.id})`,
          totalBalance: sql<number>`COALESCE(sum(${tradingAccounts.balance}), 0)`,
          totalPnL: sql<number>`COALESCE(sum(${tradingAccounts.dailyPnL}), 0)`,
          totalDeposits: sql<number>`COALESCE(sum(${tradingAccounts.totalDeposits}), 0)`,
          totalWithdrawals: sql<number>`COALESCE(sum(${tradingAccounts.totalWithdrawals}), 0)`
        })
        .from(tradingAccounts)
        .groupBy(tradingAccounts.broker);

      res.json(brokerStats);
    } catch (error) {
      console.error('Error fetching broker stats:', error);
      res.status(500).json({ message: 'Failed to fetch broker stats' });
    }
  });

  // Admin routes - Withdrawal requests
  app.get('/api/admin/withdrawals', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { db } = await import('./db');
      const { withdrawalRequests, users } = await import('@shared/schema');

      const withdrawals = await db
        .select({
          id: withdrawalRequests.id,
          userId: withdrawalRequests.userId,
          userEmail: users.email,
          amount: withdrawalRequests.amount,
          currency: withdrawalRequests.currency,
          status: withdrawalRequests.status,
          requestNotes: withdrawalRequests.requestNotes,
          adminNotes: withdrawalRequests.adminNotes,
          createdAt: withdrawalRequests.createdAt
        })
        .from(withdrawalRequests)
        .leftJoin(users, eq(withdrawalRequests.userId, users.id))
        .orderBy(desc(withdrawalRequests.createdAt));

      res.json(withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      res.status(500).json({ message: 'Failed to fetch withdrawal requests' });
    }
  });

  // Admin routes - Update withdrawal request
  app.patch('/api/admin/withdrawals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const { db } = await import('./db');
      const { withdrawalRequests } = await import('@shared/schema');

      await db
        .update(withdrawalRequests)
        .set({
          status,
          adminNotes: adminNotes || null,
          processedBy: req.user.claims.sub,
          processedAt: sql`NOW()`
        })
        .where(eq(withdrawalRequests.id, id));

      res.json({ success: true, message: 'Withdrawal request updated successfully' });
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      res.status(500).json({ message: 'Failed to update withdrawal request' });
    }
  });

  // Admin routes - Update user profile
  app.patch('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const { firstName, lastName, country } = req.body;

      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        country,
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  });

  // Market prices endpoint
  app.get('/api/market-prices', async (req, res) => {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "API key not configured" });
      }

      const symbols = [
        { symbol: 'XAUUSD', type: 'forex', from: 'XAU', to: 'USD', name: 'Gold' },
        { symbol: 'XAGUSD', type: 'forex', from: 'XAG', to: 'USD', name: 'Silver' },
        { symbol: 'BTCUSDT', type: 'crypto', from: 'BTC', to: 'USDT', name: 'Bitcoin' },
        { symbol: 'ETHUSDT', type: 'crypto', from: 'ETH', to: 'USDT', name: 'Ethereum' },
        { symbol: 'XRPUSDT', type: 'crypto', from: 'XRP', to: 'USDT', name: 'XRP' },
        { symbol: 'EURUSD', type: 'forex', from: 'EUR', to: 'USD', name: 'EUR/USD' },
        { symbol: 'GBPJPY', type: 'forex', from: 'GBP', to: 'JPY', name: 'GBP/JPY' },
        { symbol: 'US500', type: 'index', ticker: 'SPY', name: 'S&P 500' },
        { symbol: 'UK100', type: 'index', ticker: 'ISF.LON', name: 'UK 100' },
        { symbol: 'USOIL', type: 'commodity', ticker: 'USO', name: 'Crude Oil' }
      ];

      const prices = await Promise.all(
        symbols.map(async (item) => {
          try {
            let url = '';
            if (item.type === 'crypto') {
              url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${item.from}&to_currency=${item.to}&apikey=${apiKey}`;
            } else if (item.type === 'forex') {
              url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${item.from}&to_currency=${item.to}&apikey=${apiKey}`;
            } else {
              url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${item.ticker}&apikey=${apiKey}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            let price = 0;
            let change = 0;
            let changePercent = 0;

            if (item.type === 'crypto' || item.type === 'forex') {
              const rate = data['Realtime Currency Exchange Rate'];
              if (rate) {
                price = parseFloat(rate['5. Exchange Rate']);
                // For crypto/forex, calculate approximate change (Alpha Vantage free tier doesn't provide 24h change)
                change = 0;
                changePercent = 0;
              }
            } else {
              const quote = data['Global Quote'];
              if (quote) {
                price = parseFloat(quote['05. price']);
                change = parseFloat(quote['09. change']);
                changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
              }
            }

            return {
              symbol: item.symbol,
              name: item.name,
              price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
              changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`
            };
          } catch (error) {
            console.error(`Error fetching price for ${item.symbol}:`, error);
            return {
              symbol: item.symbol,
              name: item.name,
              price: '0.00',
              change: '+0.00',
              changePercent: '+0.00%'
            };
          }
        })
      );

      res.json(prices);
    } catch (error) {
      console.error("Error fetching market prices:", error);
      res.status(500).json({ message: "Failed to fetch market prices" });
    }
  });

  // Copy Trading V2 - Comprehensive REST API Endpoints
  
  // Validate Bybit API key (skip server-side validation - user validates from browser)
  app.post('/api/copy-trading/validate-key', isAuthenticated, async (req: any, res) => {
    try {
      const { apiKey, apiSecret } = req.body;
      
      if (!apiKey || !apiSecret) {
        return res.status(400).json({ success: false, error: 'API key and secret are required' });
      }

      // Skip server-side validation - Replit's IP is blocked by Bybit
      // User will validate naturally when they use the app from their browser (their IP works)
      console.log('API key validation requested - accepting without server validation');
      
      res.json({
        success: true,
        message: 'Credentials accepted. They will be validated when you use them from your browser.',
        accountInfo: { uid: 'pending_validation' }
      });
    } catch (error: any) {
      console.error('API key validation error:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to validate API key' });
    }
  });

  // Submit copier API keys and settings
  app.post('/api/copy-trading/register-copier', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tradingAccountId, apiKey, apiSecret, settings } = req.body;

      if (!tradingAccountId || !apiKey || !apiSecret) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Skip server-side validation - user validates from browser
      console.log('Registering copier without server-side validation');

      // Get account and verify ownership
      const account = await storage.getTradingAccountById(tradingAccountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: 'Trading account not found' });
      }

      // Encrypt and store API keys
      const encryptedKey = encrypt(apiKey);
      const encryptedSecret = encrypt(apiSecret);

      // Update trading account with API keys
      await db.update(tradingAccounts)
        .set({
          apiKeyEncrypted: encryptedKey,
          apiSecretEncrypted: encryptedSecret,
          copyStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(tradingAccounts.id, tradingAccountId));

      // Create or update copier settings
      const existingSettings = await db.select()
        .from(copierSettings)
        .where(eq(copierSettings.tradingAccountId, tradingAccountId))
        .limit(1);

      if (existingSettings.length > 0) {
        await db.update(copierSettings)
          .set({ ...settings, updatedAt: new Date() })
          .where(eq(copierSettings.tradingAccountId, tradingAccountId));
      } else {
        await db.insert(copierSettings).values({
          tradingAccountId,
          ...settings,
        });
      }

      // Initialize sync status
      await db.insert(syncStatus).values({
        tradingAccountId,
        syncMethod: 'websocket',
        syncStatus: 'idle',
        websocketConnected: false,
      }).onConflictDoUpdate({
        target: syncStatus.tradingAccountId,
        set: { syncStatus: 'idle', updatedAt: new Date() },
      });

      // Log action
      await db.insert(actionLog).values({
        userId,
        action: 'COPIER_REGISTERED',
        description: `Registered as copier with API keys`,
        metadata: JSON.stringify({ tradingAccountId }),
      });

      res.json({ success: true, message: 'Copier registered successfully' });
    } catch (error: any) {
      console.error('Copier registration error:', error);
      res.status(500).json({ message: error.message || 'Failed to register copier' });
    }
  });

  // Get sync status for account
  app.get('/api/copy-trading/sync-status/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      // Verify ownership
      const account = await storage.getTradingAccountById(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: 'Trading account not found' });
      }

      const status = await db.select()
        .from(syncStatus)
        .where(eq(syncStatus.tradingAccountId, accountId))
        .limit(1);

      res.json(status[0] || { status: 'not_configured' });
    } catch (error: any) {
      console.error('Sync status error:', error);
      res.status(500).json({ message: 'Failed to fetch sync status' });
    }
  });

  // Get trade mirroring history
  app.get('/api/copy-trading/mirror-history/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      // Verify ownership
      const account = await storage.getTradingAccountById(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: 'Trading account not found' });
      }

      const history = await db.select()
        .from(tradeMirroringLog)
        .where(eq(tradeMirroringLog.copierAccountId, accountId))
        .orderBy(desc(tradeMirroringLog.createdAt))
        .limit(limit);

      res.json(history);
    } catch (error: any) {
      console.error('Mirror history error:', error);
      res.status(500).json({ message: 'Failed to fetch mirror history' });
    }
  });

  // Get pending tasks for account
  app.get('/api/copy-trading/tasks/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      // Verify ownership
      const account = await storage.getTradingAccountById(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: 'Trading account not found' });
      }

      const tasks = await db.select()
        .from(copyTradingTasks)
        .where(eq(copyTradingTasks.copierAccountId, accountId))
        .orderBy(desc(copyTradingTasks.createdAt))
        .limit(100);

      res.json(tasks);
    } catch (error: any) {
      console.error('Tasks fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  // Update copier settings
  app.patch('/api/copy-trading/settings/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;
      const settings = req.body;

      // Verify ownership
      const account = await storage.getTradingAccountById(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: 'Trading account not found' });
      }

      await db.update(copierSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(copierSettings.tradingAccountId, accountId));

      // Log action
      await db.insert(actionLog).values({
        userId,
        action: 'COPIER_SETTINGS_UPDATED',
        description: `Updated copier settings`,
        metadata: JSON.stringify({ accountId, settings }),
      });

      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error: any) {
      console.error('Settings update error:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // Get copier settings
  app.get('/api/copy-trading/settings/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      // Verify ownership
      const account = await storage.getTradingAccountById(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: 'Trading account not found' });
      }

      const settings = await db.select()
        .from(copierSettings)
        .where(eq(copierSettings.tradingAccountId, accountId))
        .limit(1);

      res.json(settings[0] || {});
    } catch (error: any) {
      console.error('Settings fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  // Admin - Get all copy trading tasks
  app.get('/api/admin/copy-trading/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
      if (!adminEmails.includes(req.user.claims.email)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const tasks = await db.select()
        .from(copyTradingTasks)
        .orderBy(desc(copyTradingTasks.createdAt))
        .limit(limit);

      res.json(tasks);
    } catch (error: any) {
      console.error('Admin tasks fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
