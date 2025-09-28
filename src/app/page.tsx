'use client';

import React from 'react';
import { TradingDataProvider } from '@/components/trading/trading-data-provider';
import { MarketOverview } from '@/components/trading/market-overview';
import { PriceTicker } from '@/components/trading/price-ticker';
import { OrderBook } from '@/components/trading/order-book';
import { TradeForm } from '@/components/trading/trade-form';
import { ActiveOrders } from '@/components/trading/active-orders';
import { TradeHistory } from '@/components/trading/trade-history';
import { OrderHistory } from '@/components/trading/order-history';
import { PositionsPanel } from '@/components/trading/positions-panel';
import { RecentTrades } from '@/components/trading/recent-trades';
import { ConnectionStatus } from '@/components/trading/connection-status';
import { AccountBalance } from '@/components/trading/account-balance';

export default function TradingDashboard() {
  return (
    <TradingDataProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Binance Testnet Trading Bot</h1>
                <div className="hidden md:block text-sm text-muted-foreground">
                  AI-Powered Futures Trading Platform
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ConnectionStatus />
                <div className="text-sm text-muted-foreground">
                  Testnet Mode
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="container mx-auto px-4 py-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Left Column - Market Overview */}
            <div className="lg:col-span-1">
              <MarketOverview />
            </div>
            
            {/* Center Column - Price Ticker and Chart */}
            <div className="lg:col-span-2 space-y-4">
              <PriceTicker />
              <div className="bg-card border rounded-lg p-6 h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg font-medium mb-2">TradingView Chart</div>
                  <div className="text-sm">Chart integration coming soon</div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Trading Controls */}
            <div className="lg:col-span-1 space-y-4">
              <AccountBalance />
              <TradeForm />
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <PositionsPanel />
            <OrderBook />
            <ActiveOrders />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradeHistory />
            <RecentTrades />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card mt-8">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <div className="mb-2">
                ⚠️ This is a demo trading interface connected to Binance Testnet
              </div>
              <div>
                No real money is at risk. Educational purposes only.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TradingDataProvider>
  );
}
