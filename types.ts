
export type AgentStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'connecting' | 'connected' | 'disconnected';

export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export type AppPage = 'chat' | 'billing' | 'settings';

// Authentication types
export interface AuthState {
  userId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Session types
export interface SessionConfig {
  voiceEnabled: boolean;
  screenShareEnabled: boolean;
  language?: string;
  voiceModel?: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  config: SessionConfig;
  startTime: number;
  endTime?: number;
  status: 'active' | 'ended' | 'error';
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// WebSocket message types
export interface WebSocketMessage {
  action: string;
  sessionId?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}
