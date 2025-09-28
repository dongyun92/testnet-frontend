'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketStore } from '@/stores/market-store';
import { refreshRecentTrades } from '@/stores/market-data-provider';
import { formatPrice, formatQuantity, formatTime } from '@/lib/utils';

interface Trade {
  id: number;
  price: number;
  qty: number;
  time: number;
  isBuyerMaker: boolean;
}

export function RecentTrades() {
  const { selectedSymbol } = useMarketStore();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real trade data from Binance API
  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      try {
        const tradesData = await refreshRecentTrades(selectedSymbol);
        if (tradesData && Array.isArray(tradesData)) {
          setTrades(tradesData.slice(0, 50)); // Keep last 50 trades
        }
      } catch (error) {
        console.error('Failed to fetch trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();

    // Update trades every 5 seconds
    const interval = setInterval(fetchTrades, 5000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3 text-xs font-medium text-muted-foreground border-b">
          <div>Price (USDT)</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Time</div>
        </div>

        {/* Trade List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading trades...
            </div>
          ) : trades.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No recent trades
            </div>
          ) : (
            trades.map((trade, index) => (
              <div
                key={`${trade.id}-${index}`}
                className="grid grid-cols-3 gap-2 px-6 py-2 text-xs font-mono hover:bg-muted/30 transition-colors"
              >
                <div className={trade.isBuyerMaker ? 'text-red-500' : 'text-green-500'}>
                  {formatPrice(trade.price, 2)}
                </div>
                <div className="text-right">
                  {formatQuantity(trade.qty, 4)}
                </div>
                <div className="text-right text-muted-foreground">
                  {formatTime(trade.time)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}