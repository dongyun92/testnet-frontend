'use client';

import React, { useEffect, useRef } from 'react';
import { setupTradingDataUpdates } from '@/stores/trading-store';
import { setupMarketDataUpdates } from '@/stores/market-data-provider';

export function TradingDataProvider({ children }: { children: React.ReactNode }) {
  const updatesManagerRef = useRef<{ stop: () => void; refresh: () => void } | null>(null);
  const marketUpdatesManagerRef = useRef<{ stop: () => void; refresh: () => void } | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    console.log('[TradingDataProvider] Initializing data updates...');
    
    // Initialize both trading and market data updates
    updatesManagerRef.current = setupTradingDataUpdates();
    marketUpdatesManagerRef.current = setupMarketDataUpdates();

    return () => {
      console.log('[TradingDataProvider] Cleaning up data updates...');
      if (updatesManagerRef.current) {
        updatesManagerRef.current.stop();
      }
      if (marketUpdatesManagerRef.current) {
        marketUpdatesManagerRef.current.stop();
      }
    };
  }, []);

  return <>{children}</>;
}