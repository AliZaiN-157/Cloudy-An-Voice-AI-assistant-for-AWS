# Cloudy WebRTC Server

This is the backend server for Cloudy's AI voice assistant that handles WebRTC connections, audio processing, and AI integration.

## Features

- WebRTC signaling server for real-time voice communication
- Socket.IO for real-time messaging
- Google Gemini AI integration
- Audio stream processing (simulated)
- CORS support for cross-origin requests

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the server directory with:
   ```
   API_KEY=your_google_gemini_api_key
   CLIENT_URL=http://localhost:5173
   PORT=3001
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /health` - Health check endpoint

## WebSocket Events

### Client to Server:
- `offer` - WebRTC offer for establishing connection
- `ice-candidate` - ICE candidate for WebRTC connection
- `voice-message` - Text message from user

### Server to Client:
- `answer` - WebRTC answer for establishing connection
- `ice-candidate` - ICE candidate from server
- `ai-response` - AI response with text
- `error` - Error message

## Architecture

The server acts as a WebRTC signaling server and AI processor:

1. **Connection Setup**: Client sends WebRTC offer, server responds with answer
2. **Audio Streaming**: Client streams audio to server via WebRTC
3. **AI Processing**: Server processes audio/text with Google Gemini AI
4. **Response**: Server sends AI response back to client

## Development Notes

- Currently simulates WebRTC connection (no actual audio streaming)
- Uses Google Gemini for AI responses
- Supports multiple concurrent connections
- Includes proper cleanup on disconnection
- **Note**: This is a simplified implementation for demonstration purposes

## Next Steps

To make this production-ready, you would need to:

1. Integrate a real speech-to-text service (Google Speech-to-Text, Azure Speech, etc.)
2. Integrate a text-to-speech service (Google Text-to-Speech, Azure Speech, etc.)
3. Add proper audio stream processing
4. Add authentication and rate limiting
5. Add error handling and retry logic
6. Add logging and monitoring 