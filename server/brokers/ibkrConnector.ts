import IB from '@stoqey/ib';

export interface IBKRConfig {
  host: string;
  port: number;
  clientId: number;
}

export interface IBKRPosition {
  symbol: string;
  position: number;
  avgCost: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface IBKROrder {
  orderId: number;
  symbol: string;
  action: string;
  quantity: number;
  orderType: string;
  status: string;
}

export interface IBContract {
  symbol: string;
  secType: string;
  exchange: string;
  currency: string;
}

export interface IBOrder {
  orderId: number;
  action: string;
  totalQuantity: number;
  orderType: string;
  lmtPrice?: number;
  auxPrice?: number;
}

export class IBKRConnector {
  private ib: any;
  private config: IBKRConfig;
  private isConnected: boolean = false;
  private positions: Map<string, IBKRPosition> = new Map();
  private orders: Map<number, IBKROrder> = new Map();

  constructor(config: IBKRConfig) {
    this.config = config;
    this.ib = new IB({
      clientId: config.clientId,
      host: config.host,
      port: config.port,
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    try {
      this.ib.on('connected' as any, () => {
        console.log('IBKR connected');
        this.isConnected = true;
      });

      this.ib.on('disconnected' as any, () => {
        console.log('IBKR disconnected');
        this.isConnected = false;
      });

      this.ib.on('error' as any, (err: any, data: any) => {
        console.error('IBKR error:', err, data);
      });

      this.ib.on('position' as any, (account: string, contract: any, pos: number, avgCost: number) => {
        const position: IBKRPosition = {
          symbol: contract.symbol || '',
          position: pos,
          avgCost,
          unrealizedPnL: 0,
          realizedPnL: 0
        };
        this.positions.set(contract.symbol || '', position);
      });

      this.ib.on('orderStatus' as any, (orderId: number, status: string) => {
        const order = this.orders.get(orderId);
        if (order) {
          order.status = status;
        }
      });
    } catch (error) {
      console.error('Error setting up IBKR event handlers:', error);
    }
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.ib.connect();
      setTimeout(() => {
        resolve(this.isConnected);
      }, 3000);
    });
  }

  async getAccountInfo(): Promise<any> {
    return new Promise((resolve) => {
      const accountData: any = {};
      
      try {
        this.ib.on('accountSummary' as any, (reqId: number, account: string, tag: string, value: string, currency: string) => {
          accountData[tag] = { value, currency };
        });

        if (this.ib.reqAccountSummary) {
          this.ib.reqAccountSummary(1, 'All', 'NetLiquidation,TotalCashValue,UnrealizedPnL,RealizedPnL');
        }
      } catch (error) {
        console.error('Error getting IBKR account info:', error);
      }
      
      setTimeout(() => {
        resolve(accountData);
      }, 2000);
    });
  }

  async getPositions(): Promise<IBKRPosition[]> {
    this.positions.clear();
    try {
      if (this.ib.reqPositions) {
        this.ib.reqPositions();
      }
    } catch (error) {
      console.error('Error requesting IBKR positions:', error);
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Array.from(this.positions.values()));
      }, 2000);
    });
  }

  async placeOrder(params: {
    symbol: string;
    secType: string;
    exchange: string;
    currency: string;
    action: string;
    quantity: number;
    orderType: string;
    limitPrice?: number;
    stopPrice?: number;
  }): Promise<number> {
    const orderId = Date.now();
    
    const contract: IBContract = {
      symbol: params.symbol,
      secType: params.secType,
      exchange: params.exchange,
      currency: params.currency,
    };

    const order: IBOrder = {
      orderId,
      action: params.action,
      totalQuantity: params.quantity,
      orderType: params.orderType,
      lmtPrice: params.limitPrice,
      auxPrice: params.stopPrice,
    };

    try {
      if (this.ib.placeOrder) {
        this.ib.placeOrder(orderId, contract, order);
      }
    } catch (error) {
      console.error('Error placing IBKR order:', error);
    }

    const ibkrOrder: IBKROrder = {
      orderId,
      symbol: params.symbol,
      action: params.action,
      quantity: params.quantity,
      orderType: params.orderType,
      status: 'Submitted'
    };
    this.orders.set(orderId, ibkrOrder);

    return orderId;
  }

  async cancelOrder(orderId: number): Promise<boolean> {
    try {
      if (this.ib.cancelOrder) {
        this.ib.cancelOrder(orderId);
      }
      this.orders.delete(orderId);
      return true;
    } catch (error) {
      console.error('Failed to cancel IBKR order:', error);
      return false;
    }
  }

  async getMarketData(symbol: string, secType: string = 'STK', exchange: string = 'SMART', currency: string = 'USD'): Promise<any> {
    return new Promise((resolve) => {
      const contract: IBContract = {
        symbol,
        secType,
        exchange,
        currency,
      };

      const tickData: any = {};

      try {
        this.ib.on('tickPrice' as any, (tickerId: number, field: number, price: number) => {
          tickData[`field_${field}`] = price;
        });

        const reqId = Date.now();
        if (this.ib.reqMktData) {
          this.ib.reqMktData(reqId, contract, '', false, false);
        }

        setTimeout(() => {
          if (this.ib.cancelMktData) {
            this.ib.cancelMktData(reqId);
          }
          resolve(tickData);
        }, 2000);
      } catch (error) {
        console.error('Error getting IBKR market data:', error);
        resolve(tickData);
      }
    });
  }

  disconnect(): void {
    if (this.isConnected) {
      this.ib.disconnect();
    }
  }
}
