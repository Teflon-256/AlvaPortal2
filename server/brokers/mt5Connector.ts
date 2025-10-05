import axios from 'axios';

export interface MT5Config {
  serverUrl: string;
  login: string;
  password: string;
  serverName: string;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface MT5Order {
  ticket: number;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
}

export class MT5Connector {
  private config: MT5Config;
  private apiBaseUrl: string;

  constructor(config: MT5Config) {
    this.config = config;
    this.apiBaseUrl = config.serverUrl || 'http://localhost:5000/mt5';
  }

  async connect(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/connect`, {
        login: this.config.login,
        password: this.config.password,
        server: this.config.serverName
      });
      return response.data.success;
    } catch (error) {
      console.error('MT5 connection failed:', error);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/account`);
      return response.data;
    } catch (error) {
      console.error('Failed to get MT5 account info:', error);
      throw error;
    }
  }

  async getPositions(): Promise<MT5Position[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/positions`);
      return response.data;
    } catch (error) {
      console.error('Failed to get MT5 positions:', error);
      return [];
    }
  }

  async placeOrder(params: {
    symbol: string;
    type: 'buy' | 'sell';
    volume: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
    comment?: string;
  }): Promise<MT5Order | null> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/order`, params);
      return response.data;
    } catch (error) {
      console.error('Failed to place MT5 order:', error);
      return null;
    }
  }

  async closePosition(ticket: number): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/close`, { ticket });
      return response.data.success;
    } catch (error) {
      console.error('Failed to close MT5 position:', error);
      return false;
    }
  }

  async modifyPosition(ticket: number, stopLoss?: number, takeProfit?: number): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/modify`, {
        ticket,
        stopLoss,
        takeProfit
      });
      return response.data.success;
    } catch (error) {
      console.error('Failed to modify MT5 position:', error);
      return false;
    }
  }

  async getSymbolInfo(symbol: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/symbol/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get symbol info:', error);
      return null;
    }
  }

  async getMarketData(symbol: string, timeframe: string, count: number): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/bars`, {
        params: { symbol, timeframe, count }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get market data:', error);
      return [];
    }
  }

  disconnect(): void {
    axios.post(`${this.apiBaseUrl}/disconnect`).catch(() => {});
  }
}
