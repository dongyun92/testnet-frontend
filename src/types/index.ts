export interface TickerData {
  s: string; // symbol
  c: string; // close price
  o: string; // open price
  h: string; // high price
  l: string; // low price
  v: string; // volume
  q: string; // quote volume
  P: string; // price change percent
  p: string; // price change
}

export interface KlineData {
  s: string; // symbol
  k: {
    t: number; // kline start time
    T: number; // kline close time
    s: string; // symbol
    i: string; // interval
    f: number; // first trade ID
    L: number; // last trade ID
    o: string; // open price
    c: string; // close price
    h: string; // high price
    l: string; // low price
    v: string; // base asset volume
    n: number; // number of trades
    x: boolean; // is this kline closed?
    q: string; // quote asset volume
    V: string; // taker buy base asset volume
    Q: string; // taker buy quote asset volume
  };
}

export interface DepthData {
  s: string; // symbol
  b: string[][]; // bids [price, quantity]
  a: string[][]; // asks [price, quantity]
  T: number; // transaction time
  E: number; // event time
}

export interface TradeData {
  s: string; // symbol
  p: string; // price
  q: string; // quantity
  T: number; // trade time
  m: boolean; // is buyer maker
}

export interface MarkPriceData {
  s: string; // symbol
  p: string; // mark price
  i: string; // index price
  P: string; // estimated settle price
  r: string; // funding rate
  T: number; // next funding time
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
  leverage: number;
}

export interface Order {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_MARKET';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  createdAt: number;
  updatedAt: number;
}

export interface Balance {
  asset: string;
  balance: number;
  crossWalletBalance: number;
  crossUnPnl: number;
  availableBalance: number;
  maxWithdrawAmount: number;
}

export interface AccountInfo {
  totalWalletBalance: number;
  totalUnrealizedProfit: number;
  totalMarginBalance: number;
  totalPositionInitialMargin: number;
  totalOpenOrderInitialMargin: number;
  availableBalance: number;
  maxWithdrawAmount: number;
  positions: Position[];
  balances: Balance[];
}

export interface MarketData {
  symbol: string;
  ticker?: TickerData;
  depth?: DepthData;
  markPrice?: MarkPriceData;
  klines?: KlineData[];
}

export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

export interface WebSocketMessage {
  timestamp: number;
  data: any;
}

export interface TradingSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  minQty: number;
  maxQty: number;
  stepSize: number;
  tickSize: number;
  minNotional: number;
}