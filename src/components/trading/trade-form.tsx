'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMarketStore } from '@/stores/market-store';
import { useTradingStore } from '@/stores/trading-store';
import { formatPrice } from '@/lib/utils';

type OrderSide = 'BUY' | 'SELL';
type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_MARKET';

export function TradeForm() {
  const { selectedSymbol, tickers } = useMarketStore();
  const { createOrder, pendingOrders, connected } = useTradingStore();
  const ticker = tickers[selectedSymbol];
  
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = ticker ? parseFloat(ticker.c) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('수량을 입력해주세요.');
      return;
    }
    
    if (orderType === 'LIMIT' && (!price || parseFloat(price) <= 0)) {
      alert('가격을 입력해주세요.');
      return;
    }
    
    if ((orderType === 'STOP' || orderType === 'STOP_MARKET') && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      alert('스톱 가격을 입력해주세요.');
      return;
    }
    
    if (!connected) {
      alert('실행 엔진에 연결되지 않았습니다.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderRequest = {
        symbol: selectedSymbol,
        side: orderSide as 'BUY' | 'SELL',
        type: orderType as 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_MARKET',
        quantity,
        price: orderType === 'LIMIT' ? price : undefined,
        stopPrice: orderType === 'STOP' || orderType === 'STOP_MARKET' ? stopPrice : undefined,
        timeInForce: orderType === 'LIMIT' ? 'GTC' as const : undefined,
        reduceOnly: false,
        postOnly: false
      };
      
      console.log('Creating order:', orderRequest);
      await createOrder(orderRequest);
      
      // 성공시 폼 리셋
      setQuantity('');
      setPrice('');
      setStopPrice('');
      
      alert('주문이 성공적으로 생성되었습니다.');
    } catch (error: any) {
      console.error('Order creation failed:', error);
      alert(`주문 생성 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === 'MARKET' ? currentPrice : parseFloat(price) || 0;
    return qty * orderPrice;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">Place Order</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-2 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-1 h-full flex flex-col">
          {/* Order Side Tabs - Ultra Compact */}
          <div className="grid grid-cols-2 gap-1">
            <Button
              type="button"
              variant={orderSide === 'BUY' ? 'default' : 'outline'}
              onClick={() => setOrderSide('BUY')}
              className={`h-6 text-xs ${orderSide === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              Buy
            </Button>
            <Button
              type="button"
              variant={orderSide === 'SELL' ? 'default' : 'outline'}
              onClick={() => setOrderSide('SELL')}
              className={`h-6 text-xs ${orderSide === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              Sell
            </Button>
          </div>

          {/* Order Type - Ultra Compact 4-Button Grid */}
          <div className="grid grid-cols-2 gap-1">
            <Button
              type="button"
              variant={orderType === 'LIMIT' ? 'default' : 'outline'}
              onClick={() => setOrderType('LIMIT')}
              className="h-5 text-xs"
            >
              Limit
            </Button>
            <Button
              type="button"
              variant={orderType === 'MARKET' ? 'default' : 'outline'}
              onClick={() => setOrderType('MARKET')}
              className="h-5 text-xs"
            >
              Market
            </Button>
            <Button
              type="button"
              variant={orderType === 'STOP' ? 'default' : 'outline'}
              onClick={() => setOrderType('STOP')}
              className="h-5 text-xs"
            >
              Stop
            </Button>
            <Button
              type="button"
              variant={orderType === 'STOP_MARKET' ? 'default' : 'outline'}
              onClick={() => setOrderType('STOP_MARKET')}
              className="h-5 text-xs"
            >
              Stop Mkt
            </Button>
          </div>

          {/* Stop Price Input (for Stop orders) - Ultra Compact */}
          {(orderType === 'STOP' || orderType === 'STOP_MARKET') && (
            <div className="space-y-0.5">
              <label className="text-xs font-medium">Stop Price</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="h-6 text-xs pr-10"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  USDT
                </div>
              </div>
            </div>
          )}

          {/* Price Input (for Limit orders) - Ultra Compact */}
          {(orderType === 'LIMIT' || orderType === 'STOP') && (
            <div className="space-y-0.5">
              <label className="text-xs font-medium">Price</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-6 text-xs pr-10"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  USDT
                </div>
              </div>
              {ticker && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mkt: {formatPrice(ticker.c, 2)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setPrice(ticker.c)}
                    className="h-3 p-0 text-xs hover:text-primary"
                  >
                    Use
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Quantity Input - Ultra Compact */}
          <div className="space-y-0.5 flex-1">
            <label className="text-xs font-medium">Quantity</label>
            <div className="relative">
              <Input
                type="number"
                step="0.0001"
                placeholder="0.0000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-6 text-xs pr-10"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {selectedSymbol.replace('USDT', '')}
              </div>
            </div>
            
            {/* Percentage Buttons - Ultra Compact */}
            <div className="grid grid-cols-4 gap-1">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // This would calculate based on available balance
                    // For now, just set a placeholder
                    setQuantity((1 * percent / 100).toString());
                  }}
                  className="h-4 text-xs"
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>

          {/* Order Summary - Ultra Compact */}
          <div className="space-y-0.5 pt-1 border-t mt-auto">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-medium">
                {formatPrice(calculateTotal(), 2)} USDT
              </span>
            </div>
            
            {orderType === 'MARKET' && ticker && (
              <div className="flex justify-between text-xs opacity-75">
                <span className="text-muted-foreground">Est. Price</span>
                <span className="font-mono">
                  {formatPrice(ticker.c, 2)}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button - Ultra Compact */}
          <Button
            type="submit"
            disabled={
              !quantity || 
              !connected ||
              ((orderType === 'LIMIT' || orderType === 'STOP') && !price) ||
              ((orderType === 'STOP' || orderType === 'STOP_MARKET') && !stopPrice) ||
              isSubmitting ||
              pendingOrders.length > 0
            }
            className={`w-full h-7 text-xs font-medium ${
              orderSide === 'BUY' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } ${!connected ? 'opacity-50' : ''}`}
          >
            {!connected ? 'Disconnected' :
             isSubmitting || pendingOrders.length > 0 ? 'Placing...' : 
             `${orderSide} ${selectedSymbol.replace('USDT', '')}`}
          </Button>

          {/* Risk Warning - Ultra Compact */}
          <div className="text-xs text-muted-foreground text-center opacity-60">
            ⚠️ Testnet trading only
          </div>
        </form>
      </CardContent>
    </Card>
  );
}