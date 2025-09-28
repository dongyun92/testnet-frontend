// Market Data Provider - connects to real Binance API
import { useMarketStore } from './market-store';

const MARKET_DATA_URL = 'http://localhost:8001';

export interface BinanceTickerData {
  s: string;  // symbol
  c: string;  // close price
  o: string;  // open price  
  h: string;  // high price
  l: string;  // low price
  v: string;  // volume
  q: string;  // quote volume
  P: string;  // price change percent
  p: string;  // price change
  w: string;  // weighted avg price
}

// Convert Binance API format to internal format
function convertBinanceTicker(binanceTicker: BinanceTickerData) {
  return {
    s: binanceTicker.s,
    c: binanceTicker.c,
    o: binanceTicker.o,
    h: binanceTicker.h,
    l: binanceTicker.l,
    v: binanceTicker.v,
    q: binanceTicker.q,
    P: binanceTicker.P,
    p: binanceTicker.p,
    w: binanceTicker.w
  };
}

// Fetch all tickers from market data service
async function fetchTickers() {
  try {
    const response = await fetch(`${MARKET_DATA_URL}/api/v1/tickers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Backend returns {data: [...]} format, extract the data array
    if (data && data.data && Array.isArray(data.data)) {
      // Convert array to object with symbol as key for easier access
      const tickersObject: Record<string, BinanceTickerData> = {};
      data.data.forEach((ticker: BinanceTickerData) => {
        tickersObject[ticker.s] = ticker;
      });
      return tickersObject;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return {};
  }
}

// Fetch order book
async function fetchOrderBook(symbol: string) {
  try {
    const response = await fetch(`${MARKET_DATA_URL}/api/v1/orderbook/${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error);
    return null;
  }
}

// Setup market data updates
export function setupMarketDataUpdates() {
  const store = useMarketStore.getState();
  
  // Initialize connection
  store.setConnectionStatus(true);
  store.setLoading(true);
  
  // Initial data load
  const initializeData = async () => {
    console.log('[MarketData] Loading initial ticker data...');
    
    try {
      const tickers = await fetchTickers();
      
      if (tickers && Object.keys(tickers).length > 0) {
        // Update all tickers in store
        Object.entries(tickers).forEach(([symbol, ticker]) => {
          store.updateTicker(symbol, convertBinanceTicker(ticker as BinanceTickerData));
        });
        
        console.log(`[MarketData] Loaded ${Object.keys(tickers).length} symbols`);
        
        // Load order book for selected symbol
        const selectedSymbol = store.selectedSymbol;
        await refreshOrderBook(selectedSymbol);
        
        store.setLoading(false);
      } else {
        console.warn('[MarketData] No ticker data received');
        store.setLoading(false);
      }
    } catch (error) {
      console.error('[MarketData] Failed to load initial data:', error);
      store.setConnectionStatus(false);
      store.setLoading(false);
    }
  };
  
  // Periodic updates every 2 seconds
  const startPeriodicUpdates = () => {
    return setInterval(async () => {
      try {
        const tickers = await fetchTickers();
        
        if (tickers && Object.keys(tickers).length > 0) {
          Object.entries(tickers).forEach(([symbol, ticker]) => {
            store.updateTicker(symbol, convertBinanceTicker(ticker as BinanceTickerData));
          });
          
          // Update order book for selected symbol every 5 updates (10 seconds)
          if (Math.random() < 0.2) { // 20% chance = every ~10 seconds
            const selectedSymbol = store.selectedSymbol;
            await refreshOrderBook(selectedSymbol);
          }
          
          // Ensure connection status is true
          if (!store.isConnected) {
            store.setConnectionStatus(true);
          }
        }
      } catch (error) {
        console.error('[MarketData] Periodic update failed:', error);
        store.setConnectionStatus(false);
      }
    }, 2000); // Update every 2 seconds
  };
  
  // Start everything
  initializeData();
  const updateInterval = startPeriodicUpdates();
  
  // Return cleanup function
  return {
    stop: () => {
      clearInterval(updateInterval);
      store.setConnectionStatus(false);
      console.log('[MarketData] Stopped market data updates');
    },
    refresh: () => {
      initializeData();
    }
  };
}

// Get current order book for selected symbol
export async function refreshOrderBook(symbol: string) {
  const store = useMarketStore.getState();
  
  try {
    const orderBook = await fetchOrderBook(symbol);
    if (orderBook) {
      // Convert to format expected by OrderBook component (depth.b and depth.a)
      store.updateDepth(symbol, {
        symbol: orderBook.symbol,
        b: orderBook.bids, // bids array [[price, quantity], ...]
        a: orderBook.asks, // asks array [[price, quantity], ...]
        lastUpdateId: orderBook.lastUpdateId
      });
      console.log(`[MarketData] Updated order book for ${symbol}`);
    }
  } catch (error) {
    console.error(`[MarketData] Failed to refresh order book for ${symbol}:`, error);
  }
}

// Fetch recent trades
async function fetchRecentTrades(symbol: string) {
  try {
    const response = await fetch(`${MARKET_DATA_URL}/api/v1/trades/${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching trades for ${symbol}:`, error);
    return null;
  }
}

// Get recent trades for selected symbol  
export async function refreshRecentTrades(symbol: string) {
  try {
    const tradesData = await fetchRecentTrades(symbol);
    if (tradesData && Array.isArray(tradesData)) {
      console.log(`[MarketData] Fetched ${tradesData.length} trades for ${symbol}`);
      return tradesData;
    }
    return [];
  } catch (error) {
    console.error(`[MarketData] Failed to refresh trades for ${symbol}:`, error);
    return [];
  }
}