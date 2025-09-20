/**
 * LiveKit Configuration
 * Update these settings according to your LiveKit server setup
 */

export const livekitConfig = {
  // LiveKit Server URL (WebSocket)
  // For local development: ws://localhost:7880
  // For LiveKit Cloud: wss://your-project.livekit.cloud
  serverUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
  
  // LiveKit API credentials
  // Get these from https://cloud.livekit.io
  apiKey: process.env.LIVEKIT_API_KEY || 'your-livekit-api-key-here',
  apiSecret: process.env.LIVEKIT_API_SECRET || 'your-livekit-api-secret-here',
  
  // Room configuration
  roomPrefix: 'voice-ai',
  
  // Audio settings
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1
  },
  
  // Video settings
  video: {
    width: 1280,
    height: 720,
    frameRate: 30
  },
  
  // Screen share settings
  screenShare: {
    width: 1920,
    height: 1080,
    frameRate: 30
  },
  
  // Connection settings
  connection: {
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    pingInterval: 20,
    pingTimeout: 20
  }
};

export const getLiveKitConfig = (userId: string) => ({
  serverUrl: livekitConfig.serverUrl,
  apiKey: livekitConfig.apiKey,
  apiSecret: livekitConfig.apiSecret,
  roomName: `${livekitConfig.roomPrefix}-${userId}`,
  participantName: `user-${userId}`
}); 