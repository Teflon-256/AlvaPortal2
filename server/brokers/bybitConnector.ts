import axios from 'axios';
import crypto from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';

export interface BybitConfig {
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
  proxyUrl?: string;
}

export interface BybitPosition {
  symbol: string;
  side: 'Buy' | 'Sell';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealisedPnl: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface BybitOrder {
  orderId: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  orderType: 'Market' | 'Limit';
  qty: number;
  price?: number;
  status: string;
}

export class BybitConnector {
  private config: BybitConfig;
  private baseUrl: string;
  private proxyAgent: HttpsProxyAgent<string> | undefined;

  constructor(config: BybitConfig) {
    this.config = config;
    this.baseUrl = config.testnet
      ? 'https://api-testnet.bybit.com'
      : 'https://api.bybit.com';
    
    if (config.proxyUrl) {
      this.proxyAgent = new HttpsProxyAgent(config.proxyUrl);
    }
  }

  private generateSignature(params: Record<string, any>, timestamp: string): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const signString = timestamp + this.config.apiKey + sortedParams;
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(signString)
      .digest('hex');
  }

  private async request(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(params, timestamp);

    const headers = {
      'X-BAPI-API-KEY': this.config.apiKey,
      'X-BAPI-SIGN': signature,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000',
      'Content-Type': 'application/json',
    };

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers,
      ...(this.proxyAgent && { httpsAgent: this.proxyAgent }),
      ...(method === 'GET' ? { params } : { data: params })
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error('Bybit API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAccountInfo(): Promise<any> {
    return await this.request('GET', '/v5/account/wallet-balance', { accountType: 'UNIFIED' });
  }

  async getPositions(category: string = 'linear'): Promise<BybitPosition[]> {
    const response = await this.request('GET', '/v5/position/list', { category, settleCoin: 'USDT' });
    return response.result?.list || [];
  }

  async placeOrder(params: {
    category: string;
    symbol: string;
    side: 'Buy' | 'Sell';
    orderType: 'Market' | 'Limit';
    qty: string;
    price?: string;
    stopLoss?: string;
    takeProfit?: string;
    timeInForce?: string;
    reduceOnly?: boolean;
  }): Promise<BybitOrder | null> {
    try {
      const response = await this.request('POST', '/v5/order/create', {
        ...params,
        timeInForce: params.timeInForce || 'GTC'
      });
      return response.result;
    } catch (error) {
      console.error('Failed to place Bybit order:', error);
      return null;
    }
  }

  async closePosition(symbol: string, category: string = 'linear'): Promise<boolean> {
    try {
      const positions = await this.getPositions(category);
      const position = positions.find(p => p.symbol === symbol);
      
      if (!position) {
        return false;
      }

      const closeSide = position.side === 'Buy' ? 'Sell' : 'Buy';
      
      await this.placeOrder({
        category,
        symbol,
        side: closeSide,
        orderType: 'Market',
        qty: position.size.toString(),
        reduceOnly: true
      });
      
      return true;
    } catch (error) {
      console.error('Failed to close Bybit position:', error);
      return false;
    }
  }

  async modifyPosition(symbol: string, stopLoss?: string, takeProfit?: string): Promise<boolean> {
    try {
      await this.request('POST', '/v5/position/trading-stop', {
        category: 'linear',
        symbol,
        ...(stopLoss && { stopLoss }),
        ...(takeProfit && { takeProfit })
      });
      return true;
    } catch (error) {
      console.error('Failed to modify Bybit position:', error);
      return false;
    }
  }

  async cancelOrder(orderId: string, symbol: string, category: string = 'linear'): Promise<boolean> {
    try {
      await this.request('POST', '/v5/order/cancel', { category, symbol, orderId });
      return true;
    } catch (error) {
      console.error('Failed to cancel Bybit order:', error);
      return false;
    }
  }

  async getMarketData(symbol: string, category: string = 'linear', interval: string = '1', limit: number = 200): Promise<any[]> {
    try {
      const response = await this.request('GET', '/v5/market/kline', {
        category,
        symbol,
        interval,
        limit
      });
      return response.result?.list || [];
    } catch (error) {
      console.error('Failed to get Bybit market data:', error);
      return [];
    }
  }

  async getTickers(category: string = 'linear'): Promise<any[]> {
    try {
      const response = await this.request('GET', '/v5/market/tickers', { category });
      return response.result?.list || [];
    } catch (error) {
      console.error('Failed to get Bybit tickers:', error);
      return [];
    }
  }

  async getOrderHistory(symbol?: string, category: string = 'linear', limit: number = 50): Promise<any[]> {
    try {
      const params: any = { category, limit };
      if (symbol) params.symbol = symbol;
      
      const response = await this.request('GET', '/v5/order/history', params);
      return response.result?.list || [];
    } catch (error) {
      console.error('Failed to get Bybit order history:', error);
      return [];
    }
  }

  async transfer(params: {
    fromAccountType: string;
    toAccountType: string;
    amount: string;
    coin: string;
  }): Promise<boolean> {
    try {
      await this.request('POST', '/v5/asset/transfer/inter-transfer', params);
      return true;
    } catch (error) {
      console.error('Failed to transfer funds:', error);
      return false;
    }
  }
}
