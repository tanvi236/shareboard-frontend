import { io, Socket } from 'socket.io-client';
import { Block } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private listeners: { [key: string]: Function[] } = {};

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners = {};
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Board operations
  joinBoard(boardId: string): void {
    if (this.socket) {
      this.socket.emit('join-board', boardId);
    }
  }

  leaveBoard(boardId: string): void {
    if (this.socket) {
      this.socket.emit('leave-board', boardId);
    }
  }

  // Block operations
  emitBlockCreate(block: Block): void {
    if (this.socket) {
      this.socket.emit('block-created', block);
    }
  }

  emitBlockUpdate(block: Block): void {
    if (this.socket) {
      this.socket.emit('block-updated', block);
    }
  }

  emitBlockDelete(blockId: string): void {
    if (this.socket) {
      this.socket.emit('block-deleted', { blockId });
    }
  }

  emitBlockMove(blockId: string, position: { x: number; y: number }): void {
    if (this.socket) {
      this.socket.emit('block-moved', { blockId, position });
    }
  }

  // Event listeners
  onBlockCreate(callback: (block: Block) => void): void {
    if (this.socket) {
      this.socket.on('block-created', callback);
      this.addListener('block-created', callback);
    }
  }

  onBlockUpdate(callback: (block: Block) => void): void {
    if (this.socket) {
      this.socket.on('block-updated', callback);
      this.addListener('block-updated', callback);
    }
  }

  onBlockDelete(callback: (data: { blockId: string }) => void): void {
    if (this.socket) {
      this.socket.on('block-deleted', callback);
      this.addListener('block-deleted', callback);
    }
  }

  onBlockMove(callback: (data: { blockId: string; position: { x: number; y: number } }) => void): void {
    if (this.socket) {
      this.socket.on('block-moved', callback);
      this.addListener('block-moved', callback);
    }
  }

  onJoinedBoard(callback: (boardId: string) => void): void {
    if (this.socket) {
      this.socket.on('joined-board', callback);
      this.addListener('joined-board', callback);
    }
  }

  // Helper methods
  private addListener(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeAllListeners(): void {
    if (this.socket) {
      Object.keys(this.listeners).forEach(event => {
        this.socket!.off(event);
      });
      this.listeners = {};
    }
  }
}

export default new SocketService();
