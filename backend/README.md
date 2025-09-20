# Real-time Voice AI Assistant Backend with LiveKit

A FastAPI-based backend service for a real-time voice AI assistant that provides step-by-step guidance through screen content analysis and natural language interaction, powered by LiveKit for real-time media streaming.

## Features

- **LiveKit Integration**: Real-time media streaming with LiveKit for voice and video communication
- **Gemini Live API Integration**: Leverages Google's Gemini Live API for STT, TTS, LLM, and VLM capabilities
- **Screen Content Analysis**: Analyzes screen share frames to provide contextual guidance
- **Voice Activity Detection**: Built-in VAD for natural conversation flow
- **Authentication & Authorization**: JWT-based user authentication and session management
- **Structured Logging**: Comprehensive logging with loguru
- **Health Monitoring**: Built-in health checks and metrics endpoints
- **CORS Support**: Configurable CORS for frontend integration
- **Error-Driven Silence**: Robust error handling that defaults to silence rather than speculative responses

## Architecture

The backend follows a microservices-oriented, event-driven architecture:

```
Client <-> WebSocket API <-> FastAPI Service <-> Gemini Live API
                |
                v
            Database (Session History)
```

### Core Components

1. **Real-time Ingestion & Response Service (FastAPI)**: Handles WebSocket connections and proxies data to Gemini Live API
2. **Gemini Live API Integration**: Provides STT, TTS, LLM, VLM, and VAD capabilities
3. **Authentication Service**: JWT-based user authentication and session management
4. **Database Layer**: Stores user profiles, session history, and configuration
5. **Monitoring & Logging**: Structured logging and health monitoring

## Quick Start

### Prerequisites

- Python 3.12+
- Google Gemini API key
- (Optional) PostgreSQL database
- (Optional) Redis for session management

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -e .
   ```

3. **Set up environment variables**:
   ```bash
   cp config/env.development .env
   # Edit .env with your actual values
   ```

4. **Configure your Gemini API key**:
   ```bash
   # In your .env file
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

5. **Run the development server**:
   ```bash
   python main.py
   ```

The server will start on `http://localhost:8000` with the following endpoints:

- **LiveKit WebSocket**: `ws://localhost:8000/ws/livekit`
- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`
- **LiveKit Token API**: `http://localhost:8000/api/v1/livekit/token`

## API Documentation

### LiveKit WebSocket API

The LiveKit WebSocket endpoint (`/ws/livekit`) handles real-time communication with the following message types:

#### Client to Server Messages

**Start Session**:
```json
{
  "action": "start_session",
  "userId": "user123",
  "sessionId": "session456",
  "config": {
    "model": "gemini-1.5-flash",
    "language": "en"
  }
}
```

**Audio Input**:
```json
{
  "action": "audio_input",
  "sessionId": "session456",
  "data": "base64_encoded_audio_chunk",
  "format": "wav",
  "sample_rate": 16000,
  "channels": 1
}
```

**Screen Share Frame**:
```json
{
  "action": "screen_share_frame",
  "sessionId": "session456",
  "data": "base64_encoded_image_frame",
  "format": "png",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**End Session**:
```json
{
  "action": "end_session",
  "sessionId": "session456"
}
```

#### Server to Client Messages

**Text Response**:
```json
{
  "action": "text_response",
  "sessionId": "session456",
  "text": "I can see you're working on a spreadsheet. Let me help you with that.",
  "confidence": 0.95
}
```

**Audio Output**:
```json
{
  "action": "audio_output",
  "sessionId": "session456",
  "data": "base64_encoded_audio_response",
  "format": "wav",
  "sample_rate": 16000,
  "channels": 1
}
```

**Error Message**:
```json
{
  "action": "error",
  "sessionId": "session456",
  "code": "AUDIO_PROCESSING_ERROR",
  "message": "Failed to process audio input",
  "details": {}
}
```

### REST API

#### Authentication

**Register User**:
```bash
POST /api/v1/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword",
  "full_name": "Test User"
}
```

**Login**:
```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "securepassword"
}
```

#### Session Management

**Get Session History**:
```bash
GET /api/v1/sessions/{session_id}/history
Authorization: Bearer <token>
```

**List User Sessions**:
```bash
GET /api/v1/sessions
Authorization: Bearer <token>
```

#### Health & Monitoring

**Health Check**:
```bash
GET /health
```

**Metrics**:
```bash
GET /api/v1/metrics
```

## Configuration

The application uses environment variables for configuration. Key settings include:

### Required Settings

- `GEMINI_API_KEY`: Your Google Gemini API key
- `SECRET_KEY`: JWT secret key for authentication

### Optional Settings

- `DEBUG`: Enable debug mode (default: false)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `LOG_LEVEL`: Logging level (default: INFO)

See `config/env.development` and `config/env.production` for complete configuration examples.

## Development

### Project Structure

```
backend/
├── src/
│   └── realtime_assistant_service/
│       ├── main.py                 # FastAPI application
│       ├── api/                    # API routes
│       │   ├── websocket_routes.py # WebSocket endpoints
│       │   └── rest_routes.py      # REST endpoints
│       ├── core/                   # Core functionality
│       │   ├── config.py          # Configuration
│       │   └── logging_config.py  # Logging setup
│       ├── connectors/            # External integrations
│       │   └── gemini_live.py     # Gemini Live API connector
│       └── models/                # Pydantic models
│           └── schemas.py         # Data schemas
├── config/                        # Configuration files
├── tests/                         # Test files
├── main.py                        # Entry point
└── pyproject.toml                 # Project configuration
```

### Running Tests

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run with coverage
pytest --cov=src
```

### Code Quality

```bash
# Format code
black src/

# Sort imports
isort src/

# Lint code
flake8 src/

# Type checking
mypy src/
```

## Deployment

### Docker Deployment

1. **Build the image**:
   ```bash
   docker build -t voice-assistant-backend .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8000:8000 \
     -e GEMINI_API_KEY=your_key \
     -e SECRET_KEY=your_secret \
     voice-assistant-backend
   ```

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **Database**: Configure PostgreSQL for session persistence
3. **Redis**: Set up Redis for session management
4. **Load Balancer**: Use a load balancer for WebSocket connections
5. **Monitoring**: Set up monitoring and alerting
6. **SSL/TLS**: Configure SSL certificates for production
7. **Rate Limiting**: Implement rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**:
   - Check CORS configuration
   - Verify WebSocket endpoint URL
   - Ensure proper message format

2. **Gemini API Errors**:
   - Verify API key is valid
   - Check API quota limits
   - Ensure proper audio/image format

3. **Authentication Errors**:
   - Verify JWT token format
   - Check token expiration
   - Ensure proper Authorization header

### Logs

The application uses structured logging with loguru. Logs are written to:
- Console (development)
- `logs/app.log` (production)
- `logs/error.log` (errors only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the logs for error details
