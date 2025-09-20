# LiveKit + Gemini Voice AI Assistant Architecture

This document outlines the new architecture that leverages LiveKit for real-time media streaming and Gemini for multimodal AI intelligence to create a highly successful Voice AI Assistant SaaS application.

## Architecture Overview

The new architecture replaces the previous WebSocket-based approach with a more robust, scalable solution:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   LiveKit       │    │   Backend       │
│   (React)       │◄──►│   Server        │◄──►│   (FastAPI)     │
│                 │    │   (WebRTC)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LiveKit       │    │   Media         │    │   Gemini        │
│   Client SDK    │    │   Transport     │    │   Live API      │
│                 │    │   (WebRTC)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Components

### 1. Frontend (React + LiveKit Client)

**File: `services/livekitService.ts`**
- Manages LiveKit room connections
- Handles audio/video capture and streaming
- Processes AI responses and data channels
- Provides real-time UI updates

**File: `components/VoiceAgentPage.tsx`**
- Modern UI for voice interactions
- Real-time audio level indicators
- Screen sharing controls
- Chat message display

### 2. Backend (FastAPI + LiveKit Connector)

**File: `backend/src/realtime_assistant_service/connectors/livekit_connector.py`**
- Manages LiveKit room creation and token generation
- Processes user media streams (audio/video)
- Integrates with Gemini Live API
- Handles AI session management

**File: `backend/src/realtime_assistant_service/api/livekit_routes.py`**
- REST API endpoints for room management
- Token generation and authentication
- Session control and monitoring

### 3. LiveKit Server

- WebRTC media relay and signaling
- Scalable real-time communication
- Built-in room management
- Secure token-based authentication

### 4. Gemini Live API

- Multimodal AI processing (STT, VAD, VLM, LLM, TTS)
- Real-time conversation capabilities
- Context-aware responses
- Screen content analysis

## Key Benefits

### 1. Ultra-Low Latency
- WebRTC-based media transport
- Direct peer-to-peer connections
- Minimal network overhead
- Real-time audio/video processing

### 2. True Multimodality
- Simultaneous audio and video processing
- Context-aware AI responses
- Screen content analysis
- Natural conversation flow

### 3. Scalability
- LiveKit's distributed architecture
- Horizontal scaling capabilities
- Efficient media relay
- Load balancing support

### 4. Developer Experience
- Simplified media handling
- Centralized AI processing
- Clear separation of concerns
- Easy debugging and monitoring

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install livekit-client livekit-react @livekit/components-react @livekit/components-styles
```

**Backend:**
```bash
pip install livekit livekit-server-sdk livekit-api
```

### 2. Configure LiveKit Server

**Option A: Self-hosted**
```bash
# Install LiveKit Server
curl -sSL https://get.livekit.io | bash

# Start LiveKit Server
livekit-server --dev
```

**Option B: LiveKit Cloud**
- Sign up at https://cloud.livekit.io
- Get your API key and secret
- Update configuration

### 3. Environment Variables

**Frontend (`config/livekit.ts`):**
```typescript
export const livekitConfig = {
  serverUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
  apiKey: process.env.LIVEKIT_API_KEY || 'your-livekit-api-key',
  apiSecret: process.env.LIVEKIT_API_SECRET || 'your-livekit-api-secret',
  // ... other settings
};
```

**Backend (`.env`):**
```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Start the Application

**Backend:**
```bash
cd backend
uvicorn src.realtime_assistant_service.main:app --reload
```

**Frontend:**
```bash
npm run dev
```

## API Endpoints

### LiveKit Routes

- `POST /livekit/rooms` - Create a new room
- `POST /livekit/rooms/{room_name}/join` - Join room as AI
- `GET /livekit/rooms/{room_name}/status` - Get room status
- `POST /livekit/rooms/{room_name}/sessions` - Start AI session
- `DELETE /livekit/rooms/{room_name}/sessions/{session_id}` - End AI session
- `GET /livekit/sessions` - Get active sessions
- `GET /livekit/health` - Health check

## Usage Flow

### 1. Room Creation
```typescript
// Frontend creates room
const roomConfig = await apiService.createLiveKitRoom(userId);
const liveKitService = createLiveKitService(roomConfig);
await liveKitService.connect();
```

### 2. Media Streaming
```typescript
// Start audio capture
await liveKitService.startAudioCapture();

// Start screen sharing
await liveKitService.startScreenShare();

// Send data to AI
await liveKitService.sendDataToAI({
  type: 'start_session',
  user_id: userId
});
```

### 3. AI Processing
```python
# Backend processes media streams
async def process_user_audio(self, audio_data: bytes, session_id: str):
    async for response in self.gemini_connector.process_audio_input(audio_data, session_id):
        await self._send_ai_response(response["content"], session_id)
```

### 4. Real-time Responses
```typescript
// Frontend receives AI responses
liveKitCallbacks.onAIResponse = (text, audioData) => {
  addMessage('ai', text, audioData);
};
```

## Configuration

### Audio Settings
```typescript
const audioSettings = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  channelCount: 1
};
```

### Video Settings
```typescript
const videoSettings = {
  width: 1280,
  height: 720,
  frameRate: 30
};
```

### Screen Share Settings
```typescript
const screenShareSettings = {
  width: 1920,
  height: 1080,
  frameRate: 30
};
```

## Monitoring and Debugging

### Frontend Logging
```typescript
liveKitCallbacks.onError = (error) => {
  console.error('LiveKit error:', error);
  setError(error.message);
};
```

### Backend Logging
```python
self.logger.info(f"AI response: {response['content']}")
self.logger.error(f"Error processing audio: {e}")
```

### Health Checks
```bash
# Check LiveKit server
curl http://localhost:7880/health

# Check backend
curl http://localhost:8000/livekit/health
```

## Security Considerations

### 1. Token-based Authentication
- LiveKit uses JWT tokens for authentication
- Tokens include room and participant permissions
- Tokens expire after a configurable time

### 2. Media Encryption
- WebRTC provides end-to-end encryption
- Media streams are encrypted in transit
- No media data stored on server

### 3. API Security
- Backend validates all requests
- User authentication required
- Rate limiting and monitoring

## Performance Optimization

### 1. Media Quality
- Adaptive bitrate streaming
- Simulcast for video
- Audio optimization for voice

### 2. Network Efficiency
- WebRTC's efficient protocols
- Minimal server processing
- Client-side media handling

### 3. AI Processing
- Streaming responses
- Context management
- Efficient token usage

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check LiveKit server URL
   - Verify API credentials
   - Check network connectivity

2. **Audio Not Working**
   - Check microphone permissions
   - Verify audio settings
   - Test with browser audio tools

3. **Screen Share Issues**
   - Check screen share permissions
   - Verify video settings
   - Test with different browsers

4. **AI Not Responding**
   - Check Gemini API key
   - Verify backend logs
   - Test AI session creation

### Debug Commands

```bash
# Check LiveKit server status
livekit-server --version

# Monitor backend logs
tail -f backend/logs/app.log

# Test WebRTC connectivity
curl -I https://your-livekit-server.com/health
```

## Migration from WebSocket

### Changes Required

1. **Frontend Services**
   - Replace `websocketService.ts` with `livekitService.ts`
   - Update component imports
   - Modify event handlers

2. **Backend Routes**
   - Add LiveKit routes
   - Update WebSocket handlers
   - Modify session management

3. **Configuration**
   - Add LiveKit environment variables
   - Update API endpoints
   - Modify authentication flow

### Benefits of Migration

- **Better Performance**: WebRTC vs WebSocket
- **Enhanced Features**: Built-in media handling
- **Improved Scalability**: LiveKit's architecture
- **Better UX**: Real-time audio/video
- **Easier Development**: Simplified media APIs

## Future Enhancements

### 1. Advanced Features
- Multi-party conversations
- Recording capabilities
- Analytics dashboard
- Custom AI models

### 2. Integration Options
- Slack/Discord bots
- Mobile applications
- Browser extensions
- API integrations

### 3. AI Improvements
- Custom training data
- Domain-specific models
- Multi-language support
- Advanced context management

## Conclusion

The LiveKit + Gemini architecture provides a robust foundation for building scalable, real-time voice AI applications. By leveraging WebRTC for media transport and Gemini for AI intelligence, this solution delivers:

- **Ultra-low latency** voice interactions
- **True multimodal** AI capabilities
- **Scalable** infrastructure
- **Developer-friendly** APIs
- **Production-ready** security

This architecture is well-positioned to support the growth of voice AI applications and provides a solid foundation for future enhancements and integrations. 