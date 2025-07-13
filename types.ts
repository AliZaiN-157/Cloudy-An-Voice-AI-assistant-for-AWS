
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
