import { WebsocketClient } from 'bybit-api';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { db } from './db';
import { adminSettings, tradingAccounts, actionLog } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { BybitService, CopyTradingEngine } from './bybit';
import type { Server as SocketIOServer } from 'socket.io';

interface MasterPosition {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  leverage: string;
  unrealizedPnl: string;
}

interface MasterExecution {
  symbol: string;
  orderId: string;
  side: string;
  execQty: string;
  execPrice: string;
  execTime: string;
}

export class BybitWebSocketService {
  private wsClient: WebsocketClient | null = null;
  private isConnected = false;
  private io: SocketIOServer | null = null;
  private masterPositions: Map<string, MasterPosition> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(io?: SocketIOServer) {
    if (io) {
      this.io = io;
    }
  }

  setSocketIO(io: SocketIOServer) {
    this.io = io;
  }

  async getMasterAccountConfig() {
    const masterConfig = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, 'master_bybit_config'))
      .limit(1);

    if (!masterConfig.length) {
      return null;
    }

    const config = JSON.parse(masterConfig[0].settingValue || '{}');
    return {
      apiKey: config.api_key,
      apiSecret: config.api_secret,
      transferUserId: config.transfer_user_id,
    };
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

  async connectToMasterAccount() {
    try {
      const masterAccount = await this.getMasterAccountConfig();
      
      if (!masterAccount?.apiKey || !masterAccount?.apiSecret) {
        console.log('⚠️  No master account configured - WebSocket not started');
        return;
      }

      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const wsOptions: any = {
        key: masterAccount.apiKey,
        secret: masterAccount.apiSecret,
        market: 'v5',
        testnet: false,
      };

      // Add proxy support for WebSocket
      if (proxyUrl) {
        console.log('🔄 Configuring WebSocket with proxy');
        const proxyAgent = new HttpsProxyAgent(proxyUrl);
        wsOptions.wsClientOptions = { agent: proxyAgent };
        wsOptions.requestOptions = {
          httpsAgent: proxyAgent,
          httpAgent: proxyAgent,
        };
      }

      this.wsClient = new WebsocketClient(wsOptions);

      // Connection opened
      this.wsClient.on('open', ({ wsKey }) => {
        console.log(`✅ WebSocket connected to master account: ${wsKey}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to private channels for real-time updates
        this.wsClient!.subscribe([
          'position',     // Position updates
          'execution',    // Trade executions
          'order',        // Order updates
        ]);

        // Broadcast connection status to frontend
        this.broadcastToFrontend('copy-trading-status', {
          status: 'connected',
          message: 'Master account WebSocket connected'
        });
      });

      // Receive real-time updates
      this.wsClient.on('update', async (data) => {
        try {
          if (data.topic === 'position') {
            await this.handlePositionUpdate(data);
          } else if (data.topic === 'execution') {
            await this.handleExecutionUpdate(data);
          } else if (data.topic === 'order') {
            await this.handleOrderUpdate(data);
          }
        } catch (error) {
          console.error('Error handling WebSocket update:', error);
        }
      });

      // Handle reconnection
      this.wsClient.on('reconnect', ({ wsKey }) => {
        console.log(`🔄 Reconnecting to master account: ${wsKey}`);
        this.isConnected = false;
        this.reconnectAttempts++;

        this.broadcastToFrontend('copy-trading-status', {
          status: 'reconnecting',
          message: 'Reconnecting to master account...',
          attempt: this.reconnectAttempts
        });
      });

      this.wsClient.on('reconnected', ({ wsKey }) => {
        console.log(`✅ Reconnected to master account: ${wsKey}`);
        this.isConnected = true;

        this.broadcastToFrontend('copy-trading-status', {
          status: 'connected',
          message: 'Reconnected to master account'
        });
      });

      // Handle errors
      this.wsClient.on('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
        
        this.broadcastToFrontend('copy-trading-status', {
          status: 'error',
          message: 'WebSocket error occurred',
          error: error?.message || 'Unknown error'
        });
      });

      console.log('🚀 WebSocket service started');
    } catch (error: any) {
      console.error('Failed to connect WebSocket:', error.message);
      
      // Retry connection after delay
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.connectToMasterAccount();
        }, 5000);
      }
    }
  }

  private async handlePositionUpdate(data: any) {
    const positions = data.data || [];
    
    for (const position of positions) {
      const positionKey = position.symbol;
      const currentSize = parseFloat(position.size || '0');
      const previousPosition = this.masterPositions.get(positionKey);
      const previousSize = previousPosition ? parseFloat(previousPosition.size) : 0;

      // Update stored position
      if (currentSize > 0) {
        this.masterPositions.set(positionKey, {
          symbol: position.symbol,
          side: position.side,
          size: position.size,
          entryPrice: position.avgPrice || position.entryPrice,
          leverage: position.leverage,
          unrealizedPnl: position.unrealisedPnl || '0',
        });
      } else {
        // Position closed
        this.masterPositions.delete(positionKey);
      }

      // Detect position change and replicate
      if (currentSize !== previousSize) {
        console.log(`📊 Position changed: ${position.symbol} ${previousSize} → ${currentSize}`);
        
        if (currentSize > previousSize) {
          // Position increased or opened
          await this.replicatePositionOpen(position);
        } else if (currentSize < previousSize) {
          // Position decreased or closed
          await this.replicatePositionClose(position, previousSize - currentSize);
        }

        // Broadcast to frontend
        this.broadcastToFrontend('position-update', {
          symbol: position.symbol,
          side: position.side,
          size: position.size,
          previousSize: previousSize.toString(),
          action: currentSize > previousSize ? 'opened' : 'closed'
        });
      }
    }
  }

  private async handleExecutionUpdate(data: any) {
    const executions = data.data || [];
    
    for (const execution of executions) {
      console.log(`✅ Trade executed: ${execution.symbol} ${execution.side} ${execution.execQty} @ ${execution.execPrice}`);
      
      // Broadcast execution to frontend
      this.broadcastToFrontend('trade-executed', {
        symbol: execution.symbol,
        side: execution.side,
        quantity: execution.execQty,
        price: execution.execPrice,
        time: execution.execTime,
        orderId: execution.orderId
      });
    }
  }

  private async handleOrderUpdate(data: any) {
    const orders = data.data || [];
    
    for (const order of orders) {
      console.log(`📝 Order update: ${order.symbol} ${order.orderStatus}`);
      
      // Broadcast order status to frontend
      this.broadcastToFrontend('order-update', {
        symbol: order.symbol,
        orderId: order.orderId,
        status: order.orderStatus,
        side: order.side,
        quantity: order.qty
      });
    }
  }

  private async replicatePositionOpen(masterPosition: any) {
    try {
      const activeCopiers = await this.getActiveCopiers();
      
      if (activeCopiers.length === 0) {
        console.log('No active copiers to replicate to');
        return;
      }

      console.log(`🔄 Replicating position to ${activeCopiers.length} copiers: ${masterPosition.symbol} ${masterPosition.side}`);

      // Get master account for capital calculation
      const masterAccount = await this.getMasterAccountConfig();
      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      const masterService = new BybitService({
        apiKey: masterAccount!.apiKey,
        apiSecret: masterAccount!.apiSecret,
        proxyUrl,
      });

      const masterBalance = await masterService.getWalletBalance('UNIFIED');
      const masterCapital = masterBalance.reduce(
        (sum, b) => sum + parseFloat(b.usdValue || '0'),
        0
      );

      const copyEngine = new CopyTradingEngine(masterService, masterCapital);

      for (const copier of activeCopiers) {
        try {
          const copierService = BybitService.createFromEncrypted(
            copier.apiKeyEncrypted!,
            copier.apiSecretEncrypted!,
            proxyUrl
          );

          const copierCapital = parseFloat(copier.tradingCapital || copier.balance || '0');
          const maxRisk = parseFloat(copier.maxRiskPercentage || '2.00');

          // Replicate the position
          await copyEngine.syncCopierPositions(
            copierService,
            copierCapital,
            maxRisk
          );

          console.log(`✅ Replicated to copier ${copier.id}`);

          // Log action
          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'COPY_TRADE_OPEN',
            description: `Opened ${masterPosition.symbol} ${masterPosition.side} via WebSocket`,
            metadata: JSON.stringify({
              symbol: masterPosition.symbol,
              side: masterPosition.side,
              size: masterPosition.size
            }),
          });

        } catch (error: any) {
          console.error(`Failed to replicate to copier ${copier.id}:`, error.message);
          
          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'COPY_TRADE_ERROR',
            description: `Failed to replicate position: ${error.message}`,
            metadata: JSON.stringify({ error: error.message }),
          });
        }
      }

      // Broadcast success to frontend
      this.broadcastToFrontend('replication-complete', {
        symbol: masterPosition.symbol,
        copiersCount: activeCopiers.length,
        action: 'open'
      });

    } catch (error: any) {
      console.error('Error replicating position open:', error.message);
    }
  }

  private async replicatePositionClose(masterPosition: any, sizeReduction: number) {
    try {
      const activeCopiers = await this.getActiveCopiers();
      
      console.log(`🔄 Replicating position close to ${activeCopiers.length} copiers`);

      const proxyUrl = process.env.BYBIT_PROXY_URL || '';
      
      for (const copier of activeCopiers) {
        try {
          const copierService = BybitService.createFromEncrypted(
            copier.apiKeyEncrypted!,
            copier.apiSecretEncrypted!,
            proxyUrl
          );

          // Close or reduce position for copier
          const copierPositions = await copierService.getPositions('linear', masterPosition.symbol);
          
          for (const pos of copierPositions) {
            if (parseFloat(pos.size) > 0) {
              // Close the position using the closePosition method
              await copierService.closePosition(
                'linear',
                pos.symbol,
                pos.side as 'Buy' | 'Sell'
              );

              console.log(`✅ Closed position for copier ${copier.id}`);
            }
          }

          await db.insert(actionLog).values({
            userId: copier.userId,
            action: 'COPY_TRADE_CLOSE',
            description: `Closed ${masterPosition.symbol} position via WebSocket`,
            metadata: JSON.stringify({
              symbol: masterPosition.symbol,
              sizeReduction: sizeReduction.toString()
            }),
          });

        } catch (error: any) {
          console.error(`Failed to close position for copier ${copier.id}:`, error.message);
        }
      }

      this.broadcastToFrontend('replication-complete', {
        symbol: masterPosition.symbol,
        copiersCount: activeCopiers.length,
        action: 'close'
      });

    } catch (error: any) {
      console.error('Error replicating position close:', error.message);
    }
  }

  private broadcastToFrontend(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      activePositions: this.masterPositions.size
    };
  }

  disconnect() {
    if (this.wsClient) {
      this.wsClient.closeAll();
      this.isConnected = false;
      this.masterPositions.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }
}

// Singleton instance
export const masterWebSocket = new BybitWebSocketService();
