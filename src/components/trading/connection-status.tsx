'use client';

import React from 'react';
import { useTradingStore } from '@/stores/trading-store';
import { useMarketStore } from '@/stores/market-store';

export function ConnectionStatus() {
  const { connected: tradingConnected } = useTradingStore();
  const { isConnected: marketConnected } = useMarketStore();
  
  // Consider system connected if both trading and market data are connected
  const connected = tradingConnected && marketConnected;
  const isLoading = false; // No loading state needed with HTTP polling

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div 
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>
      <span className={connected ? 'text-green-600' : 'text-red-600'}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}