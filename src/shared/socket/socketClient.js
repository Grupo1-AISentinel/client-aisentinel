import { io } from 'socket.io-client';
import { STORAGE_KEYS, SOCKET_EVENTS } from '../utils/constants.js';

const readAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connecting = false;
    this.refCount = 0;
  }

  connect() {
    this.refCount += 1;
    if (this.socket?.connected) return this.socket;
    if (this.connecting) return this.socket;

    const auth = readAuth();
    const token = auth?.token;
    if (!token) {
      this.refCount = Math.max(0, this.refCount - 1);
      return null;
    }

    const url = import.meta.env.VITE_ADMIN_SOCKET_URL || import.meta.env.VITE_ADMIN_URL;
    this.connecting = true;
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[socket] connected:', this.socket.id);
      this.connecting = false;
      this.socket.emit(SOCKET_EVENTS.SUBSCRIBE_CAMERAS);
    });
    this.socket.on('disconnect', (reason) => {
      console.warn('[socket] disconnected:', reason);
      this.connecting = false;
    });
    this.socket.on('connect_error', (err) => {
      console.error('[socket] connect_error:', err.message);
      this.connecting = false;
    });
    this.socket.on('reconnect_failed', () => {
      console.error('[socket] reconnect_failed: agotados los reintentos');
    });

    return this.socket;
  }

  release() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) this.disconnect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connecting = false;
    }
  }

  on(event, handler) {
    if (!this.socket) this.connect();
    this.socket?.on(event, handler);
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
  }

  off(event, handler) {
    if (!this.socket) return;
    this.socket.off(event, handler);
    this.listeners.get(event)?.delete(handler);
  }
}

export const socketService = new SocketService();
