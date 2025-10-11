import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  country: varchar("country"),
  profileImageUrl: varchar("profile_image_url"),
  twoFactorSecret: varchar("two_factor_secret"), // For 2FA
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading accounts connected to our platform
export const tradingAccounts = pgTable("trading_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  broker: varchar("broker").notNull(), // 'exness', 'bybit', 'binance'
  accountId: varchar("account_id").notNull(),
  accountName: varchar("account_name"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default('0.00'),
  dailyPnL: decimal("daily_pnl", { precision: 15, scale: 2 }).default('0.00'),
  copyStatus: varchar("copy_status").default('inactive'), // 'active', 'inactive', 'paused'
  isConnected: boolean("is_connected").default(true),
  apiKeyEncrypted: text("api_key_encrypted"), // Encrypted API key
  apiSecretEncrypted: text("api_secret_encrypted"), // Encrypted API secret
  tradingCapital: decimal("trading_capital", { precision: 15, scale: 2 }), // Amount user wants to trade
  maxRiskPercentage: decimal("max_risk_percentage", { precision: 5, scale: 2 }).default('2.00'), // Max exposure across all trades
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral earnings tracking
export const referralEarnings = pgTable("referral_earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  feePercentage: decimal("fee_percentage", { precision: 5, scale: 2 }).default('10.00'), // 10% of 50% fees
  broker: varchar("broker").notNull(),
  transactionType: varchar("transaction_type").notNull(), // 'commission', 'trading_fee', etc.
  status: varchar("status").default('pending'), // 'pending', 'paid', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Master copier connections
export const masterCopierConnections = pgTable("master_copier_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id),
  masterAccountId: varchar("master_account_id").notNull(),
  copyRatio: decimal("copy_ratio", { precision: 5, scale: 2 }).default('1.00'), // 1.00 = 100%
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral links for each broker
export const referralLinks = pgTable("referral_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  broker: varchar("broker").notNull(), // 'exness', 'bybit', 'binance'
  referralUrl: text("referral_url").notNull(),
  clickCount: integer("click_count").default(0),
  conversionCount: integer("conversion_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broker requests for "Other" broker submissions
export const brokerRequests = pgTable("broker_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  brokerName: varchar("broker_name").notNull(),
  status: varchar("status").default('pending'), // 'pending', 'approved', 'rejected'
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin settings for master account and profit transfers
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").unique().notNull(), // e.g., 'master_account', 'transfer_user_id'
  settingValue: text("setting_value"), // Encrypted for sensitive data
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profit transfers log - tracks all 50/50 profit splits and transfers
export const profitTransfers = pgTable("profit_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id),
  totalProfit: decimal("total_profit", { precision: 15, scale: 2 }).notNull(),
  userShare: decimal("user_share", { precision: 15, scale: 2 }).notNull(), // 50%
  platformShare: decimal("platform_share", { precision: 15, scale: 2 }).notNull(), // 50%
  transferAmount: decimal("transfer_amount", { precision: 15, scale: 2 }).notNull(), // Amount transferred in USDT
  transferStatus: varchar("transfer_status").default('pending'), // 'pending', 'completed', 'failed'
  transferType: varchar("transfer_type").notNull(), // 'weekly', 'withdrawal_triggered'
  bybitTransactionId: varchar("bybit_transaction_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Action log - tracks all user actions in the portal
export const actionLog = pgTable("action_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'connect_account', 'disconnect_account', 'update_settings', 'profit_transfer', etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional data about the action
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading Algorithms - Custom strategy definitions
export const algorithms = pgTable("algorithms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  strategyType: varchar("strategy_type").notNull(), // 'trend_following', 'mean_reversion', 'breakout', 'custom'
  indicators: jsonb("indicators"), // Array of indicators used: RSI, MACD, EMA, etc.
  entryConditions: jsonb("entry_conditions"), // Entry logic
  exitConditions: jsonb("exit_conditions"), // Exit logic
  riskManagement: jsonb("risk_management"), // Stop loss, take profit rules
  timeframes: text("timeframes").array(), // ['1m', '5m', '1h', '1d']
  instruments: text("instruments").array(), // ['BTC/USDT', 'EUR/USD', 'SPX']
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading Signals - Generated trade signals
export const signals = pgTable("signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  algorithmId: varchar("algorithm_id").notNull().references(() => algorithms.id),
  instrument: varchar("instrument").notNull(), // 'BTC/USDT', 'EUR/USD'
  broker: varchar("broker").notNull(), // 'bybit', 'exness', 'ibkr'
  side: varchar("side").notNull(), // 'buy', 'sell'
  entryPrice: decimal("entry_price", { precision: 15, scale: 5 }),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  positionSize: decimal("position_size", { precision: 15, scale: 5 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100%
  status: varchar("status").default('pending'), // 'pending', 'approved', 'rejected', 'executed', 'cancelled'
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  executedAt: timestamp("executed_at"),
  metadata: jsonb("metadata"), // Additional signal data
  createdAt: timestamp("created_at").defaultNow(),
});

// Trades - Executed trades
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id),
  signalId: varchar("signal_id").references(() => signals.id),
  broker: varchar("broker").notNull(),
  instrument: varchar("instrument").notNull(),
  side: varchar("side").notNull(), // 'buy', 'sell'
  orderType: varchar("order_type").notNull(), // 'market', 'limit', 'stop'
  quantity: decimal("quantity", { precision: 15, scale: 5 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 15, scale: 5 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 15, scale: 5 }),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  commission: decimal("commission", { precision: 15, scale: 5 }).default('0'),
  pnl: decimal("pnl", { precision: 15, scale: 2 }).default('0'),
  status: varchar("status").default('open'), // 'open', 'closed', 'cancelled'
  brokerOrderId: varchar("broker_order_id"),
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Positions - Current open positions
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id),
  tradeId: varchar("trade_id").notNull().references(() => trades.id),
  broker: varchar("broker").notNull(),
  instrument: varchar("instrument").notNull(),
  side: varchar("side").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 5 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 15, scale: 5 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 5 }),
  unrealizedPnL: decimal("unrealized_pnl", { precision: 15, scale: 2 }).default('0'),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk Parameters - Account-level risk settings
export const riskParameters = pgTable("risk_parameters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id).unique(),
  maxDrawdownPercent: decimal("max_drawdown_percent", { precision: 5, scale: 2 }).default('5.00'), // 5-50%
  maxDailyLossPercent: decimal("max_daily_loss_percent", { precision: 5, scale: 2 }).default('0.20'), // Starting 0.2%
  maxPositionSizePercent: decimal("max_position_size_percent", { precision: 5, scale: 2 }).default('0.20'), // Starting 0.2%
  maxOpenPositions: integer("max_open_positions").default(5),
  allowedInstruments: text("allowed_instruments").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broker Configurations - Master account settings
export const brokerConfigurations = pgTable("broker_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  broker: varchar("broker").notNull().unique(), // 'bybit', 'exness', 'ibkr'
  masterAccountId: varchar("master_account_id").notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(),
  apiSecretEncrypted: text("api_secret_encrypted").notNull(),
  additionalConfig: jsonb("additional_config"), // Broker-specific configs
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Withdrawal Requests - Client withdrawal requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency").default('USDT'),
  status: varchar("status").default('pending'), // 'pending', 'approved', 'rejected', 'completed', 'failed'
  requestNotes: text("request_notes"),
  adminNotes: text("admin_notes"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance Analytics - Track account performance
export const performanceAnalytics = pgTable("performance_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradingAccountId: varchar("trading_account_id").notNull().references(() => tradingAccounts.id),
  date: timestamp("date").notNull(),
  totalTrades: integer("total_trades").default(0),
  winningTrades: integer("winning_trades").default(0),
  losingTrades: integer("losing_trades").default(0),
  totalPnL: decimal("total_pnl", { precision: 15, scale: 2 }).default('0'),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default('0'),
  profitFactor: decimal("profit_factor", { precision: 5, scale: 2 }).default('0'),
  sharpeRatio: decimal("sharpe_ratio", { precision: 5, scale: 2 }),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }).default('0'),
  accountBalance: decimal("account_balance", { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  tradingAccounts: many(tradingAccounts),
  referralEarnings: many(referralEarnings, { relationName: "referrerEarnings" }),
  referredEarnings: many(referralEarnings, { relationName: "referredEarnings" }),
  masterCopierConnections: many(masterCopierConnections),
  referralLinks: many(referralLinks),
  brokerRequests: many(brokerRequests),
  profitTransfers: many(profitTransfers),
  actionLog: many(actionLog),
  algorithms: many(algorithms),
  trades: many(trades),
  positions: many(positions),
  withdrawalRequests: many(withdrawalRequests),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const tradingAccountsRelations = relations(tradingAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [tradingAccounts.userId],
    references: [users.id],
  }),
  masterCopierConnections: many(masterCopierConnections),
  profitTransfers: many(profitTransfers),
  trades: many(trades),
  positions: many(positions),
  riskParameters: one(riskParameters),
  performanceAnalytics: many(performanceAnalytics),
  withdrawalRequests: many(withdrawalRequests),
}));

export const referralEarningsRelations = relations(referralEarnings, ({ one }) => ({
  referrer: one(users, {
    fields: [referralEarnings.referrerId],
    references: [users.id],
    relationName: "referrerEarnings",
  }),
  referredUser: one(users, {
    fields: [referralEarnings.referredUserId],
    references: [users.id],
    relationName: "referredEarnings",
  }),
}));

export const masterCopierConnectionsRelations = relations(masterCopierConnections, ({ one }) => ({
  user: one(users, {
    fields: [masterCopierConnections.userId],
    references: [users.id],
  }),
  tradingAccount: one(tradingAccounts, {
    fields: [masterCopierConnections.tradingAccountId],
    references: [tradingAccounts.id],
  }),
}));

export const referralLinksRelations = relations(referralLinks, ({ one }) => ({
  user: one(users, {
    fields: [referralLinks.userId],
    references: [users.id],
  }),
}));

export const brokerRequestsRelations = relations(brokerRequests, ({ one }) => ({
  user: one(users, {
    fields: [brokerRequests.userId],
    references: [users.id],
  }),
}));

export const profitTransfersRelations = relations(profitTransfers, ({ one }) => ({
  user: one(users, {
    fields: [profitTransfers.userId],
    references: [users.id],
  }),
  tradingAccount: one(tradingAccounts, {
    fields: [profitTransfers.tradingAccountId],
    references: [tradingAccounts.id],
  }),
}));

export const actionLogRelations = relations(actionLog, ({ one }) => ({
  user: one(users, {
    fields: [actionLog.userId],
    references: [users.id],
  }),
}));

export const algorithmsRelations = relations(algorithms, ({ one, many }) => ({
  creator: one(users, {
    fields: [algorithms.createdBy],
    references: [users.id],
  }),
  signals: many(signals),
}));

export const signalsRelations = relations(signals, ({ one }) => ({
  algorithm: one(algorithms, {
    fields: [signals.algorithmId],
    references: [algorithms.id],
  }),
  reviewer: one(users, {
    fields: [signals.reviewedBy],
    references: [users.id],
  }),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
  tradingAccount: one(tradingAccounts, {
    fields: [trades.tradingAccountId],
    references: [tradingAccounts.id],
  }),
  signal: one(signals, {
    fields: [trades.signalId],
    references: [signals.id],
  }),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  user: one(users, {
    fields: [positions.userId],
    references: [users.id],
  }),
  tradingAccount: one(tradingAccounts, {
    fields: [positions.tradingAccountId],
    references: [tradingAccounts.id],
  }),
  trade: one(trades, {
    fields: [positions.tradeId],
    references: [trades.id],
  }),
}));

export const riskParametersRelations = relations(riskParameters, ({ one }) => ({
  tradingAccount: one(tradingAccounts, {
    fields: [riskParameters.tradingAccountId],
    references: [tradingAccounts.id],
  }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalRequests.userId],
    references: [users.id],
  }),
  tradingAccount: one(tradingAccounts, {
    fields: [withdrawalRequests.tradingAccountId],
    references: [tradingAccounts.id],
  }),
  processor: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id],
  }),
}));

export const performanceAnalyticsRelations = relations(performanceAnalytics, ({ one }) => ({
  tradingAccount: one(tradingAccounts, {
    fields: [performanceAnalytics.tradingAccountId],
    references: [tradingAccounts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradingAccountSchema = createInsertSchema(tradingAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralEarningSchema = createInsertSchema(referralEarnings).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertMasterCopierConnectionSchema = createInsertSchema(masterCopierConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralLinkSchema = createInsertSchema(referralLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerRequestSchema = createInsertSchema(brokerRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertProfitTransferSchema = createInsertSchema(profitTransfers).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertActionLogSchema = createInsertSchema(actionLog).omit({
  id: true,
  createdAt: true,
});

export const insertAlgorithmSchema = createInsertSchema(algorithms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  executedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  openedAt: true,
  closedAt: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertRiskParameterSchema = createInsertSchema(riskParameters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerConfigurationSchema = createInsertSchema(brokerConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true,
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertPerformanceAnalyticsSchema = createInsertSchema(performanceAnalytics).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type InsertReferralEarning = z.infer<typeof insertReferralEarningSchema>;
export type ReferralEarning = typeof referralEarnings.$inferSelect;
export type InsertMasterCopierConnection = z.infer<typeof insertMasterCopierConnectionSchema>;
export type MasterCopierConnection = typeof masterCopierConnections.$inferSelect;
export type InsertReferralLink = z.infer<typeof insertReferralLinkSchema>;
export type ReferralLink = typeof referralLinks.$inferSelect;
export type InsertBrokerRequest = z.infer<typeof insertBrokerRequestSchema>;
export type BrokerRequest = typeof brokerRequests.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertProfitTransfer = z.infer<typeof insertProfitTransferSchema>;
export type ProfitTransfer = typeof profitTransfers.$inferSelect;
export type InsertActionLog = z.infer<typeof insertActionLogSchema>;
export type ActionLog = typeof actionLog.$inferSelect;
export type InsertAlgorithm = z.infer<typeof insertAlgorithmSchema>;
export type Algorithm = typeof algorithms.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;
export type InsertRiskParameter = z.infer<typeof insertRiskParameterSchema>;
export type RiskParameter = typeof riskParameters.$inferSelect;
export type InsertBrokerConfiguration = z.infer<typeof insertBrokerConfigurationSchema>;
export type BrokerConfiguration = typeof brokerConfigurations.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertPerformanceAnalytics = z.infer<typeof insertPerformanceAnalyticsSchema>;
export type PerformanceAnalytics = typeof performanceAnalytics.$inferSelect;
