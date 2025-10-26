import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface CopyTradingStatus {
  status: 'connected' | 'reconnecting' | 'error' | 'disconnected';
  message: string;
  attempt?: number;
  error?: string;
}

interface TradeExecution {
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  time: string;
  orderId: string;
}

interface PositionUpdate {
  symbol: string;
  side: string;
  size: string;
  previousSize: string;
  action: 'opened' | 'closed';
}

interface ReplicationComplete {
  symbol: string;
  copiersCount: number;
  action: 'open' | 'close';
}

interface OrderUpdate {
  symbol: string;
  orderId: string;
  status: string;
  side: string;
  quantity: string;
}

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<CopyTradingStatus>({
    status: 'disconnected',
    message: 'Not connected'
  });

  useEffect(() => {
    // Create Socket.io connection
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Real-time connection established');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Real-time connection disconnected');
      setConnectionStatus({
        status: 'disconnected',
        message: 'Disconnected from real-time updates'
      });
    });

    // Copy trading status updates
    socket.on('copy-trading-status', (data: CopyTradingStatus) => {
      console.log('📡 Copy trading status:', data);
      setConnectionStatus(data);
    });

    // Trade execution notifications
    socket.on('trade-executed', (data: TradeExecution) => {
      console.log('✅ Trade executed:', data);
      
      toast({
        title: `Trade Executed: ${data.symbol}`,
        description: `${data.side} ${data.quantity} @ $${data.price}`,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bybit/balance'] });
    });

    // Position updates
    socket.on('position-update', (data: PositionUpdate) => {
      console.log('📊 Position update:', data);
      
      const action = data.action === 'opened' ? 'Opened' : 'Closed';
      toast({
        title: `Position ${action}: ${data.symbol}`,
        description: `${data.side} ${data.size}`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
    });

    // Replication complete notifications
    socket.on('replication-complete', (data: ReplicationComplete) => {
      console.log('🔄 Replication complete:', data);
      
      const action = data.action === 'open' ? 'opened' : 'closed';
      toast({
        title: `Copy Trading ${action === 'opened' ? 'Active' : 'Closed'}`,
        description: `${data.symbol} replicated to ${data.copiersCount} copiers`,
      });
    });

    // Order updates
    socket.on('order-update', (data: OrderUpdate) => {
      console.log('📝 Order update:', data);
      
      if (data.status === 'Filled') {
        toast({
          title: `Order Filled: ${data.symbol}`,
          description: `${data.side} ${data.quantity}`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    });

    // Balance updates
    socket.on('balance-updated', () => {
      console.log('💰 Balance updated');
      queryClient.invalidateQueries({ queryKey: ['/api/bybit/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, toast]);

  return {
    connectionStatus,
    socket: socketRef.current
  };
}

// Hook to get WebSocket connection status from backend
export function useWebSocketStatus() {
  const [status, setStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    activePositions: 0
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/copy-trading/websocket-status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch WebSocket status:', error);
      }
    };

    // Fetch status immediately and every 10 seconds
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
