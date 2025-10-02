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
  profileImageUrl: varchar("profile_image_url"),
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
