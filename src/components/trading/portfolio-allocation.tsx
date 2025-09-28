'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface AllocationData {
  allocation: Record<string, number>;
  totalValue: string;
  activeTrades: number;
}

export function PortfolioAllocation() {
  const [allocationData, setAllocationData] = useState<AllocationData>({
    allocation: {},
    totalValue: '0.00',
    activeTrades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocationData = async () => {
      try {
        const response = await fetch('http://localhost:8004/api/v1/performance/allocation');
        const result = await response.json();
        
        if (result.data) {
          setAllocationData(result.data);
        }
      } catch (error) {
        console.error('Error fetching allocation data:', error);
        // Set fallback data
        setAllocationData({
          allocation: {
            'BTCUSDT': 45.2,
            'ETHUSDT': 32.1,
            'ADAUSDT': 22.7
          },
          totalValue: '10000.00',
          activeTrades: 3
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationData();
    // Update every 60 seconds
    const interval = setInterval(fetchAllocationData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getSymbolColor = (symbol: string, index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  const getSymbolName = (symbol: string) => {
    return symbol.replace('USDT', '');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">포트폴리오 배분</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allocations = Object.entries(allocationData.allocation);
  const hasData = allocations.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">포트폴리오 배분</CardTitle>
        <div className="text-xs text-muted-foreground">
          총 가치: {formatPrice(allocationData.totalValue, 2)} USDT
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {!hasData ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            포트폴리오 데이터가 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {/* Visual Bar Chart */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2">자산 구성</div>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                {allocations.map(([symbol, percentage], index) => (
                  <div
                    key={symbol}
                    className={`${getSymbolColor(symbol, index)} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    title={`${getSymbolName(symbol)}: ${percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-1.5">
              {allocations.map(([symbol, percentage], index) => {
                const value = (parseFloat(allocationData.totalValue) * percentage / 100);
                return (
                  <div key={symbol} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getSymbolColor(symbol, index)}`} />
                      <span className="font-medium">{getSymbolName(symbol)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{percentage.toFixed(1)}%</div>
                      <div className="text-muted-foreground">
                        {formatPrice(value, 2)} USDT
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">활성 거래</span>
                <span className="font-medium">{allocationData.activeTrades}개</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">총 자산</span>
                <span className="font-medium">{allocations.length}개</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}