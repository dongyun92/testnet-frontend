'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketStore } from '@/stores/market-store';
import { formatPrice, formatPercent, getPercentChangeColor, SYMBOLS } from '@/lib/utils';
import { setupMarketDataUpdates } from '@/stores/market-data-provider';

export function MarketOverview() {
  const { tickers, selectedSymbol, setSelectedSymbol } = useMarketStore();

  useEffect(() => {
    // Force client-side only execution
    if (typeof window === 'undefined') return;
    
    console.log('[MarketOverview] Initializing market data...');
    const marketUpdates = setupMarketDataUpdates();
    
    // Force immediate data fetch
    setTimeout(() => {
      console.log('[MarketOverview] Forcing data refresh...');
      marketUpdates.refresh();
    }, 100);
    
    return () => {
      console.log('[MarketOverview] Cleaning up market data...');
      marketUpdates.stop();
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Market Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="h-full overflow-y-auto">
          <div className="space-y-2 pr-2">
            {SYMBOLS.map((symbol) => {
              const ticker = tickers[symbol];
              const isSelected = symbol === selectedSymbol;
              
              return (
                <div
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-500/10 border border-blue-500/20' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      Vol: {ticker ? formatPrice(ticker.v, 0) : '...'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm">
                      {ticker ? formatPrice(ticker.c, 2) : '...'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      ticker ? getPercentChangeColor(ticker.P) : 'text-gray-500'
                    }`}>
                      {ticker ? formatPercent(ticker.P, 2) : '...'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}