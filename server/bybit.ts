import { RestClientV5 } from 'bybit-api';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { decrypt } from './crypto';

export interface BybitCredentials {
  apiKey: string;
  apiSecret: string;
  proxyUrl?: string;
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
    const clientConfig: any = {
      key: credentials.apiKey,
      secret: credentials.apiSecret,
      testnet: false,
    };

    const requestOptions: any = {};

    if (credentials.proxyUrl) {
      console.log('🔄 Configuring Bybit with proxy:', credentials.proxyUrl.replace(/:[^:@]+@/, ':****@'));
      const proxyAgent = new HttpsProxyAgent(credentials.proxyUrl);
      requestOptions.httpsAgent = proxyAgent;
      requestOptions.httpAgent = proxyAgent;
    }

    this.client = new RestClientV5(clientConfig, requestOptions);
  }

  static createFromEncrypted(encryptedKey: string, encryptedSecret: string, proxyUrl?: string): BybitService {
    return new BybitService({
      apiKey: decrypt(encryptedKey),
      apiSecret: decrypt(encryptedSecret),
      proxyUrl,
    });
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.client.getAccountInfo();
      return response.result;
    } catch (error: any) {
      console.error('Bybit getAccountInfo error:', error.message);
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
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

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.client.getWalletBalance({ accountType: 'UNIFIED' });
      console.log('Bybit testConnection response:', JSON.stringify(response, null, 2));
      return { success: true };
    } catch (error: any) {
      console.error('Bybit testConnection error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        body: error.body,
        response: error.response
      });
      return { 
        success: false, 
        error: error.message || 'Connection failed'
      };
    }
  }
}

export interface CopierAccount {
  id: string;
  userId: string;
  apiKey: string;
  apiSecret: string;
  tradingCapital: number;
  maxRiskPercentage: number;
  copyStatus: string;
}

export interface MasterPosition {
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  leverage: string;
  positionValue: number;
}

export class CopyTradingEngine {
  private masterService: BybitService;
  private masterCapital: number;

  constructor(masterService: BybitService, masterCapital: number) {
    this.masterService = masterService;
    this.masterCapital = masterCapital;
  }

  async getMasterPositions(): Promise<MasterPosition[]> {
    const positions = await this.masterService.getPositions('linear');
    return positions.map(pos => ({
      symbol: pos.symbol,
      side: pos.side,
      size: parseFloat(pos.size),
      entryPrice: parseFloat(pos.entryPrice),
      leverage: pos.leverage,
      positionValue: parseFloat(pos.positionValue),
    }));
  }

  calculateCopierPositionSize(
    masterPositionSize: number,
    masterCapital: number,
    copierCapital: number
  ): number {
    const ratio = copierCapital / masterCapital;
    return masterPositionSize * ratio;
  }

  async replicatePosition(
    copierService: BybitService,
    masterPosition: MasterPosition,
    copierCapital: number,
    maxRiskPercentage: number
  ): Promise<any> {
    const copierSize = this.calculateCopierPositionSize(
      masterPosition.size,
      this.masterCapital,
      copierCapital
    );

    const positionValue = copierSize * masterPosition.entryPrice;
    const maxPositionValue = copierCapital * (maxRiskPercentage / 100);

    if (positionValue > maxPositionValue) {
      throw new Error(`Position exceeds max risk: ${positionValue} > ${maxPositionValue}`);
    }

    return await copierService.placeOrder({
      category: 'linear',
      symbol: masterPosition.symbol,
      side: masterPosition.side as 'Buy' | 'Sell',
      orderType: 'Market',
      qty: copierSize.toFixed(3),
    });
  }

  async closeAllCopierPositions(copierService: BybitService): Promise<void> {
    const positions = await copierService.getPositions('linear');
    
    for (const position of positions) {
      await copierService.closePosition(
        'linear',
        position.symbol,
        position.side as 'Buy' | 'Sell'
      );
    }
  }

  async syncCopierPositions(
    copierService: BybitService,
    copierCapital: number,
    maxRiskPercentage: number
  ): Promise<{ opened: number; closed: number; errors: string[] }> {
    const masterPositions = await this.getMasterPositions();
    const copierPositions = await copierService.getPositions('linear');

    const results = { opened: 0, closed: 0, errors: [] as string[] };

    const masterSymbols = new Set(masterPositions.map(p => p.symbol));
    const copierSymbols = new Set(copierPositions.map(p => p.symbol));

    for (const masterPos of masterPositions) {
      if (!copierSymbols.has(masterPos.symbol)) {
        try {
          await this.replicatePosition(
            copierService,
            masterPos,
            copierCapital,
            maxRiskPercentage
          );
          results.opened++;
        } catch (error: any) {
          results.errors.push(`Failed to open ${masterPos.symbol}: ${error.message}`);
        }
      }
    }

    for (const copierPos of copierPositions) {
      if (!masterSymbols.has(copierPos.symbol)) {
        try {
          await copierService.closePosition(
            'linear',
            copierPos.symbol,
            copierPos.side as 'Buy' | 'Sell'
          );
          results.closed++;
        } catch (error: any) {
          results.errors.push(`Failed to close ${copierPos.symbol}: ${error.message}`);
        }
      }
    }

    return results;
  }
}

export interface ProfitSplit {
  totalProfit: number;
  userShare: number;
  platformShare: number;
}

export class ProfitSplitService {
  async calculateProfitSplit(
    realizedPnl: number,
    unrealizedPnl: number,
    splitPercentage: number = 50
  ): Promise<ProfitSplit> {
    const totalProfit = realizedPnl + unrealizedPnl;
    
    if (totalProfit <= 0) {
      return {
        totalProfit: 0,
        userShare: 0,
        platformShare: 0,
      };
    }

    const platformShare = (totalProfit * splitPercentage) / 100;
    const userShare = totalProfit - platformShare;

    return {
      totalProfit,
      userShare,
      platformShare,
    };
  }

  async executeProfitTransfer(
    copierService: BybitService,
    platformUserId: number,
    amount: number,
    coin: string = 'USDT'
  ): Promise<any> {
    const transferId = crypto.randomUUID();
    
    return await copierService.universalTransfer({
      transferId,
      coin,
      amount: amount.toFixed(2),
      fromMemberId: 0, 
      toMemberId: platformUserId,
      fromAccountType: 'UNIFIED',
      toAccountType: 'UNIFIED',
    });
  }

  async processWeeklyProfitSplit(
    copierService: BybitService,
    copierPerformance: BybitPerformance,
    platformUserId: number
  ): Promise<{ split: ProfitSplit; transfer?: any }> {
    const split = await this.calculateProfitSplit(
      parseFloat(copierPerformance.totalRealizedPnl),
      parseFloat(copierPerformance.totalUnrealizedPnl),
      50
    );

    if (split.platformShare > 0) {
      const transfer = await this.executeProfitTransfer(
        copierService,
        platformUserId,
        split.platformShare,
        'USDT'
      );
      
      return { split, transfer };
    }

    return { split };
  }
}
