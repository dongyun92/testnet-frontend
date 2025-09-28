'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTradingStore } from '@/stores/trading-store';
import { useMarketStore } from '@/stores/market-store';
import { formatPrice, formatQuantity, formatTime } from '@/lib/utils';
import { OrderResponse } from '@/types';

export function ActiveOrders() {
  const { orders, pendingOrders, cancelOrder, refreshPositions } = useTradingStore();
  const { tickers } = useMarketStore();

  // Refresh orders when component mounts
  useEffect(() => {
    // Orders are automatically updated through the trading store polling
    refreshPositions();
  }, [refreshPositions]);

  const handleCancelOrder = async (order: OrderResponse) => {
    try {
      await cancelOrder(order.symbol, order.orderId, order.newClientOrderId);
      alert(`Order ${order.orderId} cancelled successfully`);
    } catch (error: any) {
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  const getOrderSideColor = (side: string) => {
    return side === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'PARTIALLY_FILLED':
        return 'bg-yellow-100 text-yellow-800';
      case 'FILLED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeOrders = orders?.filter(order => 
    order.status === 'NEW' || order.status === 'PARTIALLY_FILLED'
  ) || [];

  const isPending = (order: OrderResponse) => {
    return pendingOrders.includes(order.newClientOrderId || '');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Active Orders</CardTitle>
          <Badge variant="outline" className="text-xs">
            {activeOrders.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">No active orders</div>
            <div className="text-sm">Your pending orders will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders.map((order) => {
                    const ticker = tickers[order.symbol];
                    const filledPercent = order.quantity ? 
                      ((parseFloat(order.quantity) - parseFloat(order.quantity)) / parseFloat(order.quantity)) * 100 : 0;

                    return (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-mono font-medium">
                          {order.symbol}
                        </TableCell>
                        <TableCell className={getOrderSideColor(order.side)}>
                          <span className="text-xs font-medium">
                            {order.side}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {order.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatQuantity(order.quantity, 4)}
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex flex-col">
                            <span>{formatPrice(order.price, 2)}</span>
                            {ticker && order.type === 'LIMIT' && (
                              <span className="text-xs text-muted-foreground">
                                Mark: {formatPrice(ticker.c, 2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex flex-col">
                            <span>{formatQuantity((parseFloat(order.quantity || '0') - parseFloat(order.quantity || '0')).toString(), 4)}</span>
                            <span className="text-xs text-muted-foreground">
                              {filledPercent.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatTime(order.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order)}
                            disabled={isPending(order)}
                            className="text-xs"
                          >
                            {isPending(order) ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* 주문 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="font-bold">{activeOrders.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Buy Orders</div>
                <div className="font-bold text-green-600">
                  {activeOrders.filter(order => order.side === 'BUY').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Sell Orders</div>
                <div className="font-bold text-red-600">
                  {activeOrders.filter(order => order.side === 'SELL').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="font-bold text-blue-600">
                  {pendingOrders.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}