'use client';

import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketStore } from '@/stores/market-store';
import { refreshOrderBook } from '@/stores/market-data-provider';
import { formatPrice, formatQuantity } from '@/lib/utils';

export function OrderBook() {
  const { selectedSymbol, depths, tickers } = useMarketStore();
  const depth = depths[selectedSymbol];
  const ticker = tickers[selectedSymbol];

  // Fetch order book when symbol changes
  useEffect(() => {
    const fetchOrderBook = async () => {
      console.log(`[OrderBook] Fetching order book for ${selectedSymbol}`);
      await refreshOrderBook(selectedSymbol);
    };

    fetchOrderBook();
  }, [selectedSymbol]);

  const { bids, asks, maxQuantity } = useMemo(() => {
    if (!depth) return { bids: [], asks: [], maxQuantity: 0 };

    const bids = depth.b.slice(0, 10).map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      total: 0,
    }));

    const asks = depth.a.slice(0, 10).map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      total: 0,
    }));

    // Calculate running totals
    let bidTotal = 0;
    bids.forEach(bid => {
      bidTotal += bid.quantity;
      bid.total = bidTotal;
    });

    let askTotal = 0;
    asks.reverse().forEach(ask => {
      askTotal += ask.quantity;
      ask.total = askTotal;
    });
    asks.reverse();

    const maxQuantity = Math.max(
      ...bids.map(b => b.quantity),
      ...asks.map(a => a.quantity)
    );

    return { bids, asks, maxQuantity };
  }, [depth]);

  if (!depth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground py-8">
            Loading order book...
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderOrderLevel = (order: any, side: 'bid' | 'ask') => {
    const intensityPercent = (order.quantity / maxQuantity) * 100;
    const bgColor = side === 'bid' 
      ? `linear-gradient(to left, rgba(34, 197, 94, 0.1) ${intensityPercent}%, transparent ${intensityPercent}%)`
      : `linear-gradient(to left, rgba(239, 68, 68, 0.1) ${intensityPercent}%, transparent ${intensityPercent}%)`;
    
    return (
      <div
        key={order.price}
        className="grid grid-cols-3 gap-2 py-1 text-xs font-mono hover:bg-muted/30 transition-colors"
        style={{ background: bgColor }}
      >
        <div className={side === 'bid' ? 'text-green-500' : 'text-red-500'}>
          {formatPrice(order.price, 2)}
        </div>
        <div className="text-right">
          {formatQuantity(order.quantity, 4)}
        </div>
        <div className="text-right text-muted-foreground">
          {formatQuantity(order.total, 2)}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Book</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3 text-xs font-medium text-muted-foreground border-b">
          <div>Price (USDT)</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {/* Asks (sells) */}
          <div className="px-6">
            {asks.map(ask => renderOrderLevel(ask, 'ask'))}
          </div>

          {/* Spread */}
          <div className="px-6 py-3 border-y bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Spread</span>
              <span className="text-sm font-mono">
                {ticker && asks.length > 0 && bids.length > 0
                  ? formatPrice(asks[asks.length - 1].price - bids[0].price, 2)
                  : '...'
                }
              </span>
            </div>
            <div className="text-center mt-1">
              <span className="text-lg font-mono font-bold">
                {ticker ? formatPrice(ticker.c, 2) : '...'}
              </span>
            </div>
          </div>

          {/* Bids (buys) */}
          <div className="px-6">
            {bids.map(bid => renderOrderLevel(bid, 'bid'))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}