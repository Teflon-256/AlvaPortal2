import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTradingAccountSchema, insertReferralEarningSchema, insertMasterCopierConnectionSchema, insertBrokerRequestSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { encrypt, decrypt } from "./crypto";
import { BybitService } from "./bybit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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
      const accountsWithBalance = await Promise.all(
        tradingAccounts.map(async (account) => {
          if (account.broker === 'bybit' && account.apiKeyEncrypted && account.apiSecretEncrypted) {
            try {
              const bybitService = BybitService.createFromEncrypted(
                account.apiKeyEncrypted,
                account.apiSecretEncrypted
              );
              const balances = await bybitService.getWalletBalance('UNIFIED');
              const totalBalance = balances.reduce((sum, balance) => {
                return sum + parseFloat(balance.totalWalletBalance || '0');
              }, 0);
              
              // Get performance stats for P&L
              const performance = await bybitService.getPerformanceStats();
              
              return {
                ...account,
                balance: totalBalance.toString(),
                dailyPnL: performance.dailyPnL.toString()
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

      res.json({
        totalBalance: totalBalance.toFixed(2),
        dailyPnL: dailyPnL.toFixed(2),
        referralCount: referralCount.count,
        referralEarnings: totalEarnings.total,
        tradingAccounts: accountsWithBalance,
        recentReferralEarnings: referralEarnings.slice(0, 5), // Latest 5 earnings
        masterCopierConnections,
        referralLinks
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
      
      await storage.deleteTradingAccount(accountId, userId);
      res.json({ message: "Trading account disconnected successfully" });
    } catch (error) {
      console.error("Error deleting trading account:", error);
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

      // Test connection with Bybit API
      const bybitService = new BybitService({ apiKey, apiSecret });
      const isValid = await bybitService.testConnection();
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid API credentials" });
      }

      // Get wallet balance from Bybit
      const balances = await bybitService.getWalletBalance('UNIFIED');
      const totalBalance = balances.reduce((sum, balance) => {
        return sum + parseFloat(balance.totalWalletBalance || '0');
      }, 0);
      
      // Encrypt API credentials
      const apiKeyEncrypted = encrypt(apiKey);
      const apiSecretEncrypted = encrypt(apiSecret);
      
      // Create trading account
      const tradingAccount = await storage.createTradingAccount({
        userId,
        broker: 'bybit',
        accountId: `bybit_${Date.now()}`,
        accountName: 'Bybit Account',
        balance: totalBalance.toString(),
        dailyPnL: '0',
        apiKeyEncrypted,
        apiSecretEncrypted,
        tradingCapital: tradingCapital || totalBalance.toString(),
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
            masterAccountId: masterBybitAccount.id,
            copierAccountId: tradingAccount.id,
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

      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted
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

      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted
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

      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted
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

      const bybitService = BybitService.createFromEncrypted(
        account.apiKeyEncrypted,
        account.apiSecretEncrypted
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

  const httpServer = createServer(app);
  return httpServer;
}
