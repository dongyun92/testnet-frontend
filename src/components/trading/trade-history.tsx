'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTradingStore } from '@/stores/trading-store';
import { formatPrice, formatQuantity, formatTime } from '@/lib/utils';

export function TradeHistory() {
  const { trades } = useTradingStore();

  // All trades from the new endpoint are already filled
  const displayTrades = trades?.filter(trade => 
    parseFloat(trade.quantity || '0') > 0
  ) || [];

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  const getSideBadgeColor = (side: string) => {
    return side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Calculate total traded volume
  const totalVolume = displayTrades.reduce((total, trade) => {
    const price = parseFloat(trade.price || '0');
    const quantity = parseFloat(trade.quantity || '0');
    return total + (price * quantity);
  }, 0);

  // Calculate profit/loss (very simplified)
  const calculateTradeValue = (trade: any) => {
    const price = parseFloat(trade.price || '0');
    const quantity = parseFloat(trade.quantity || '0');
    return price * quantity;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trade History</CardTitle>
          <Badge variant="outline" className="text-xs">
            {displayTrades.length} trades
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {displayTrades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">No trades executed</div>
            <div className="text-sm">Your completed trades will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Trades</div>
                <div className="font-bold">{displayTrades.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Buy Trades</div>
                <div className="font-bold text-green-600">
                  {displayTrades.filter(trade => trade.side === 'BUY').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Sell Trades</div>
                <div className="font-bold text-red-600">
                  {displayTrades.filter(trade => trade.side === 'SELL').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Volume</div>
                <div className="font-bold font-mono">
                  {formatPrice(totalVolume, 2)} USDT
                </div>
              </div>
            </div>

            {/* Trades Table - Optimized for larger space allocation */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg">
              <Table className="min-w-full table-fixed">
                <TableHeader className="sticky top-0 bg-background border-b">
                  <TableRow>
                    <TableHead className="w-[18%] text-sm font-medium">Time</TableHead>
                    <TableHead className="w-[12%] text-sm font-medium">Symbol</TableHead>
                    <TableHead className="w-[10%] text-sm font-medium">Side</TableHead>
                    <TableHead className="w-[10%] text-sm font-medium">Type</TableHead>
                    <TableHead className="w-[18%] text-sm font-medium text-right">Price</TableHead>
                    <TableHead className="w-[16%] text-sm font-medium text-right">Quantity</TableHead>
                    <TableHead className="w-[16%] text-sm font-medium text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTrades
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) // Sort by newest first
                    .map((trade, index) => (
                    <TableRow key={`${trade.orderId}-${trade.timestamp}-${index}`} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="text-sm text-muted-foreground w-[18%] p-3">
                        {formatTime(trade.timestamp || Date.now())}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-sm w-[12%] p-3">
                        {trade.symbol}
                      </TableCell>
                      <TableCell className="w-[10%] p-3">
                        <Badge className={`${getSideBadgeColor(trade.side)} text-xs px-2 py-1`}>
                          {trade.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[10%] p-3">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          MARK
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm w-[18%] p-3 text-right">
                        ${formatPrice(trade.price, 2)}
                      </TableCell>
                      <TableCell className="font-mono text-sm w-[16%] p-3 text-right">
                        {formatQuantity(trade.quantity, 4)}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-sm w-[16%] p-3 text-right">
                        ${formatPrice(calculateTradeValue(trade), 2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Showing all {displayTrades.length} trades (scroll to see more)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}