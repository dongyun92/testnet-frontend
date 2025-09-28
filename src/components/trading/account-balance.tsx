'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradingStore } from '@/stores/trading-store';
import { formatPrice } from '@/lib/utils';

export function AccountBalance() {
  const { account, connected, refreshAccount } = useTradingStore();

  // Refresh account data when component mounts
  useEffect(() => {
    const fetchAccount = async () => {
      if (connected) {
        console.log('[AccountBalance] Fetching account data');
        await refreshAccount();
      }
    };

    fetchAccount();
  }, [connected, refreshAccount]);

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground py-4">
            Disconnected
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground py-4">
            Loading account...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = parseFloat(account.totalWalletBalance || '0');
  const availableBalance = parseFloat(account.availableBalance || '0');
  const unrealizedPnl = parseFloat(account.totalUnrealizedProfit || '0');
  const marginBalance = parseFloat(account.totalMarginBalance || '0');

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 p-3">
        {/* Total Wallet Balance - Primary */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-mono text-sm font-semibold">
            {formatPrice(totalBalance, 2)} USDT
          </span>
        </div>

        {/* Available & PnL - Compact Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-muted-foreground mb-0.5">Available</div>
            <div className="font-mono text-green-600 font-medium text-xs">
              {formatPrice(availableBalance, 2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground mb-0.5">PnL</div>
            <div className={`font-mono font-medium text-xs ${
              unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {unrealizedPnl >= 0 ? '+' : ''}{formatPrice(unrealizedPnl, 2)}
            </div>
          </div>
        </div>

        {/* Balance Utilization - Compact */}
        {totalBalance > 0 && (
          <div className="pt-0.5">
            <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
              <span>Used</span>
              <span>{((totalBalance - availableBalance) / totalBalance * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((totalBalance - availableBalance) / totalBalance * 100), 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}