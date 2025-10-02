import { RestClientV5 } from 'bybit-api';
import { decrypt } from './crypto';

export interface BybitCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface BybitBalance {
  coin: string;
  walletBalance: string;
  availableBalance: string;
  usdValue: string;
}

export interface BybitPosition {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  leverage: string;
  unrealizedPnl: string;
  positionValue: string;
}

export interface BybitTransaction {
  id: string;
  coin: string;
  amount: string;
  type: string;
  status: string;
  timestamp: number;
}

export interface BybitPerformance {
  totalBalance: string;
  totalEquity: string;
  totalUnrealizedPnl: string;
  totalRealizedPnl: string;
  roi: string;
}

export class BybitService {
  private client: RestClientV5;
  
  constructor(credentials: BybitCredentials) {
    this.client = new RestClientV5({
      key: credentials.apiKey,
      secret: credentials.apiSecret,
      testnet: false,
    });
  }

  static createFromEncrypted(encryptedKey: string, encryptedSecret: string): BybitService {
    return new BybitService({
      apiKey: decrypt(encryptedKey),
      apiSecret: decrypt(encryptedSecret),
    });
  }

  async getWalletBalance(accountType: 'UNIFIED' | 'CONTRACT' = 'UNIFIED'): Promise<BybitBalance[]> {
    try {
      const response = await this.client.getWalletBalance({ accountType });
      
      if (!response.result?.list?.[0]?.coin) {
        return [];
      }

      return response.result.list[0].coin.map((coin: any) => ({
        coin: coin.coin,
        walletBalance: coin.walletBalance,
        availableBalance: coin.availableToWithdraw,
        usdValue: coin.usdValue || '0',
      }));
    } catch (error: any) {
      console.error('Bybit getWalletBalance error:', error.message);
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }

  async getPositions(category: 'linear' | 'inverse' | 'spot' = 'linear', symbol?: string): Promise<BybitPosition[]> {
    try {
      const params: any = { category };
      if (symbol) {
        params.symbol = symbol;
      }

      const response = await this.client.getPositionInfo(params);
      
      if (!response.result?.list) {
        return [];
      }

      return response.result.list
        .filter((pos: any) => parseFloat(pos.size) > 0)
        .map((pos: any) => ({
          symbol: pos.symbol,
          side: pos.side,
          size: pos.size,
          entryPrice: pos.avgPrice,
          markPrice: pos.markPrice,
          leverage: pos.leverage,
          unrealizedPnl: pos.unrealisedPnl,
          positionValue: pos.positionValue,
        }));
    } catch (error: any) {
      console.error('Bybit getPositions error:', error.message);
      throw new Error(`Failed to fetch positions: ${error.message}`);
    }
  }

  async getTransactionHistory(
    accountType: 'UNIFIED' | 'CONTRACT' = 'UNIFIED',
    limit: number = 50
  ): Promise<BybitTransaction[]> {
    try {
      const response = await this.client.getTransactionLog({
        accountType,
        limit,
      });

      if (!response.result?.list) {
        return [];
      }

      return response.result.list.map((tx: any) => ({
        id: tx.transactionId || tx.id,
        coin: tx.coin,
        amount: tx.cashFlow,
        type: tx.type,
        status: tx.tradeMode || 'completed',
        timestamp: parseInt(tx.transactionTime),
      }));
    } catch (error: any) {
      console.error('Bybit getTransactionHistory error:', error.message);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  async getPerformanceStats(): Promise<BybitPerformance> {
    try {
      const balances = await this.getWalletBalance('UNIFIED');
      const positions = await this.getPositions('linear');

      const totalBalance = balances.reduce(
        (sum, b) => sum + parseFloat(b.usdValue || '0'),
        0
      );

      const totalUnrealizedPnl = positions.reduce(
        (sum, p) => sum + parseFloat(p.unrealizedPnl || '0'),
        0
      );

      const totalEquity = totalBalance + totalUnrealizedPnl;

      const transactions = await this.getTransactionHistory('UNIFIED', 100);
      const totalRealizedPnl = transactions
        .filter(tx => tx.type.toLowerCase().includes('realized'))
        .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

      const roi = totalBalance > 0 
        ? ((totalUnrealizedPnl + totalRealizedPnl) / totalBalance * 100).toFixed(2)
        : '0.00';

      return {
        totalBalance: totalBalance.toFixed(2),
        totalEquity: totalEquity.toFixed(2),
        totalUnrealizedPnl: totalUnrealizedPnl.toFixed(2),
        totalRealizedPnl: totalRealizedPnl.toFixed(2),
        roi: roi,
      };
    } catch (error: any) {
      console.error('Bybit getPerformanceStats error:', error.message);
      throw new Error(`Failed to fetch performance stats: ${error.message}`);
    }
  }

  async placeOrder(params: {
    category: 'linear' | 'spot';
    symbol: string;
    side: 'Buy' | 'Sell';
    orderType: 'Market' | 'Limit';
    qty: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'PostOnly';
  }) {
    try {
      const response = await this.client.submitOrder(params as any);
      return response.result;
    } catch (error: any) {
      console.error('Bybit placeOrder error:', error.message);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  async closePosition(category: 'linear' | 'spot', symbol: string, side: 'Buy' | 'Sell') {
    try {
      const positions = await this.getPositions(category, symbol);
      const position = positions.find(p => p.symbol === symbol);
      
      if (!position) {
        throw new Error('Position not found');
      }

      const closeSide = side === 'Buy' ? 'Sell' : 'Buy';
      
      return await this.placeOrder({
        category,
        symbol,
        side: closeSide,
        orderType: 'Market',
        qty: position.size,
      });
    } catch (error: any) {
      console.error('Bybit closePosition error:', error.message);
      throw new Error(`Failed to close position: ${error.message}`);
    }
  }

  async internalTransfer(params: {
    coin: string;
    amount: string;
    fromAccountType: string;
    toAccountType: string;
  }) {
    try {
      const transferId = crypto.randomUUID();
      const response = await this.client.createInternalTransfer(
        transferId,
        params.coin,
        params.amount,
        params.fromAccountType as any,
        params.toAccountType as any
      );
      return response.result;
    } catch (error: any) {
      console.error('Bybit internalTransfer error:', error.message);
      throw new Error(`Failed to transfer: ${error.message}`);
    }
  }

  async universalTransfer(params: {
    transferId: string;
    coin: string;
    amount: string;
    fromMemberId: number;
    toMemberId: number;
    fromAccountType: string;
    toAccountType: string;
  }) {
    try {
      const response = await this.client.createUniversalTransfer(params as any);
      return response.result;
    } catch (error: any) {
      console.error('Bybit universalTransfer error:', error.message);
      throw new Error(`Failed to universal transfer: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.getWalletBalance({ accountType: 'UNIFIED' });
      return true;
    } catch (error) {
      return false;
    }
  }
}
