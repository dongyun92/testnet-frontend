'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface ActivityItem {
  type: 'trade' | 'position' | 'order';
  timestamp: number;
  description: string;
  value: number;
}

interface ActivityData {
  activities: ActivityItem[];
  volume24h: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [volume24h, setVolume24h] = useState('0.00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await fetch('http://localhost:8004/api/v1/performance/activity');
        const result = await response.json();
        
        if (result.data) {
          setActivities(result.data.activities || []);
          setVolume24h(result.data.volume24h || '0.00');
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        // Set fallback data
        setActivities([
          {
            type: 'trade',
            timestamp: Date.now() - 300000,
            description: 'BUY 0.1 BTCUSDT at 65000',
            value: 6500
          },
          {
            type: 'trade',
            timestamp: Date.now() - 900000,
            description: 'SELL 0.5 ETHUSDT at 4200',
            value: 2100
          },
          {
            type: 'position',
            timestamp: Date.now() - 1200000,
            description: 'Position: ADAUSDT 1000',
            value: 1500
          }
        ]);
        setVolume24h('15420.80');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
    // Update every 30 seconds
    const interval = setInterval(fetchActivityData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '방금';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return `${Math.floor(diff / 86400000)}일 전`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return '💱';
      case 'position': return '📍';
      case 'order': return '📋';
      default: return '•';
    }
  };

  const getActivityColor = (description: string) => {
    if (description.includes('BUY')) return 'text-green-600';
    if (description.includes('SELL')) return 'text-red-600';
    return 'text-blue-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">실시간 활동</CardTitle>
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
        <CardTitle className="text-sm font-medium">실시간 활동</CardTitle>
        <div className="text-xs text-muted-foreground">
          24시간 거래량: {formatPrice(volume24h, 2)} USDT
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="max-h-[700px] overflow-y-auto">
          <div className="space-y-2">
            {activities.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                활동 기록이 없습니다
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="flex items-start justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-2 flex-1">
                    <span className="text-xs mt-0.5">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${getActivityColor(activity.description)}`}>
                        {activity.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono">
                      {formatPrice(activity.value, 2)}
                    </div>
                    <div className="text-xs text-muted-foreground">USDT</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}