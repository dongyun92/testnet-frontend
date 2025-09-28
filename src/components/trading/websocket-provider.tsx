'use client';

import React, { useEffect, useRef } from 'react';
import { useMarketStore } from '@/stores/market-store';
import { wsClient } from '@/lib/websocket';
import { SYMBOLS, INTERVALS } from '@/lib/utils';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const {
    setConnectionStatus,
    setLoading,
    updateTicker,
    updateDepth,
    updateMarkPrice,
    updateKline,
    selectedSymbol,
    selectedInterval,
  } = useMarketStore();
  
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeWebSocket = async () => {
      try {
        setLoading(true);
        await wsClient.connect();
        
        // Set up event listeners
        wsClient.onTicker((message) => {
          updateTicker(message.data.s, message.data);
        });

        wsClient.onDepth((message) => {
          updateDepth(message.data.s, message.data);
        });

        wsClient.onMarkPrice((message) => {
          updateMarkPrice(message.data.s, message.data);
        });

        wsClient.onKline((message) => {
          const klineData = message.data;
          updateKline(klineData.s, klineData.k.i as any, klineData);
        });

        // Subscribe to all symbols
        const streams: string[] = [];
        
        SYMBOLS.forEach(symbol => {
          const symbolLower = symbol.toLowerCase();
          streams.push(`${symbolLower}@ticker`);
          streams.push(`${symbolLower}@depth@100ms`);
          streams.push(`${symbolLower}@markPrice`);
          
          INTERVALS.forEach(interval => {
            streams.push(`${symbolLower}@kline_${interval}`);
          });
        });

        wsClient.subscribe(streams);
        
        setConnectionStatus(true);
        setLoading(false);
        
        console.log('[WebSocketProvider] Connected and subscribed to streams');
        
      } catch (error) {
        console.error('[WebSocketProvider] Failed to initialize:', error);
        setConnectionStatus(false);
        setLoading(false);
      }
    };

    initializeWebSocket();

    return () => {
      wsClient.disconnect();
      setConnectionStatus(false);
    };
  }, []);

  // Request initial data for selected symbol
  useEffect(() => {
    if (wsClient.getConnectionStatus()) {
      wsClient.requestSymbolData(selectedSymbol);
    }
  }, [selectedSymbol]);

  return <>{children}</>;
}