# Cloudy - Voice AI Assistant

A real-time voice AI assistant built with LiveKit and Gemini, providing ultra-low latency voice interactions with screen sharing capabilities.

## 🚀 Features

- **Real-time Voice AI**: Natural voice conversations with AI
- **Screen Sharing**: AI can see and guide you through your screen
- **Ultra-low Latency**: WebRTC-based media streaming via LiveKit
- **Multimodal AI**: Gemini Live API for voice, vision, and text processing
- **Modern UI**: React-based interface with real-time controls
- **Scalable Architecture**: Production-ready backend with FastAPI

## 🏗️ Architecture

```
Frontend (React) → LiveKit Client → LiveKit Server → Backend (FastAPI) → Gemini API
```

### Key Components

- **LiveKit**: WebRTC media streaming and room management
- **Gemini Live API**: Multimodal AI processing (STT, VAD, VLM, LLM, TTS)
- **FastAPI**: Modern async backend with REST API
- **React**: Frontend with real-time voice controls

## 📦 Installation

### Prerequisites

- Node.js 18+
- Python 3.12+
- LiveKit API credentials
- Gemini API key

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Cloudy
   ```

2. **Run the setup script**:
   ```bash
   # Windows
   ./setup-livekit.bat
   
   # Linux/Mac
   ./setup-livekit.sh
   ```

3. **Configure API keys**:
   - Get LiveKit API keys from https://cloud.livekit.io
   - Get Gemini API key from https://makersuite.google.com/app/apikey
   - Update `.env` and `backend/.env` files

4. **Start the application**:
   ```bash
   ./start-all.bat  # Windows
   ./start-all.sh   # Linux/Mac
   ```

## 🔧 Manual Setup

### Frontend Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd backend
pip install -e .
```

### Environment Variables

Create `.env` in project root:
```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

Create `backend/.env`:
```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=your-secret-key-here
```

## 🚀 Running the Application

### Option 1: All Services
```bash
./start-all.bat  # Windows
./start-all.sh   # Linux/Mac
```

### Option 2: Individual Services
```bash
# Terminal 1: LiveKit Server
livekit-server --dev

# Terminal 2: Backend
cd backend
uvicorn src.realtime_assistant_service.main:app --reload

# Terminal 3: Frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **LiveKit Server**: ws://localhost:7880

## 📚 Documentation

- [LIVEKIT_INTEGRATION.md](./LIVEKIT_INTEGRATION.md) - Complete architecture overview
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Clean project structure
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) - Detailed setup instructions

## 🎯 Usage

1. Open http://localhost:5173 in your browser
2. Login with any credentials (demo mode)
3. Navigate to "Voice AI Assistant"
4. Start audio capture and screen sharing
5. Begin voice interaction with AI

## 🔍 Troubleshooting

### Common Issues

1. **LiveKit Connection Failed**
   - Check if LiveKit server is running
   - Verify API keys in .env files
   - Check network connectivity

2. **Audio Not Working**
   - Check browser microphone permissions
   - Verify audio settings in browser
   - Test with browser audio tools

3. **AI Not Responding**
   - Check Gemini API key
   - Verify backend logs
   - Test API endpoints

### Debug Commands

```bash
# Check LiveKit server
curl http://localhost:7880/health

# Check backend
curl http://localhost:8000/livekit/health

# Check frontend
curl http://localhost:5173
```

## 🏗️ Development

### Project Structure

```
Cloudy/
├── components/          # React components
├── services/           # Frontend services
├── config/             # Configuration files
├── backend/            # FastAPI backend
├── App.tsx             # Main React app
└── package.json        # Frontend dependencies
```

### Key Files

- `services/livekitService.ts` - LiveKit client service
- `components/VoiceAgentPage.tsx` - Voice AI interface
- `backend/src/realtime_assistant_service/connectors/livekit_connector.py` - LiveKit backend
- `config/livekit.ts` - LiveKit configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io/) - Real-time media infrastructure
- [Google Gemini](https://ai.google.dev/) - Multimodal AI capabilities
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [React](https://reactjs.org/) - Frontend framework
