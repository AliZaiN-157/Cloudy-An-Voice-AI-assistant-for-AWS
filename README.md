# Cloudy - AI Voice Assistant for AWS

A modern AI assistant for AWS services with real-time voice conversation capabilities.

## Features

- 🤖 **AI Chat Interface** - Ask questions about AWS services
- 🎤 **Voice Agent** - Real-time voice conversation with WebRTC
- 📊 **Billing Dashboard** - Monitor AWS costs
- ⚙️ **Settings Management** - Configure your preferences
- 🎯 **Screen Context** - AI can see and analyze your AWS console

## Voice Agent with WebRTC

Cloudy now features a real-time voice conversation system using WebRTC technology:

- **Real-time Audio Streaming** - Low-latency voice communication
- **AI Voice Responses** - Cloudy speaks back to you naturally
- **Screen Context Awareness** - AI can see your AWS console while talking
- **Conversation History** - View your voice interactions
- **Cross-platform Support** - Works on Chrome, Edge, Safari, and Firefox

## Quick Start

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Set the API_KEY in .env.local to your Gemini API key
# Run the app
npm run dev
```

### 2. Backend Setup (for Voice Agent)

```bash
# Navigate to server directory
cd server

# Run setup script
node setup.js

# Update API_KEY in .env with your Google Gemini API key
# Then start the server
npm start
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini API Key
API_KEY=your_google_gemini_api_key_here

# WebRTC Server URL (optional, defaults to localhost:3001)
VITE_WEBRTC_SERVER_URL=http://localhost:3001
```

## Usage

1. **Chat Interface**: Ask questions about AWS services in the chat
2. **Voice Agent**: Click "Start Session" to begin voice conversation
3. **Screen Sharing**: Allow screen sharing for context-aware responses
4. **Real-time Conversation**: Speak naturally with Cloudy about AWS

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.IO
- **AI**: Google Gemini API
- **Voice**: WebRTC for real-time audio streaming
- **Styling**: Tailwind CSS

## Development

### Frontend
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

### Backend
```bash
cd server
npm run dev    # Start with auto-restart
npm start      # Start production server
```

## Browser Support

The Voice Agent requires a modern browser with WebRTC support:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Troubleshooting

### Voice Agent Issues
1. **Microphone not working**: Check browser permissions
2. **Connection failed**: Ensure the backend server is running
3. **API errors**: Verify your Google Gemini API key is correct

### Common Issues
- **CORS errors**: Make sure the backend server is running on the correct port
- **WebRTC connection failed**: Check firewall settings and network connectivity
- **Audio not playing**: Ensure browser audio permissions are granted
