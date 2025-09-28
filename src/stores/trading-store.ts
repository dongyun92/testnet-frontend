import { create } from 'zustand';
import { OrderRequest, OrderResponse, Position, Account, ExecutionReport } from '../types';

interface TradingStore {
  // 주문 상태
  orders: OrderResponse[];
  trades: OrderResponse[]; // Completed trades
  pendingOrders: string[];
  
  // 계정 정보
  account: Account | null;
  positions: Position[];
  
  // 리스크 상태
  riskStatus: {
    dailyLoss: number;
    maxDrawdown: number;
    riskScore: number;
    marginRatio: number;
    availableBalance: number;
  } | null;
  
  // 연결 상태
  connected: boolean;
  
  // Actions
  setOrders: (orders: OrderResponse[]) => void;
  setTrades: (trades: OrderResponse[]) => void;
  addOrder: (order: OrderResponse) => void;
  updateOrder: (order: OrderResponse) => void;
  removeOrder: (orderId: number) => void;
  
  setPendingOrder: (clientOrderId: string) => void;
  removePendingOrder: (clientOrderId: string) => void;
  
  setAccount: (account: Account) => void;
  setPositions: (positions: Position[]) => void;
  updatePosition: (position: Position) => void;
  
  setRiskStatus: (riskStatus: any) => void;
  
  setConnected: (connected: boolean) => void;
  
  // 주문 생성
  createOrder: (orderRequest: OrderRequest) => Promise<OrderResponse>;
  
  // 주문 취소
  cancelOrder: (symbol: string, orderId?: number, clientOrderId?: string) => Promise<OrderResponse>;
  
  // 전체 주문 취소
  cancelAllOrders: (symbol?: string) => Promise<OrderResponse[]>;
  
  // 계정 정보 업데이트
  refreshAccount: () => Promise<void>;
  
  // 포지션 업데이트
  refreshPositions: () => Promise<void>;
  
  // 리스크 상태 업데이트
  refreshRiskStatus: () => Promise<void>;
  
  // 거래 내역 업데이트
  refreshTrades: () => Promise<void>;
}

const API_BASE_URL = 'http://localhost:8004/api/v1';

export const useTradingStore = create<TradingStore>((set, get) => ({
  // Initial state
  orders: [],
  trades: [],
  pendingOrders: [],
  account: null,
  positions: [],
  riskStatus: null,
  connected: true, // API 연결로 간주
  
  // Basic setters
  setOrders: (orders) => set({ orders }),
  setTrades: (trades) => set({ trades }),
  addOrder: (order) => set((state) => ({ 
    orders: [...state.orders, order] 
  })),
  updateOrder: (order) => set((state) => ({
    orders: state.orders.map(o => 
      o.orderId === order.orderId ? order : o
    )
  })),
  removeOrder: (orderId) => set((state) => ({
    orders: state.orders.filter(o => o.orderId !== orderId)
  })),
  
  setPendingOrder: (clientOrderId) => set((state) => ({
    pendingOrders: [...state.pendingOrders, clientOrderId]
  })),
  removePendingOrder: (clientOrderId) => set((state) => ({
    pendingOrders: state.pendingOrders.filter(id => id !== clientOrderId)
  })),
  
  setAccount: (account) => set({ account }),
  setPositions: (positions) => set({ positions }),
  updatePosition: (position) => set((state) => ({
    positions: state.positions.map(p => 
      p.symbol === position.symbol ? position : p
    )
  })),
  
  setRiskStatus: (riskStatus) => set({ riskStatus }),
  setConnected: (connected) => set({ connected }),
  
  // API actions
  createOrder: async (orderRequest) => {
    const clientOrderId = orderRequest.newClientOrderId || 
      `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 대기 주문에 추가
      get().setPendingOrder(clientOrderId);
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderRequest,
          newClientOrderId: clientOrderId
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }
      
      // 성공시 주문 추가
      get().addOrder(result.data);
      get().removePendingOrder(clientOrderId);
      
      return result.data;
    } catch (error) {
      // 실패시 대기 주문에서 제거
      get().removePendingOrder(clientOrderId);
      throw error;
    }
  },
  
  cancelOrder: async (symbol, orderId, clientOrderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${symbol}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, origClientOrderId: clientOrderId }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to cancel order');
    }
    
    // 주문 상태 업데이트
    get().updateOrder(result.data);
    
    return result.data;
  },
  
  cancelAllOrders: async (symbol) => {
    const url = symbol ? `${API_BASE_URL}/orders?symbol=${symbol}` : `${API_BASE_URL}/orders`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to cancel all orders');
    }
    
    // 주문 목록 업데이트
    result.data.forEach((order: OrderResponse) => {
      get().updateOrder(order);
    });
    
    return result.data;
  },
  
  refreshAccount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/account`);
      
      if (!response.ok) {
        // 서버가 없거나 오류 시 기본값으로 처리
        get().setAccount({
          totalWalletBalance: '0',
          availableBalance: '0',
          totalUnrealizedProfit: '0',
          totalMarginBalance: '0'
        });
        return;
      }
      
      const result = await response.json();
      get().setAccount(result.data || {
        totalWalletBalance: '0',
        availableBalance: '0',
        totalUnrealizedProfit: '0',
        totalMarginBalance: '0'
      });
    } catch (error) {
      // 연결 오류 시 기본값으로 처리
      get().setAccount({
        totalWalletBalance: '0',
        availableBalance: '0',
        totalUnrealizedProfit: '0',
        totalMarginBalance: '0'
      });
    }
  },
  
  refreshPositions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/positions`);
      
      if (!response.ok) {
        get().setPositions([]);
        return;
      }
      
      const result = await response.json();
      get().setPositions(result.data || []);
    } catch (error) {
      get().setPositions([]);
    }
  },
  
  refreshRiskStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/risk/status`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to refresh risk status');
    }
    
    get().setRiskStatus(result.data);
  },
  
  refreshTrades: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trades?limit=100`);
      
      if (!response.ok) {
        get().setTrades([]);
        return;
      }
      
      const result = await response.json();
      get().setTrades(result.data || []);
    } catch (error) {
      console.error('Failed to refresh trades:', error);
      get().setTrades([]);
    }
  },
}));

// 정기적 데이터 업데이트 시스템
export const setupTradingDataUpdates = () => {
  const store = useTradingStore.getState();
  
  // 초기 데이터 로드
  const initializeData = async () => {
    console.log('Initializing trading data...');
    try {
      await Promise.all([
        store.refreshAccount(),
        store.refreshPositions(),
        store.refreshRiskStatus(),
        store.refreshTrades()
      ]);
      console.log('Trading data initialized successfully');
      store.setConnected(true);
    } catch (error) {
      console.error('Failed to initialize trading data:', error);
      store.setConnected(false);
    }
  };
  
  // 정기 업데이트 (5초마다)
  const startPeriodicUpdates = () => {
    return setInterval(async () => {
      try {
        await Promise.all([
          store.refreshAccount(),
          store.refreshPositions(),
          store.refreshTrades()
        ]);
      } catch (error) {
        console.error('Failed to refresh trading data:', error);
        store.setConnected(false);
      }
    }, 5000);
  };
  
  // 초기화 실행
  initializeData();
  
  // 정기 업데이트 시작
  const updateInterval = startPeriodicUpdates();
  
  return {
    stop: () => clearInterval(updateInterval),
    refresh: initializeData
  };
};
