'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatPercent } from '@/lib/utils';

interface PerformanceMetrics {
  totalPnL: number;
  dailyPnL: number;
  totalTrades: number;
  winRate: number;
  portfolioValue: number;
  activeTrades: number;
}

interface StatItemProps {
  label: string;
  value: string;
  change?: number;
  isPositive?: boolean;
}

function StatItem({ label, value, change, isPositive }: StatItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold">{value}</div>
      {change !== undefined && (
        <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{formatPrice(change, 2)}
        </div>
      )}
    </div>
  );
}

export function PerformanceOverview() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalPnL: 0,
    dailyPnL: 0,
    totalTrades: 0,
    winRate: 0,
    portfolioValue: 113990.68, // 실제 현재 잔고
    activeTrades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // 새로운 성과 메트릭 API 사용
        const response = await fetch('http://localhost:8004/api/v1/performance/metrics');
        const result = await response.json();
        
        if (result.data) {
          setMetrics({
            totalPnL: parseFloat(result.data.totalPnL || '0'),
            dailyPnL: parseFloat(result.data.dailyPnL || '0'),
            totalTrades: result.data.totalTrades || 0,
            winRate: parseFloat(result.data.winRate || '0'),
            portfolioValue: parseFloat(result.data.portfolioValue || '0'),
            activeTrades: result.data.activeTrades || 0
          });
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
        // 에러 시 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
    // 30초마다 업데이트
    const interval = setInterval(fetchPerformanceData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">거래 성과</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">거래 성과</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatItem
            label="포트폴리오 가치"
            value={`${formatPrice(metrics.portfolioValue, 2)} USDT`}
          />
          <StatItem
            label="일일 손익"
            value={`${formatPrice(metrics.dailyPnL, 2)} USDT`}
            change={metrics.dailyPnL}
            isPositive={metrics.dailyPnL >= 0}
          />
          <StatItem
            label="총 손익"
            value={`${formatPrice(metrics.totalPnL, 2)} USDT`}
            change={metrics.totalPnL}
            isPositive={metrics.totalPnL >= 0}
          />
          <StatItem
            label="총 거래"
            value={metrics.totalTrades.toString()}
          />
          <StatItem
            label="승률"
            value={`${formatPrice(metrics.winRate, 1)}%`}
          />
          <StatItem
            label="활성 거래"
            value={metrics.activeTrades.toString()}
          />
        </div>
      </CardContent>
    </Card>
  );
}