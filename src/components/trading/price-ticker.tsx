'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMarketStore } from '@/stores/market-store';
import { formatPrice, formatPercent, getPriceChangeColor, formatVolume } from '@/lib/utils';

export function PriceTicker() {
  const { selectedSymbol, tickers, markPrices } = useMarketStore();
  const ticker = tickers[selectedSymbol];
  const markPrice = markPrices[selectedSymbol];

  if (!ticker) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            Loading price data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Price Section */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-2xl font-mono font-bold">
              {formatPrice(ticker.c, 2)}
            </div>
            <div className={`text-sm ${getPriceChangeColor(ticker.p)}`}>
              {ticker.p >= '0' ? '+' : ''}{formatPrice(ticker.p, 2)}
            </div>
          </div>

          {/* 24h Change */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">24h Change</div>
            <div className={`text-lg font-mono font-bold ${getPriceChangeColor(ticker.P)}`}>
              {formatPercent(ticker.P, 2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatPrice(ticker.p, 2)} USDT
            </div>
          </div>

          {/* 24h High/Low */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">24h High/Low</div>
            <div className="space-y-1">
              <div className="text-sm font-mono">
                H: {formatPrice(ticker.h, 2)}
              </div>
              <div className="text-sm font-mono">
                L: {formatPrice(ticker.l, 2)}
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">24h Volume</div>
            <div className="text-lg font-mono font-bold">
              {formatVolume(ticker.v)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatVolume(ticker.q)} USDT
            </div>
          </div>
        </div>

        {/* Mark Price Section */}
        {markPrice && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Mark Price</div>
                <div className="text-lg font-mono">
                  {formatPrice(markPrice.p, 2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Funding Rate</div>
                <div className={`text-lg font-mono ${getPriceChangeColor(markPrice.r)}`}>
                  {formatPercent(parseFloat(markPrice.r) * 100, 4)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Next Funding</div>
                <div className="text-lg font-mono">
                  {new Date(markPrice.T).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}