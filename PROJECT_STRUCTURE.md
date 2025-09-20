# Clean Project Structure

This document outlines the cleaned-up project structure after removing unnecessary files and implementing the LiveKit + Gemini architecture.

## 📁 Project Structure

```
Cloudy/
├── 📁 components/                    # React components
│   ├── VoiceAgentPage.tsx           # New LiveKit-based voice interface
│   ├── ChatInterface.tsx            # Text-based chat interface
│   ├── Header.tsx                   # Application header
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── LandingPage.tsx              # Landing page
│   ├── LoginPage.tsx                # Authentication page
│   ├── SettingsPage.tsx             # Settings interface
│   ├── BillingPage.tsx              # Billing interface
│   ├── Message.tsx                  # Message component
│   └── icons.tsx                    # Icon components
│
├── 📁 services/                     # Frontend services
│   ├── livekitService.ts            # LiveKit client service
│   ├── apiService.ts                # REST API service
│   └── geminiService.ts             # Gemini API service
│
├── 📁 config/                       # Configuration files
│   └── livekit.ts                   # LiveKit configuration
│
├── 📁 backend/                      # Backend application
│   ├── 📁 src/realtime_assistant_service/
│   │   ├── 📁 api/                  # API routes
│   │   │   ├── rest_routes.py       # General REST endpoints
│   │   │   └── livekit_routes.py    # LiveKit-specific endpoints
│   │   ├── 📁 connectors/           # External service connectors
│   │   │   ├── livekit_connector.py # LiveKit server connector
│   │   │   └── gemini_live.py       # Gemini API connector
│   │   ├── 📁 core/                 # Core functionality
│   │   │   ├── config.py            # Configuration settings
│   │   │   └── logging_config.py    # Logging configuration
│   │   ├── 📁 models/               # Data models
│   │   │   └── schemas.py           # Pydantic schemas
│   │   └── main.py                  # FastAPI application
│   ├── pyproject.toml               # Python dependencies
│   └── README.md                    # Backend documentation
│
├── 📄 App.tsx                       # Main React application
├── 📄 index.tsx                     # React entry point
├── 📄 index.html                    # HTML template
├── 📄 package.json                  # Frontend dependencies
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vite.config.ts                # Vite configuration
├── 📄 types.ts                      # TypeScript type definitions
├── 📄 vite-env.d.ts                 # Vite environment types
├── 📄 metadata.json                 # Application metadata
│
├── 📄 LIVEKIT_INTEGRATION.md        # Architecture documentation
├── 📄 setup-livekit.sh              # Linux/Mac setup script
├── 📄 setup-livekit.bat             # Windows setup script
├── 📄 README.md                     # Project documentation
└── 📄 .gitignore                    # Git ignore rules
```

## 🗑️ Removed Files

### Old Documentation
- `JSON_FIX_SUMMARY.md` - Old JSON serialization fixes
- `setup.md` - Old setup instructions
- `DEBUG.md` - Old debugging notes
- `INTEGRATION.md` - Old integration documentation
- `test_websocket_client.html` - Old WebSocket test client
- `test-integration.js` - Old integration tests

### Old Services (Replaced by LiveKit)
- `services/websocketService.ts` - WebSocket service
- `services/audioService.ts` - Audio handling service
- `services/screenCaptureService.ts` - Screen capture service
- `services/webrtcService.ts` - WebRTC service

### Old Backend Files
- `backend/src/realtime_assistant_service/connectors/mock_connector.py` - Mock connector
- `backend/src/realtime_assistant_service/api/websocket_routes.py` - WebSocket routes

### Old Configuration
- `config.ts` - Old configuration file

## ✅ Current Architecture

### Frontend
- **LiveKit Client**: Real-time media streaming
- **React Components**: Modern UI with voice controls
- **Configuration**: Centralized LiveKit settings

### Backend
- **LiveKit Connector**: Room management and media processing
- **Gemini Connector**: AI processing and responses
- **REST API**: Room and session management
- **FastAPI**: Modern async web framework

### Key Features
- ✅ Ultra-low latency WebRTC media streaming
- ✅ Real-time audio/video capture and playback
- ✅ Screen sharing capabilities
- ✅ AI-powered voice interactions
- ✅ Scalable architecture
- ✅ Production-ready security

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   pip install -e .
   ```

2. **Configure API Keys**:
   - Add LiveKit API keys to `.env` and `backend/.env`
   - Add Gemini API key to `backend/.env`

3. **Start Services**:
   ```bash
   # Option 1: Use setup script
   ./setup-livekit.bat  # Windows
   ./setup-livekit.sh   # Linux/Mac
   
   # Option 2: Start manually
   npm run dev          # Frontend
   cd backend && uvicorn src.realtime_assistant_service.main:app --reload  # Backend
   livekit-server --dev # LiveKit Server
   ```

## 📚 Documentation

- `LIVEKIT_INTEGRATION.md` - Complete architecture overview
- `README.md` - Project overview and setup
- `CONFIGURATION_GUIDE.md` - Detailed configuration instructions

## 🔧 Development

The project is now clean and focused on the LiveKit + Gemini architecture, with all unnecessary files removed and dependencies optimized for the new implementation. 