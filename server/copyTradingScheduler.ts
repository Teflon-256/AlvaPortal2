import cron from 'node-cron';
import { db } from './db';
import { tradingAccounts, adminSettings, profitTransfers, actionLog } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { BybitService, CopyTradingEngine, ProfitSplitService } from './bybit';

export class CopyTradingScheduler {
  private isRunning: boolean = false;
  private syncIntervalMs: number = 30000; // 30 seconds for position sync
  private profitSplitCron: string = '0 0 * * 0'; // Every Sunday at midnight

  async getMasterAccount() {
    const masterConfig = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, 'master_bybit_config'))
      .limit(1);

    if (!masterConfig.length) {
      throw new Error('Master account not configured');
    }

    const config = JSON.parse(masterConfig[0].settingValue || '{}');
    return {
      apiKey: config.api_key,
      apiSecret: config.api_secret,
      transferUserId: config.transfer_user_id,
    };
  }

  async getPlatformTransferUserId(): Promise<number> {
    const setting = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, 'profit_transfer_user_id'))
      .limit(1);

    if (!setting.length) {
      throw new Error('Platform transfer user ID not configured');
    }

    return parseInt(setting[0].settingValue || '0');
  }

  async getActiveCopiers() {
    const copiers = await db
      .select()
      .from(tradingAccounts)
      .where(
        and(
          eq(tradingAccounts.broker, 'bybit'),
          eq(tradingAccounts.copyStatus, 'active')
        )
      );

    return copiers.filter(c => c.apiKeyEncrypted && c.apiSecretEncrypted);
  }

  async syncPositions() {
    if (this.isRunning) {
      console.log('Copy trading sync already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      const masterAccount = await this.getMasterAccount();
      const masterService = new BybitService({
        apiKey: masterAccount.apiKey,
        apiSecret: masterAccount.apiSecret,
      });

      const masterBalance = await masterService.getWalletBalance('UNIFIED');
      const masterCapital = masterBalance.reduce(
        (sum, b) => sum + parseFloat(b.usdValue || '0'),
        0
      );

      const copyEngine = new CopyTradingEngine(masterService, masterCapital);
      const activeCopiers = await this.getActiveCopiers();

      console.log(`Syncing ${activeCopiers.length} active copiers...`);

      for (const copier of activeCopiers) {
        try {
          const copierService = BybitService.createFromEncrypted(
            copier.apiKeyEncrypted!,
            copier.apiSecretEncrypted!
          );

          const copierCapital = parseFloat(copier.balance || '0');
          const maxRisk = parseFloat(copier.maxRiskPercentage || '2.00');

          const results = await copyEngine.syncCopierPositions(
            copierService,
            copierCapital,
            maxRisk
          );

          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'COPY_TRADING_SYNC',
            description: `Synced positions: ${results.opened} opened, ${results.closed} closed. Errors: ${results.errors.length}`,
            metadata: JSON.stringify(results),
          });

          console.log(`Copier ${copier.id}: ${results.opened} opened, ${results.closed} closed`);

          if (results.errors.length > 0) {
            console.error(`Copier ${copier.id} errors:`, results.errors);
          }
        } catch (error: any) {
          console.error(`Failed to sync copier ${copier.id}:`, error.message);
          
          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'COPY_TRADING_ERROR',
            description: `Failed to sync positions: ${error.message}`,
            metadata: JSON.stringify({ error: error.message }),
          });
        }
      }

      console.log('Copy trading sync completed successfully');
    } catch (error: any) {
      console.error('Copy trading sync error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  async processWeeklyProfitSplits() {
    try {
      console.log('Processing weekly profit splits...');
      
      const platformUserId = await this.getPlatformTransferUserId();
      const activeCopiers = await this.getActiveCopiers();
      const profitService = new ProfitSplitService();

      for (const copier of activeCopiers) {
        try {
          const copierService = BybitService.createFromEncrypted(
            copier.apiKeyEncrypted!,
            copier.apiSecretEncrypted!
          );

          const performance = await copierService.getPerformanceStats();
          const result = await profitService.processWeeklyProfitSplit(
            copierService,
            performance,
            platformUserId
          );

          await db.insert(profitTransfers).values({
            userId: copier.userId,
            tradingAccountId: copier.id,
            totalProfit: result.split.totalProfit.toString(),
            userShare: result.split.userShare.toString(),
            platformShare: result.split.platformShare.toString(),
            transferAmount: result.split.platformShare.toString(),
            transferType: 'weekly',
            transferStatus: result.transfer ? 'completed' : 'skipped',
          });

          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'PROFIT_SPLIT',
            description: `Weekly profit split: $${result.split.platformShare.toFixed(2)} transferred`,
            metadata: JSON.stringify(result.split),
          });

          console.log(`Copier ${copier.id}: Profit split completed - $${result.split.platformShare.toFixed(2)}`);
        } catch (error: any) {
          console.error(`Failed to process profit split for copier ${copier.id}:`, error.message);
          
          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'PROFIT_SPLIT_ERROR',
            description: `Failed to process profit split: ${error.message}`,
            metadata: JSON.stringify({ error: error.message }),
          });
        }
      }

      console.log('Weekly profit splits completed');
    } catch (error: any) {
      console.error('Weekly profit split error:', error.message);
    }
  }

  async handleCopierStatusChange(copierId: string, newStatus: string) {
    if (newStatus === 'inactive') {
      try {
        const copier = await db
          .select()
          .from(tradingAccounts)
          .where(eq(tradingAccounts.id, copierId))
          .limit(1);

        if (!copier.length || !copier[0].apiKeyEncrypted || !copier[0].apiSecretEncrypted) {
          return;
        }

        const copierService = BybitService.createFromEncrypted(
          copier[0].apiKeyEncrypted,
          copier[0].apiSecretEncrypted
        );

        const masterAccount = await this.getMasterAccount();
        const masterService = new BybitService({
          apiKey: masterAccount.apiKey,
          apiSecret: masterAccount.apiSecret,
        });

        const masterBalance = await masterService.getWalletBalance('UNIFIED');
        const masterCapital = masterBalance.reduce(
          (sum, b) => sum + parseFloat(b.usdValue || '0'),
          0
        );

        const copyEngine = new CopyTradingEngine(masterService, masterCapital);
        await copyEngine.closeAllCopierPositions(copierService);

        const platformUserId = await this.getPlatformTransferUserId();
        const performance = await copierService.getPerformanceStats();
        const profitService = new ProfitSplitService();
        
        const result = await profitService.processWeeklyProfitSplit(
          copierService,
          performance,
          platformUserId
        );

        if (result.transfer) {
          await db.insert(profitTransfers).values({
            userId: copier[0].userId,
            tradingAccountId: copier[0].id,
            totalProfit: result.split.totalProfit.toString(),
            userShare: result.split.userShare.toString(),
            platformShare: result.split.platformShare.toString(),
            transferAmount: result.split.platformShare.toString(),
            transferType: 'withdrawal',
            transferStatus: 'completed',
          });
        }

        await db.insert(actionLog).values({
          userId: copier[0].userId,
          action: 'COPY_TRADING_DISABLED',
          description: `Copy trading disabled. All positions closed. Profit split: $${result.split.platformShare.toFixed(2)}`,
          metadata: JSON.stringify(result),
        });

        console.log(`Copier ${copierId} disabled: positions closed, profit split completed`);
      } catch (error: any) {
        console.error(`Failed to handle copier status change for ${copierId}:`, error.message);
      }
    }
  }

  start() {
    console.log('Starting copy trading scheduler...');

    const positionSyncInterval = setInterval(() => {
      this.syncPositions().catch(err => {
        console.error('Position sync error:', err);
      });
    }, this.syncIntervalMs);

    const profitSplitJob = cron.schedule(this.profitSplitCron, () => {
      this.processWeeklyProfitSplits().catch(err => {
        console.error('Profit split error:', err);
      });
    });

    console.log(`✓ Position sync running every ${this.syncIntervalMs / 1000}s`);
    console.log(`✓ Profit splits scheduled: ${this.profitSplitCron}`);

    return {
      positionSyncInterval,
      profitSplitJob,
    };
  }

  async stop(jobs: { positionSyncInterval: NodeJS.Timeout; profitSplitJob: any }) {
    console.log('Stopping copy trading scheduler...');
    clearInterval(jobs.positionSyncInterval);
    jobs.profitSplitJob.stop();
    console.log('Copy trading scheduler stopped');
  }
}

export const copyTradingScheduler = new CopyTradingScheduler();
