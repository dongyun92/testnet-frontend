'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTradingStore } from '@/stores/trading-store';
import { formatPrice, formatTime, formatPercent } from '@/lib/utils';
import { OrderResponse } from '@/types';

export function OrderHistory() {
  const { orders, cancelOrder, refreshAccount } = useTradingStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 주문 정보 새로고침
    refreshAccount();
  }, [refreshAccount]);

  const handleCancelOrder = async (order: OrderResponse) => {
    if (order.status !== 'NEW' && order.status !== 'PARTIALLY_FILLED') {
      alert('취소할 수 없는 주문입니다.');
      return;
    }

    try {
      await cancelOrder(order.symbol, order.orderId, order.clientOrderId);
      alert('주문이 취소되었습니다.');
    } catch (error: any) {
      alert(`주문 취소 실패: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'text-blue-500';
      case 'PARTIALLY_FILLED':
        return 'text-yellow-500';
      case 'FILLED':
        return 'text-green-500';
      case 'CANCELED':
        return 'text-gray-500';
      case 'REJECTED':
        return 'text-red-500';
      case 'EXPIRED':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">No orders yet</div>
            <div className="text-sm">Your trading history will appear here</div>
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
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono font-medium">
                        {order.symbol}
                      </TableCell>
                      <TableCell className={getSideColor(order.side)}>
                        {order.side}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.type}
                      </TableCell>
                      <TableCell className="font-mono">
                        {order.price === '0' ? '-' : formatPrice(order.price, 2)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatPrice(order.origQty, 4)}
                      </TableCell>
                      <TableCell className="font-mono">
                        <div className="flex flex-col">
                          <span>{formatPrice(order.executedQty, 4)}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatPercent(
                              (parseFloat(order.executedQty) / parseFloat(order.origQty)) * 100, 
                              1
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={getStatusColor(order.status)}>
                        <span className="text-xs font-medium">
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTime(order.time)}
                      </TableCell>
                      <TableCell>
                        {(order.status === 'NEW' || order.status === 'PARTIALLY_FILLED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order)}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* 요약 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="font-bold">{orders.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="font-bold text-blue-500">
                  {orders.filter(o => o.status === 'NEW' || o.status === 'PARTIALLY_FILLED').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Filled</div>
                <div className="font-bold text-green-500">
                  {orders.filter(o => o.status === 'FILLED').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Canceled</div>
                <div className="font-bold text-gray-500">
                  {orders.filter(o => o.status === 'CANCELED').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
