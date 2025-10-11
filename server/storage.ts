import {
  users,
  tradingAccounts,
  referralEarnings,
  masterCopierConnections,
  referralLinks,
  brokerRequests,
  adminSettings,
  profitTransfers,
  actionLog,
  type User,
  type UpsertUser,
  type TradingAccount,
  type InsertTradingAccount,
  type ReferralEarning,
  type InsertReferralEarning,
  type MasterCopierConnection,
  type InsertMasterCopierConnection,
  type ReferralLink,
  type InsertReferralLink,
  type BrokerRequest,
  type InsertBrokerRequest,
  type AdminSetting,
  type InsertAdminSetting,
  type ProfitTransfer,
  type InsertProfitTransfer,
  type ActionLog,
  type InsertActionLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trading account operations
  getTradingAccounts(userId: string): Promise<TradingAccount[]>;
  createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount>;
  updateTradingAccountBalance(accountId: string, balance: string, dailyPnL: string): Promise<void>;
  deleteTradingAccount(accountId: string, userId: string): Promise<void>;
  
  // Referral operations
  getReferralEarnings(userId: string): Promise<ReferralEarning[]>;
  createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning>;
  getTotalReferralEarnings(userId: string): Promise<{ total: string }>;
  getReferralCount(userId: string): Promise<{ count: number }>;
  
  // Master copier operations
  getMasterCopierConnections(userId: string): Promise<MasterCopierConnection[]>;
  createMasterCopierConnection(connection: InsertMasterCopierConnection): Promise<MasterCopierConnection>;
  updateMasterCopierStatus(connectionId: string, isActive: boolean): Promise<void>;
  
  // Referral link operations
  getReferralLinks(userId: string): Promise<ReferralLink[]>;
  createReferralLink(link: InsertReferralLink): Promise<ReferralLink>;
  updateReferralLinkStats(linkId: string, clicks?: number, conversions?: number): Promise<void>;
  
  // Broker request operations
  getBrokerRequests(): Promise<BrokerRequest[]>;
  createBrokerRequest(request: InsertBrokerRequest): Promise<BrokerRequest>;
  updateBrokerRequestStatus(requestId: string, status: string, adminNotes?: string): Promise<void>;
  
  // Admin settings operations
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  
  // Profit transfer operations
  getProfitTransfers(userId: string): Promise<ProfitTransfer[]>;
  createProfitTransfer(transfer: InsertProfitTransfer): Promise<ProfitTransfer>;
  updateProfitTransferStatus(transferId: string, status: string, bybitTransactionId?: string, errorMessage?: string): Promise<void>;
  
  // Action log operations
  getActionLogs(userId: string, limit?: number): Promise<ActionLog[]>;
  createActionLog(log: InsertActionLog): Promise<ActionLog>;
  
  // Trading account with API keys
  updateTradingAccountApiKeys(accountId: string, apiKeyEncrypted: string, apiSecretEncrypted: string): Promise<void>;
  updateTradingAccountSettings(accountId: string, tradingCapital?: string, maxRiskPercentage?: string, copyStatus?: string): Promise<void>;
  getTradingAccountById(accountId: string): Promise<TradingAccount | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Check if user already exists by ID
      const existingUser = userData.id ? await this.getUser(userData.id) : undefined;
      
      // Generate referral code if not provided
      if (!userData.referralCode) {
        userData.referralCode = this.generateReferralCode();
      }

      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();

      // Create default referral links only for new users
      if (user && !existingUser) {
        await this.createDefaultReferralLinks(user.id);
      }

      return user;
    } catch (error: any) {
      // Handle unique constraint violation on email
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        // Email already exists - check if we should update the existing user
        const [existingUserByEmail] = await db
          .select()
          .from(users)
          .where(eq(users.email, userData.email || ''));
        
        if (existingUserByEmail) {
          // Update the existing user with new data (email ownership might have transferred)
          const [updatedUser] = await db
            .update(users)
            .set({
              ...userData,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUserByEmail.id))
            .returning();
          
          return updatedUser;
        }
      }
      
      // Re-throw other errors
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Trading account operations
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    return await db
      .select()
      .from(tradingAccounts)
      .where(eq(tradingAccounts.userId, userId))
      .orderBy(desc(tradingAccounts.createdAt));
  }

  async createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount> {
    const [newAccount] = await db
      .insert(tradingAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateTradingAccountBalance(accountId: string, balance: string, dailyPnL: string): Promise<void> {
    await db
      .update(tradingAccounts)
      .set({ 
        balance, 
        dailyPnL, 
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tradingAccounts.id, accountId));
  }

  async deleteTradingAccount(accountId: string, userId: string): Promise<void> {
    await db
      .delete(tradingAccounts)
      .where(and(
        eq(tradingAccounts.id, accountId),
        eq(tradingAccounts.userId, userId)
      ));
  }

  // Referral operations
  async getReferralEarnings(userId: string): Promise<ReferralEarning[]> {
    return await db
      .select()
      .from(referralEarnings)
      .where(eq(referralEarnings.referrerId, userId))
      .orderBy(desc(referralEarnings.createdAt));
  }

  async createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning> {
    const [newEarning] = await db
      .insert(referralEarnings)
      .values(earning)
      .returning();
    return newEarning;
  }

  async getTotalReferralEarnings(userId: string): Promise<{ total: string }> {
    const result = await db
      .select({
        total: sql<string>`COALESCE(SUM(${referralEarnings.amount}), 0)::text`
      })
      .from(referralEarnings)
      .where(and(
        eq(referralEarnings.referrerId, userId),
        eq(referralEarnings.status, 'paid')
      ));
    
    return result[0] || { total: '0.00' };
  }

  async getReferralCount(userId: string): Promise<{ count: number }> {
    const result = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${referralEarnings.referredUserId})`
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.referrerId, userId));
    
    return result[0] || { count: 0 };
  }

  // Master copier operations
  async getMasterCopierConnections(userId: string): Promise<MasterCopierConnection[]> {
    return await db
      .select()
      .from(masterCopierConnections)
      .where(eq(masterCopierConnections.userId, userId))
      .orderBy(desc(masterCopierConnections.createdAt));
  }

  async createMasterCopierConnection(connection: InsertMasterCopierConnection): Promise<MasterCopierConnection> {
    const [newConnection] = await db
      .insert(masterCopierConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async updateMasterCopierStatus(connectionId: string, isActive: boolean): Promise<void> {
    await db
      .update(masterCopierConnections)
      .set({ 
        isActive, 
        updatedAt: new Date() 
      })
      .where(eq(masterCopierConnections.id, connectionId));
  }

  // Referral link operations
  async getReferralLinks(userId: string): Promise<ReferralLink[]> {
    return await db
      .select()
      .from(referralLinks)
      .where(eq(referralLinks.userId, userId))
      .orderBy(referralLinks.broker);
  }

  async createReferralLink(link: InsertReferralLink): Promise<ReferralLink> {
    const [newLink] = await db
      .insert(referralLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async updateReferralLinkStats(linkId: string, clicks?: number, conversions?: number): Promise<void> {
    const updateData: any = { updatedAt: new Date() };
    
    if (clicks !== undefined) {
      updateData.clickCount = sql`${referralLinks.clickCount} + ${clicks}`;
    }
    
    if (conversions !== undefined) {
      updateData.conversionCount = sql`${referralLinks.conversionCount} + ${conversions}`;
    }

    await db
      .update(referralLinks)
      .set(updateData)
      .where(eq(referralLinks.id, linkId));
  }

  // Broker request operations
  async getBrokerRequests(): Promise<BrokerRequest[]> {
    return await db
      .select()
      .from(brokerRequests)
      .orderBy(desc(brokerRequests.createdAt));
  }

  async createBrokerRequest(request: InsertBrokerRequest): Promise<BrokerRequest> {
    const [newRequest] = await db
      .insert(brokerRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateBrokerRequestStatus(requestId: string, status: string, adminNotes?: string): Promise<void> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await db
      .update(brokerRequests)
      .set(updateData)
      .where(eq(brokerRequests.id, requestId));
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, key));
    return setting;
  }

  async setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const [result] = await db
      .insert(adminSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: adminSettings.settingKey,
        set: {
          settingValue: setting.settingValue,
          description: setting.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Profit transfer operations
  async getProfitTransfers(userId: string): Promise<ProfitTransfer[]> {
    return await db
      .select()
      .from(profitTransfers)
      .where(eq(profitTransfers.userId, userId))
      .orderBy(desc(profitTransfers.createdAt));
  }

  async createProfitTransfer(transfer: InsertProfitTransfer): Promise<ProfitTransfer> {
    const [newTransfer] = await db
      .insert(profitTransfers)
      .values(transfer)
      .returning();
    return newTransfer;
  }

  async updateProfitTransferStatus(
    transferId: string, 
    status: string, 
    bybitTransactionId?: string, 
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = { 
      transferStatus: status,
      completedAt: status === 'completed' ? new Date() : undefined,
    };
    
    if (bybitTransactionId) {
      updateData.bybitTransactionId = bybitTransactionId;
    }
    
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await db
      .update(profitTransfers)
      .set(updateData)
      .where(eq(profitTransfers.id, transferId));
  }

  // Action log operations
  async getActionLogs(userId: string, limit: number = 100): Promise<ActionLog[]> {
    return await db
      .select()
      .from(actionLog)
      .where(eq(actionLog.userId, userId))
      .orderBy(desc(actionLog.createdAt))
      .limit(limit);
  }

  async createActionLog(log: InsertActionLog): Promise<ActionLog> {
    const [newLog] = await db
      .insert(actionLog)
      .values(log)
      .returning();
    return newLog;
  }

  // Trading account with API keys operations
  async updateTradingAccountApiKeys(
    accountId: string, 
    apiKeyEncrypted: string, 
    apiSecretEncrypted: string
  ): Promise<void> {
    await db
      .update(tradingAccounts)
      .set({ 
        apiKeyEncrypted, 
        apiSecretEncrypted,
        updatedAt: new Date()
      })
      .where(eq(tradingAccounts.id, accountId));
  }

  async updateTradingAccountSettings(
    accountId: string, 
    tradingCapital?: string, 
    maxRiskPercentage?: string, 
    copyStatus?: string
  ): Promise<void> {
    const updateData: any = { 
      updatedAt: new Date() 
    };
    
    if (tradingCapital !== undefined) {
      updateData.tradingCapital = tradingCapital;
    }
    
    if (maxRiskPercentage !== undefined) {
      updateData.maxRiskPercentage = maxRiskPercentage;
    }
    
    if (copyStatus !== undefined) {
      updateData.copyStatus = copyStatus;
    }

    await db
      .update(tradingAccounts)
      .set(updateData)
      .where(eq(tradingAccounts.id, accountId));
  }

  async getTradingAccountById(accountId: string): Promise<TradingAccount | undefined> {
    const [account] = await db
      .select()
      .from(tradingAccounts)
      .where(eq(tradingAccounts.id, accountId));
    return account;
  }

  // Helper methods
  private generateReferralCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  private async createDefaultReferralLinks(userId: string): Promise<void> {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'alvacapital.online';
    
    const defaultLinks = [
      {
        userId,
        broker: 'exness',
        referralUrl: `https://one.exness.link/a/${this.generateReferralCode().toLowerCase()}`,
      },
      {
        userId,
        broker: 'bybit',
        referralUrl: 'https://partner.bybit.com/b/119776',
      },
      {
        userId,
        broker: 'binance',
        referralUrl: `https://accounts.binance.com/register?ref=${this.generateReferralCode()}`,
      },
    ];

    for (const link of defaultLinks) {
      try {
        await this.createReferralLink(link);
      } catch (error) {
        console.error(`Failed to create referral link for ${link.broker}:`, error);
      }
    }
  }
}

// Memory storage implementation for when database is unavailable
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tradingAccounts: Map<string, TradingAccount[]> = new Map();
  private referralEarnings: Map<string, ReferralEarning[]> = new Map();
  private masterCopierConnections: Map<string, MasterCopierConnection[]> = new Map();
  private referralLinks: Map<string, ReferralLink[]> = new Map();

  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Generate referral code if not provided
    if (!userData.referralCode) {
      userData.referralCode = this.generateReferralCode();
    }

    const userId = userData.id || '';
    const existingUser = this.users.get(userId);
    const user: User = {
      ...userData,
      id: userId,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    } as User;

    this.users.set(userId, user);

    // Create default referral links for new users
    if (!existingUser) {
      await this.createDefaultReferralLinks(user.id);
    }

    return user;
  }

  // Trading account operations
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    return this.tradingAccounts.get(userId) || [];
  }

  async createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount> {
    const newAccount: TradingAccount = {
      ...account,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TradingAccount;

    const userAccounts = this.tradingAccounts.get(account.userId) || [];
    userAccounts.push(newAccount);
    this.tradingAccounts.set(account.userId, userAccounts);

    return newAccount;
  }

  async updateTradingAccountBalance(accountId: string, balance: string, dailyPnL: string): Promise<void> {
    for (const [userId, accounts] of Array.from(this.tradingAccounts.entries())) {
      const account = accounts.find((acc: TradingAccount) => acc.id === accountId);
      if (account) {
        account.balance = balance;
        account.dailyPnL = dailyPnL;
        account.lastSyncAt = new Date();
        account.updatedAt = new Date();
        break;
      }
    }
  }

  async deleteTradingAccount(accountId: string, userId: string): Promise<void> {
    const userAccounts = this.tradingAccounts.get(userId) || [];
    const filteredAccounts = userAccounts.filter(acc => acc.id !== accountId);
    this.tradingAccounts.set(userId, filteredAccounts);
  }

  // Referral operations
  async getReferralEarnings(userId: string): Promise<ReferralEarning[]> {
    return this.referralEarnings.get(userId) || [];
  }

  async createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning> {
    const newEarning: ReferralEarning = {
      ...earning,
      id: nanoid(),
      createdAt: new Date(),
      paidAt: null,
    } as ReferralEarning;

    const userEarnings = this.referralEarnings.get(earning.referrerId) || [];
    userEarnings.push(newEarning);
    this.referralEarnings.set(earning.referrerId, userEarnings);

    return newEarning;
  }

  async getTotalReferralEarnings(userId: string): Promise<{ total: string }> {
    const earnings = this.referralEarnings.get(userId) || [];
    const total = earnings
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
    return { total: total.toFixed(2) };
  }

  async getReferralCount(userId: string): Promise<{ count: number }> {
    const earnings = this.referralEarnings.get(userId) || [];
    const uniqueReferrals = new Set(earnings.map(e => e.referredUserId));
    return { count: uniqueReferrals.size };
  }

  // Master copier operations
  async getMasterCopierConnections(userId: string): Promise<MasterCopierConnection[]> {
    return this.masterCopierConnections.get(userId) || [];
  }

  async createMasterCopierConnection(connection: InsertMasterCopierConnection): Promise<MasterCopierConnection> {
    const newConnection: MasterCopierConnection = {
      ...connection,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as MasterCopierConnection;

    const userConnections = this.masterCopierConnections.get(connection.userId) || [];
    userConnections.push(newConnection);
    this.masterCopierConnections.set(connection.userId, userConnections);

    return newConnection;
  }

  async updateMasterCopierStatus(connectionId: string, isActive: boolean): Promise<void> {
    for (const [userId, connections] of Array.from(this.masterCopierConnections.entries())) {
      const connection = connections.find((conn: MasterCopierConnection) => conn.id === connectionId);
      if (connection) {
        connection.isActive = isActive;
        connection.updatedAt = new Date();
        break;
      }
    }
  }

  // Referral link operations
  async getReferralLinks(userId: string): Promise<ReferralLink[]> {
    return this.referralLinks.get(userId) || [];
  }

  async createReferralLink(link: InsertReferralLink): Promise<ReferralLink> {
    const newLink: ReferralLink = {
      ...link,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ReferralLink;

    const userLinks = this.referralLinks.get(link.userId) || [];
    userLinks.push(newLink);
    this.referralLinks.set(link.userId, userLinks);

    return newLink;
  }

  async updateReferralLinkStats(linkId: string, clicks?: number, conversions?: number): Promise<void> {
    for (const [userId, links] of Array.from(this.referralLinks.entries())) {
      const link = links.find((l: ReferralLink) => l.id === linkId);
      if (link) {
        if (clicks !== undefined) {
          link.clickCount = (link.clickCount || 0) + clicks;
        }
        if (conversions !== undefined) {
          link.conversionCount = (link.conversionCount || 0) + conversions;
        }
        link.updatedAt = new Date();
        break;
      }
    }
  }

  // Broker request operations (not supported in memory storage)
  async getBrokerRequests(): Promise<BrokerRequest[]> {
    return [];
  }

  async createBrokerRequest(request: InsertBrokerRequest): Promise<BrokerRequest> {
    throw new Error("Broker requests not supported in memory storage");
  }

  async updateBrokerRequestStatus(requestId: string, status: string, adminNotes?: string): Promise<void> {
    throw new Error("Broker requests not supported in memory storage");
  }

  // Admin settings operations (not supported in memory storage)
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    return undefined;
  }

  async setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    throw new Error("Admin settings not supported in memory storage");
  }

  // Profit transfer operations (not supported in memory storage)
  async getProfitTransfers(userId: string): Promise<ProfitTransfer[]> {
    return [];
  }

  async createProfitTransfer(transfer: InsertProfitTransfer): Promise<ProfitTransfer> {
    throw new Error("Profit transfers not supported in memory storage");
  }

  async updateProfitTransferStatus(transferId: string, status: string, bybitTransactionId?: string, errorMessage?: string): Promise<void> {
    throw new Error("Profit transfers not supported in memory storage");
  }

  // Action log operations (not supported in memory storage)
  async getActionLogs(userId: string, limit?: number): Promise<ActionLog[]> {
    return [];
  }

  async createActionLog(log: InsertActionLog): Promise<ActionLog> {
    throw new Error("Action logs not supported in memory storage");
  }

  // Trading account with API keys (not supported in memory storage)
  async updateTradingAccountApiKeys(accountId: string, apiKeyEncrypted: string, apiSecretEncrypted: string): Promise<void> {
    throw new Error("API key storage not supported in memory storage");
  }

  async updateTradingAccountSettings(accountId: string, tradingCapital?: string, maxRiskPercentage?: string, copyStatus?: string): Promise<void> {
    throw new Error("Trading account settings not supported in memory storage");
  }

  async getTradingAccountById(accountId: string): Promise<TradingAccount | undefined> {
    return undefined;
  }

  // Helper methods
  private generateReferralCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  private async createDefaultReferralLinks(userId: string): Promise<void> {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'alvacapital.online';
    
    const defaultLinks = [
      {
        userId,
        broker: 'exness',
        referralUrl: `https://one.exness.link/a/${this.generateReferralCode().toLowerCase()}`,
      },
      {
        userId,
        broker: 'bybit',
        referralUrl: 'https://partner.bybit.com/b/119776',
      },
      {
        userId,
        broker: 'binance',
        referralUrl: `https://accounts.binance.com/register?ref=${this.generateReferralCode()}`,
      },
    ];

    for (const link of defaultLinks) {
      try {
        await this.createReferralLink(link);
      } catch (error) {
        console.error(`Failed to create referral link for ${link.broker}:`, error);
      }
    }
  }
}

// Use database storage for persistent data
export const storage = new DatabaseStorage();
