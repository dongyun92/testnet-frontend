'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTradingStore } from '@/stores/trading-store';
import { useMarketStore } from '@/stores/market-store';
import { formatPrice, formatQuantity, formatPercent, calculatePnL, calculatePnLPercent, getPriceChangeColor } from '@/lib/utils';
import { Position } from '@/types';

export function PositionsPanel() {
  const { positions, refreshPositions, createOrder } = useTradingStore();
  const { tickers } = useMarketStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 포지션 정보 새로고침
    refreshPositions();
  }, [refreshPositions]);

  const handleClosePosition = async (position: Position) => {
    const positionAmount = parseFloat(position.positionAmt);
    if (positionAmount === 0) return;

    try {
      const side = positionAmount > 0 ? 'SELL' : 'BUY';
      const quantity = Math.abs(positionAmount).toString();

      await createOrder({
        symbol: position.symbol,
        side,
        type: 'MARKET',
        quantity,
        reduceOnly: true,
        closePosition: true
      });

      alert(`${position.symbol} 포지션이 마켓 주문으로 청산되었습니다.`);
    } catch (error: any) {
      alert(`포지션 청산 실패: ${error.message}`);
    }
  };

  const getPositionSide = (positionAmt: string): 'LONG' | 'SHORT' => {
    return parseFloat(positionAmt) > 0 ? 'LONG' : 'SHORT';
  };

  const getSideColor = (side: 'LONG' | 'SHORT') => {
    return side === 'LONG' ? 'text-green-500' : 'text-red-500';
  };

  const activePositions = positions?.filter(pos => parseFloat(pos.positionAmt) !== 0) || [];

  const totalPnL = activePositions.reduce((total, pos) => {
    const side = getPositionSide(pos.positionAmt);
    const entryPrice = parseFloat(pos.entryPrice);
    const markPrice = parseFloat(pos.markPrice);
    const quantity = Math.abs(parseFloat(pos.positionAmt));
    return total + calculatePnL(entryPrice, markPrice, quantity, side);
  }, 0);

  const longCount = activePositions.filter(pos => parseFloat(pos.positionAmt) > 0).length;
  const shortCount = activePositions.filter(pos => parseFloat(pos.positionAmt) < 0).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Positions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {activePositions.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground">
            No open positions
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">Total</div>
              <div className="font-medium">{activePositions.length}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">L/S</div>
              <div className="font-medium">
                <span className="text-green-500">{longCount}</span>
                /
                <span className="text-red-500">{shortCount}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">PnL</div>
              <div className={`font-medium font-mono ${getPriceChangeColor(totalPnL)}`}>
                {formatPrice(totalPnL, 1)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
