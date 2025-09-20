/**
 * REST API Service for Authentication and User Management
 * Implements the backend-frontend integration specification
 */

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SessionInfo {
  id: string;
  user_id: string;
  created_at: string;
  ended_at?: string;
  status: string;
  config: Record<string, any>;
}

export interface ConversationHistory {
  session_id: string;
  messages: Array<Record<string, any>>;
  total_messages: number;
  duration_seconds?: number;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
}

export interface MetricsResponse {
  active_connections: number;
  total_sessions: number;
  average_response_time: number;
  error_rate: number;
  memory_usage: number;
  cpu_usage: number;
}

export class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the access token for authenticated requests
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear the access token
   */
  public clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Get the current access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Register a new user
   */
  public async registerUser(userData: UserRegistration): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Login user and get access token
   */
  public async loginUser(credentials: UserLogin): Promise<AuthToken> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const tokenData = await response.json();
    this.setAccessToken(tokenData.access_token);
    return tokenData;
  }

  /**
   * Get user profile
   */
  public async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await this.authenticatedRequest(`/api/v1/users/${userId}/profile`);
    return response.json();
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.authenticatedRequest(`/api/v1/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    return response.json();
  }

  /**
   * Get session history
   */
  public async getSessionHistory(sessionId: string): Promise<ConversationHistory> {
    const response = await this.authenticatedRequest(`/api/v1/sessions/${sessionId}/history`);
    return response.json();
  }

  /**
   * List user sessions
   */
  public async listUserSessions(): Promise<SessionInfo[]> {
    const response = await this.authenticatedRequest('/api/v1/sessions');
    return response.json();
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseUrl}/api/v1/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  /**
   * Get system metrics
   */
  public async getMetrics(): Promise<MetricsResponse> {
    const response = await this.authenticatedRequest('/api/v1/metrics');
    return response.json();
  }

  /**
   * Make an authenticated request
   */
  private async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      this.clearAccessToken();
      throw new Error('Authentication failed - please login again');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Logout user
   */
  public logout(): void {
    this.clearAccessToken();
  }
}

// Create a singleton instance
let apiServiceInstance: ApiService | null = null;

export const createApiService = (baseUrl?: string): ApiService => {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService(baseUrl);
  }
  return apiServiceInstance;
};

export const getApiService = (): ApiService | null => {
  return apiServiceInstance;
}; 