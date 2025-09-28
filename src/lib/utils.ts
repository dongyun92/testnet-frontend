import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | number, decimals: number = 2): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0.00';
  return num.toFixed(decimals);
}

export function formatQuantity(quantity: string | number, decimals: number = 4): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return '0.0000';
  return num.toFixed(decimals);
}

export function formatPercent(percent: string | number, decimals: number = 2): string {
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(num)) return '0.00';
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

export function formatVolume(volume: string | number): string {
  const num = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (isNaN(num)) return '0';
  
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  
  return num.toFixed(0);
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function getPriceChangeColor(change: string | number): string {
  const num = typeof change === 'string' ? parseFloat(change) : change;
  if (num > 0) return 'text-green-500';
  if (num < 0) return 'text-red-500';
  return 'text-gray-500';
}

export function getPercentChangeColor(percent: string | number): string {
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (num > 0) return 'text-green-500 bg-green-500/10';
  if (num < 0) return 'text-red-500 bg-red-500/10';
  return 'text-gray-500 bg-gray-500/10';
}

export function calculatePnL(entryPrice: number, currentPrice: number, quantity: number, side: 'LONG' | 'SHORT'): number {
  if (side === 'LONG') {
    return (currentPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - currentPrice) * quantity;
  }
}

export function calculatePnLPercent(entryPrice: number, currentPrice: number, side: 'LONG' | 'SHORT'): number {
  if (side === 'LONG') {
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - currentPrice) / entryPrice) * 100;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT',
  'LINKUSDT', 'LTCUSDT', 'BCHUSDT', 'XLMUSDT', 'EOSUSDT'
];

export const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;