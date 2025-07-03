import { Room, Task } from "@/types";

// SSE Event types
export interface SSEEvent {
  type: 'connected' | 'rooms_updated' | 'tasks_updated' | 'heartbeat' | 'error';
  rooms?: Room[];
  tasks?: Task[];
  message?: string;
  timestamp: number;
}

// SSE Client class
export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private listeners: Map<string, Set<(event: SSEEvent) => void>> = new Map();

  constructor(private url: string = '/api/sse.php') {}

  connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.log('SSE: Already connected');
      return;
    }

    try {
      console.log('SSE: Connecting to', this.url);
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        console.log('SSE: Connected successfully');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 2000;
        this.emit('connected', { type: 'connected', timestamp: Date.now() });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('SSE: Received', data.type, data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('SSE: Failed to parse message', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE: Connection error', error);
        this.eventSource?.close();
        this.scheduleReconnect();
      };

      // Listen for specific event types
      this.eventSource.addEventListener('rooms', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          this.emit('rooms_updated', data);
        } catch (error) {
          console.error('SSE: Failed to parse rooms event', error);
        }
      });

      this.eventSource.addEventListener('tasks', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          this.emit('tasks_updated', data);
        } catch (error) {
          console.error('SSE: Failed to parse tasks event', error);
        }
      });

      this.eventSource.addEventListener('heartbeat', (event) => {
        console.log('SSE: Heartbeat received');
      });

    } catch (error) {
      console.error('SSE: Failed to create EventSource', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    console.log('SSE: Disconnecting');
    this.eventSource?.close();
    this.eventSource = null;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('SSE: Max reconnect attempts reached');
      this.emit('error', { 
        type: 'error', 
        message: 'Max reconnection attempts reached',
        timestamp: Date.now() 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000); // Max 30 seconds

    console.log(`SSE: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  addEventListener(eventType: string, callback: (event: SSEEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  removeEventListener(eventType: string, callback: (event: SSEEvent) => void): void {
    this.listeners.get(eventType)?.delete(callback);
  }

  private emit(eventType: string, data: SSEEvent): void {
    this.listeners.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('SSE: Error in event listener', error);
      }
    });
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Global SSE client instance
export const sseClient = new SSEClient(); 