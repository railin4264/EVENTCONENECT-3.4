'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { socketConfig, apiUtils } from '@/services/api';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de un WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const user = apiUtils.getCurrentUser();
    
    if (user && !socket) {
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [apiUtils.getCurrentUser()]);

  const initializeSocket = () => {
    try {
      const newSocket = io(socketConfig.url, {
        ...socketConfig.options,
        auth: {
          token: apiUtils.getAccessToken(),
        },
      });

      newSocket.on('connect', () => {
        console.log('WebSocket conectado');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Unirse a la sala personal del usuario
        const user = apiUtils.getCurrentUser();
        if (user) {
          newSocket.emit('join', user._id);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket desconectado:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          // El servidor desconectó, intentar reconectar
          setTimeout(() => {
            newSocket.connect();
          }, 1000);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error);
        setError('Error de conexión en tiempo real');
        setConnected(false);
        
        // Intentar reconectar
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            newSocket.connect();
          }, delay);
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconectado después de', attemptNumber, 'intentos');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Error de reconexión WebSocket:', error);
        setError('Error al reconectar en tiempo real');
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Falló la reconexión WebSocket');
        setError('No se pudo reconectar en tiempo real');
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error inicializando WebSocket:', error);
      setError('Error al inicializar conexión en tiempo real');
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('WebSocket no está conectado');
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Retornar función para limpiar el listener
      return () => {
        socket.off(event, callback);
      };
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const joinRoom = (room) => {
    if (socket && connected) {
      socket.emit('join', room);
    }
  };

  const leaveRoom = (room) => {
    if (socket && connected) {
      socket.emit('leave', room);
    }
  };

  const joinEvent = (eventId) => {
    if (socket && connected) {
      socket.emit('joinEvent', eventId);
    }
  };

  const leaveEvent = (eventId) => {
    if (socket && connected) {
      socket.emit('leaveEvent', eventId);
    }
  };

  const sendNotification = (data) => {
    if (socket && connected) {
      socket.emit('sendNotification', data);
    }
  };

  const value = {
    socket,
    connected,
    error,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    joinEvent,
    leaveEvent,
    sendNotification,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};