import { io, Socket } from 'socket.io-client';
import { TickerData, KlineData, DepthData, TradeData, MarkPriceData, WebSocketMessage } from '@/types';

export class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(url: string = 'http://localhost:8001') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] Connected to market data service');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error);
        this.isConnected = false;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error);
        }
        this.reconnectAttempts++;
      });

      this.socket.on('connected', (data) => {
        console.log('[WebSocket] Server acknowledged connection:', data);
      });

      this.socket.on('serverDisconnect', (data) => {
        console.log('[WebSocket] Server is shutting down:', data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribe(streams: string[]): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe', { streams });
      console.log('[WebSocket] Subscribed to streams:', streams);
    }
  }

  unsubscribe(streams: string[]): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe', { streams });
      console.log('[WebSocket] Unsubscribed from streams:', streams);
    }
  }

  requestSymbolData(symbol: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('requestSymbolData', { symbol });
    }
  }

  onTicker(callback: (data: WebSocketMessage<TickerData>) => void): void {
    if (this.socket) {
      this.socket.on('ticker', callback);
    }
  }

  onKline(callback: (data: WebSocketMessage<KlineData>) => void): void {
    if (this.socket) {
      this.socket.on('kline', callback);
    }
  }

  onDepth(callback: (data: WebSocketMessage<DepthData>) => void): void {
    if (this.socket) {
      this.socket.on('depth', callback);
    }
  }

  onTrade(callback: (data: WebSocketMessage<TradeData>) => void): void {
    if (this.socket) {
      this.socket.on('trade', callback);
    }
  }

  onMarkPrice(callback: (data: WebSocketMessage<MarkPriceData>) => void): void {
    if (this.socket) {
      this.socket.on('markPrice', callback);
    }
  }

  onSymbolData(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('symbolData', callback);
    }
  }

  off(event: string, callback?: Function): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const wsClient = new WebSocketClient();