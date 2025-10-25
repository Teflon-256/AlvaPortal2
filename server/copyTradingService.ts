import { WebsocketClient } from 'bybit-api';
import { db } from './db';
import {
  tradingAccounts,
  copyTradingTasks,
  tradeMirroringLog,
  copierSettings,
  syncStatus,
  actionLog,
} from '@shared/schema';
import { eq, and, or, desc, isNotNull } from 'drizzle-orm';
import { BybitService } from './bybit';
import { encrypt, decrypt } from './crypto';

interface WebSocketConfig {
  key: string;
  secret: string;
  market: 'v5';
  testnet?: boolean;
}

export class CopyTradingService {
  private wsClients: Map<string, WebsocketClient> = new Map();
  private taskQueueInterval: NodeJS.Timeout | null = null;
  private isProcessingQueue: boolean = false;

  // Validate Bybit API key using /v5/account/info
  async validateApiKey(apiKey: string, apiSecret: string): Promise<{
    valid: boolean;
    accountInfo?: any;
    error?: string;
  }> {
    try {
      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        proxyUrl,
      });

      // Validate by fetching account info
      const accountInfo = await bybitService.getAccountInfo();
      
      if (accountInfo && accountInfo.uid) {
        return {
          valid: true,
          accountInfo: {
            uid: accountInfo.uid,
            unifiedMarginStatus: accountInfo.unifiedMarginStatus,
            dcpStatus: accountInfo.dcpStatus,
          },
        };
      }

      return {
        valid: false,
        error: 'Invalid API response',
      };
    } catch (error: any) {
      console.error('API key validation error:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate API key',
      };
    }
  }

  // Initialize WebSocket for master account
  async initializeMasterWebSocket(masterAccountId: string, apiKey: string, apiSecret: string): Promise<void> {
    try {
      const wsConfig: WebSocketConfig = {
        key: apiKey,
        secret: apiSecret,
        market: 'v5',
        testnet: false,
      };

      // Create WebSocket client
      const wsClient = new WebsocketClient(wsConfig);

      // Subscribe to order updates
      wsClient.on('update' as any, async (message: any) => {
        await this.handleWebSocketUpdate(masterAccountId, message);
      });

      wsClient.on('error' as any, (error: any) => {
        console.error(`[WS] Master account ${masterAccountId} error:`, error);
      });

      wsClient.on('reconnect' as any, () => {
        console.log(`[WS] Master account ${masterAccountId} reconnecting...`);
      });

      wsClient.on('reconnected' as any, () => {
        console.log(`[WS] Master account ${masterAccountId} reconnected`);
      });

      // Subscribe to position and execution streams
      wsClient.subscribeV5(['position.linear', 'execution.linear', 'order.linear'], 'linear');

      this.wsClients.set(masterAccountId, wsClient);
      
      console.log(`[WS] Initialized WebSocket for master account ${masterAccountId}`);
    } catch (error: any) {
      console.error(`Failed to initialize WebSocket for master ${masterAccountId}:`, error.message);
      throw error;
    }
  }

  // Handle WebSocket updates (trade detection)
  private async handleWebSocketUpdate(masterAccountId: string, message: any): Promise<void> {
    try {
      const { topic, data } = message;

      // Handle execution updates (new trades)
      if (topic?.includes('execution')) {
        for (const execution of data || []) {
          if (execution.execType === 'Trade') {
            await this.createReplicationTasks(masterAccountId, execution);
          }
        }
      }

      // Handle position updates
      if (topic?.includes('position')) {
        for (const position of data || []) {
          await this.syncPositionUpdate(masterAccountId, position);
        }
      }

      // Handle order updates
      if (topic?.includes('order')) {
        for (const order of data || []) {
          await this.handleOrderUpdate(masterAccountId, order);
        }
      }
    } catch (error: any) {
      console.error('[WS] Error handling update:', error.message);
    }
  }

  // Create replication tasks for all active copiers
  private async createReplicationTasks(masterAccountId: string, execution: any): Promise<void> {
    try {
      // Get all active copiers
      const activeCopiers = await db
        .select()
        .from(tradingAccounts)
        .where(
          and(
            eq(tradingAccounts.broker, 'bybit'),
            eq(tradingAccounts.copyStatus, 'active'),
            isNotNull(tradingAccounts.apiKeyEncrypted)
          )
        );

      const copiers = activeCopiers.filter(c => c.apiKeyEncrypted && c.apiSecretEncrypted);

      for (const copier of copiers) {
        // Get copier settings
        const settings = await db
          .select()
          .from(copierSettings)
          .where(eq(copierSettings.tradingAccountId, copier.id))
          .limit(1);

        const copierSetting = settings[0];

        // Check if symbol is allowed
        if (copierSetting) {
          if (copierSetting.blockedSymbols?.includes(execution.symbol)) {
            continue;
          }
          
          if (copierSetting.allowedSymbols && !copierSetting.allowedSymbols.includes(execution.symbol)) {
            continue;
          }
        }

        // Calculate position size based on ratio
        const masterCapital = parseFloat(execution.orderValue || '0');
        const copierCapital = parseFloat(copier.balance || '0');
        const copyMultiplier = parseFloat(copierSetting?.copyMultiplier || '1.00');
        
        const ratio = (copierCapital / masterCapital) * copyMultiplier;
        const copierQty = parseFloat(execution.execQty) * ratio;

        // Create task
        await db.insert(copyTradingTasks).values({
          masterAccountId,
          copierAccountId: copier.id,
          taskType: execution.side === 'Buy' ? 'open_position' : 'close_position',
          symbol: execution.symbol,
          side: execution.side,
          orderType: execution.orderType || 'Market',
          quantity: copierQty.toString(),
          price: execution.execPrice,
          status: 'pending',
          priority: 1,
          metadata: JSON.stringify({
            masterExecutionId: execution.execId,
            masterOrderId: execution.orderId,
          }),
        });

        console.log(`[Task Queue] Created replication task for copier ${copier.id}: ${execution.symbol} ${execution.side} ${copierQty}`);
      }
    } catch (error: any) {
      console.error('[Task Queue] Error creating replication tasks:', error.message);
    }
  }

  // Process task queue
  async processTaskQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Get pending tasks ordered by priority and creation time
      const pendingTasks = await db
        .select()
        .from(copyTradingTasks)
        .where(eq(copyTradingTasks.status, 'pending'))
        .orderBy(desc(copyTradingTasks.priority), copyTradingTasks.createdAt)
        .limit(10);

      for (const task of pendingTasks) {
        await this.executeTask(task);
      }
    } catch (error: any) {
      console.error('[Task Queue] Error processing queue:', error.message);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Execute a single task
  private async executeTask(task: any): Promise<void> {
    const startTime = Date.now();

    try {
      // Update task status to processing
      await db
        .update(copyTradingTasks)
        .set({ status: 'processing', processedAt: new Date() })
        .where(eq(copyTradingTasks.id, task.id));

      // Get copier account
      const copiers = await db
        .select()
        .from(tradingAccounts)
        .where(eq(tradingAccounts.id, task.copierAccountId))
        .limit(1);

      if (!copiers.length) {
        throw new Error('Copier account not found');
      }

      const copier = copiers[0];

      // Create Bybit service for copier
      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const copierService = BybitService.createFromEncrypted(
        copier.apiKeyEncrypted!,
        copier.apiSecretEncrypted!,
        proxyUrl
      );

      // Get copier settings for risk management
      const settings = await db
        .select()
        .from(copierSettings)
        .where(eq(copierSettings.tradingAccountId, copier.id))
        .limit(1);

      const copierSetting = settings[0];

      // Execute order with risk checks
      let orderResult: any;
      
      if (task.taskType === 'open_position') {
        // Check max position size
        if (copierSetting?.maxPositionSize) {
          const positionValue = parseFloat(task.quantity) * parseFloat(task.price || '0');
          if (positionValue > parseFloat(copierSetting.maxPositionSize)) {
            throw new Error(`Position exceeds max size: ${positionValue} > ${copierSetting.maxPositionSize}`);
          }
        }

        orderResult = await copierService.placeOrder({
          category: 'linear',
          symbol: task.symbol,
          side: task.side as 'Buy' | 'Sell',
          orderType: task.orderType as 'Market' | 'Limit',
          qty: parseFloat(task.quantity).toFixed(3),
          price: task.orderType === 'Limit' ? task.price : undefined,
        });
      } else if (task.taskType === 'close_position') {
        orderResult = await copierService.closePosition(
          'linear',
          task.symbol,
          task.side as 'Buy' | 'Sell'
        );
      }

      const executionTime = Date.now() - startTime;

      // Calculate slippage if applicable
      let slippage = null;
      if (task.price && orderResult?.result?.avgPrice) {
        const expectedPrice = parseFloat(task.price);
        const actualPrice = parseFloat(orderResult.result.avgPrice);
        slippage = ((actualPrice - expectedPrice) / expectedPrice) * 100;
      }

      // Log the mirrored trade
      await db.insert(tradeMirroringLog).values({
        masterAccountId: task.masterAccountId,
        masterTradeId: JSON.parse(task.metadata || '{}').masterExecutionId,
        copierAccountId: task.copierAccountId,
        copierTradeId: orderResult?.result?.orderId,
        symbol: task.symbol,
        side: task.side,
        orderType: task.orderType,
        masterQuantity: '0', // Would need to fetch from master
        copierQuantity: task.quantity,
        masterPrice: task.price || '0',
        copierPrice: orderResult?.result?.avgPrice || '0',
        slippage: slippage?.toString(),
        status: 'executed',
        executionTime,
        metadata: JSON.stringify(orderResult),
        executedAt: new Date(),
      });

      // Update task as completed
      await db
        .update(copyTradingTasks)
        .set({ 
          status: 'completed', 
          completedAt: new Date(),
          metadata: JSON.stringify({ ...JSON.parse(task.metadata || '{}'), orderResult }),
        })
        .where(eq(copyTradingTasks.id, task.id));

      // Log action
      await db.insert(actionLog).values({
        userId: copier.userId,
        action: 'COPY_TRADE_EXECUTED',
        description: `Trade mirrored: ${task.symbol} ${task.side} ${task.quantity} (${executionTime}ms)`,
        metadata: JSON.stringify({ taskId: task.id, slippage }),
      });

      console.log(`[Task Exec] Completed task ${task.id}: ${task.symbol} ${task.side} (${executionTime}ms, slippage: ${slippage?.toFixed(2)}%)`);
    } catch (error: any) {
      console.error(`[Task Exec] Failed task ${task.id}:`, error.message);

      // Update retry count
      const newRetryCount = task.retryCount + 1;

      if (newRetryCount >= task.maxRetries) {
        // Mark as failed
        await db
          .update(copyTradingTasks)
          .set({ 
            status: 'failed', 
            errorMessage: error.message,
            retryCount: newRetryCount,
          })
          .where(eq(copyTradingTasks.id, task.id));

        // Log failure
        await db.insert(tradeMirroringLog).values({
          masterAccountId: task.masterAccountId,
          copierAccountId: task.copierAccountId,
          symbol: task.symbol,
          side: task.side,
          orderType: task.orderType,
          masterQuantity: '0',
          copierQuantity: task.quantity,
          status: 'failed',
          errorMessage: error.message,
          executionTime: Date.now() - startTime,
        });
      } else {
        // Retry
        await db
          .update(copyTradingTasks)
          .set({ 
            status: 'pending', 
            retryCount: newRetryCount,
            errorMessage: error.message,
          })
          .where(eq(copyTradingTasks.id, task.id));
      }
    }
  }

  // Sync position update
  private async syncPositionUpdate(masterAccountId: string, position: any): Promise<void> {
    // This can be used for position tracking and monitoring
    console.log(`[Position Update] Master ${masterAccountId}: ${position.symbol} ${position.side} ${position.size}`);
  }

  // Handle order update
  private async handleOrderUpdate(masterAccountId: string, order: any): Promise<void> {
    // Handle order cancellations, modifications, etc.
    if (order.orderStatus === 'Cancelled') {
      // Could trigger copier order cancellations
      console.log(`[Order Update] Master ${masterAccountId} cancelled: ${order.symbol}`);
    }
  }

  // Start task queue processor
  startTaskQueue(): void {
    if (this.taskQueueInterval) {
      return;
    }

    // Process queue every 1 second
    this.taskQueueInterval = setInterval(() => {
      this.processTaskQueue().catch(err => {
        console.error('[Task Queue] Processing error:', err);
      });
    }, 1000);

    console.log('[Task Queue] Started processing queue every 1s');
  }

  // Stop task queue processor
  stopTaskQueue(): void {
    if (this.taskQueueInterval) {
      clearInterval(this.taskQueueInterval);
      this.taskQueueInterval = null;
      console.log('[Task Queue] Stopped');
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket(masterAccountId: string): void {
    const wsClient = this.wsClients.get(masterAccountId);
    if (wsClient) {
      try {
        (wsClient as any).close?.();
      } catch (e) {
        // Ignore close errors
      }
      this.wsClients.delete(masterAccountId);
      console.log(`[WS] Disconnected master account ${masterAccountId}`);
    }
  }

  // Disconnect all WebSockets
  disconnectAll(): void {
    const entries = Array.from(this.wsClients.entries());
    for (const [accountId, wsClient] of entries) {
      try {
        (wsClient as any).close?.();
      } catch (e) {
        // Ignore close errors
      }
      console.log(`[WS] Disconnected ${accountId}`);
    }
    this.wsClients.clear();
  }

  // Update sync status
  async updateSyncStatus(
    tradingAccountId: string, 
    data: { 
      websocketConnected?: boolean; 
      syncStatus?: string; 
      lastError?: string;
    }
  ): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(syncStatus)
        .where(eq(syncStatus.tradingAccountId, tradingAccountId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(syncStatus)
          .set({ 
            ...data, 
            lastHeartbeat: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(syncStatus.tradingAccountId, tradingAccountId));
      } else {
        await db.insert(syncStatus).values({
          tradingAccountId,
          syncMethod: 'websocket',
          lastHeartbeat: new Date(),
          ...data,
        });
      }
    } catch (error: any) {
      console.error('Error updating sync status:', error.message);
    }
  }
}

export const copyTradingService = new CopyTradingService();
