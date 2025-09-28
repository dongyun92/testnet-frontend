import { create } from 'zustand';
import { TickerData, DepthData, MarkPriceData, KlineData, MarketData, Interval } from '@/types';

interface MarketState {
  // Current selected symbol
  selectedSymbol: string;
  selectedInterval: Interval;
  
  // Market data
  tickers: Record<string, TickerData>;
  depths: Record<string, DepthData>;
  markPrices: Record<string, MarkPriceData>;
  klines: Record<string, Record<Interval, KlineData[]>>;
  
  // UI state
  isConnected: boolean;
  isLoading: boolean;
  
  // Actions
  setSelectedSymbol: (symbol: string) => void;
  setSelectedInterval: (interval: Interval) => void;
  setConnectionStatus: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  updateTicker: (symbol: string, ticker: TickerData) => void;
  updateDepth: (symbol: string, depth: DepthData) => void;
  updateMarkPrice: (symbol: string, markPrice: MarkPriceData) => void;
  updateKline: (symbol: string, interval: Interval, kline: KlineData) => void;
  
  getMarketData: (symbol: string) => MarketData;
  getTicker: (symbol: string) => TickerData | undefined;
  getDepth: (symbol: string) => DepthData | undefined;
  getMarkPrice: (symbol: string) => MarkPriceData | undefined;
  getKlines: (symbol: string, interval: Interval) => KlineData[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  // Initial state
  selectedSymbol: 'BTCUSDT',
  selectedInterval: '1m',
  tickers: {},
  depths: {},
  markPrices: {},
  klines: {},
  isConnected: false,
  isLoading: true,
  
  // Actions
  setSelectedSymbol: (symbol: string) => set({ selectedSymbol: symbol }),
  setSelectedInterval: (interval: Interval) => set({ selectedInterval: interval }),
  setConnectionStatus: (connected: boolean) => set({ isConnected: connected }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  updateTicker: (symbol: string, ticker: TickerData) =>
    set((state) => ({
      tickers: { ...state.tickers, [symbol]: ticker },
    })),
  
  updateDepth: (symbol: string, depth: DepthData) =>
    set((state) => ({
      depths: { ...state.depths, [symbol]: depth },
    })),
  
  updateMarkPrice: (symbol: string, markPrice: MarkPriceData) =>
    set((state) => ({
      markPrices: { ...state.markPrices, [symbol]: markPrice },
    })),
  
  updateKline: (symbol: string, interval: Interval, kline: KlineData) =>
    set((state) => {
      const symbolKlines = state.klines[symbol] || {};
      const intervalKlines = symbolKlines[interval] || [];
      
      // Find if kline with same start time exists
      const existingIndex = intervalKlines.findIndex(k => k.k.t === kline.k.t);
      
      let updatedKlines;
      if (existingIndex !== -1) {
        // Update existing kline
        updatedKlines = [...intervalKlines];
        updatedKlines[existingIndex] = kline;
      } else {
        // Add new kline and keep only last 500
        updatedKlines = [...intervalKlines, kline].slice(-500);
      }
      
      return {
        klines: {
          ...state.klines,
          [symbol]: {
            ...symbolKlines,
            [interval]: updatedKlines,
          },
        },
      };
    }),
  
  getMarketData: (symbol: string): MarketData => {
    const state = get();
    return {
      symbol,
      ticker: state.tickers[symbol],
      depth: state.depths[symbol],
      markPrice: state.markPrices[symbol],
    };
  },
  
  getTicker: (symbol: string) => get().tickers[symbol],
  getDepth: (symbol: string) => get().depths[symbol],
  getMarkPrice: (symbol: string) => get().markPrices[symbol],
  getKlines: (symbol: string, interval: Interval) => {
    const state = get();
    return state.klines[symbol]?.[interval] || [];
  },
}));