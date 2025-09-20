#!/bin/bash

# LiveKit + Gemini Voice AI Assistant Setup Script
# This script helps you set up the new architecture quickly

set -e

echo "🚀 Setting up LiveKit + Gemini Voice AI Assistant..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3.12+ is not installed. Please install Python first."
        exit 1
    fi
    
    # Check pip
    if ! command -v pip &> /dev/null; then
        print_error "pip is not installed. Please install pip first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    print_success "Frontend dependencies installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    if [ ! -f "backend/pyproject.toml" ]; then
        print_error "backend/pyproject.toml not found. Please run this script from the project root."
        exit 1
    fi
    
    cd backend
    pip install -e .
    cd ..
    print_success "Backend dependencies installed"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# LiveKit Configuration
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Gemini Configuration
GEMINI_API_KEY=your-gemini-api-key

# Backend Configuration
SECRET_KEY=your-secret-key-here
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Database Configuration (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/voice_ai
REDIS_URL=redis://localhost:6379
EOF
        print_success "Created .env file"
    else
        print_warning ".env file already exists. Please update it manually with your API keys."
    fi
    
    # Create backend .env file
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# LiveKit Configuration
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Gemini Configuration
GEMINI_API_KEY=your-gemini-api-key

# Backend Configuration
SECRET_KEY=your-secret-key-here
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Database Configuration (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/voice_ai
REDIS_URL=redis://localhost:6379
EOF
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env file already exists. Please update it manually with your API keys."
    fi
}

# Setup LiveKit Server
setup_livekit() {
    print_status "Setting up LiveKit Server..."
    
    # Check if LiveKit is already installed
    if command -v livekit-server &> /dev/null; then
        print_success "LiveKit Server is already installed"
    else
        print_status "Installing LiveKit Server..."
        curl -sSL https://get.livekit.io | bash
        print_success "LiveKit Server installed"
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Frontend startup script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Starting frontend development server..."
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Backend startup script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Starting backend server..."
cd backend
uvicorn src.realtime_assistant_service.main:app --reload --host 0.0.0.0 --port 8000
EOF
    chmod +x start-backend.sh
    
    # LiveKit startup script
    cat > start-livekit.sh << 'EOF'
#!/bin/bash
echo "Starting LiveKit Server..."
livekit-server --dev
EOF
    chmod +x start-livekit.sh
    
    # Combined startup script
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "Starting all services..."

# Start LiveKit Server in background
echo "Starting LiveKit Server..."
./start-livekit.sh &
LIVEKIT_PID=$!

# Wait for LiveKit to start
sleep 5

# Start Backend in background
echo "Starting Backend..."
./start-backend.sh &
BACKEND_PID=$!

# Wait for Backend to start
sleep 5

# Start Frontend
echo "Starting Frontend..."
./start-frontend.sh &
FRONTEND_PID=$!

# Wait for all processes
wait $LIVEKIT_PID $BACKEND_PID $FRONTEND_PID
EOF
    chmod +x start-all.sh
    
    print_success "Startup scripts created"
}

# Create configuration guide
create_config_guide() {
    print_status "Creating configuration guide..."
    
    cat > CONFIGURATION_GUIDE.md << 'EOF'
# Configuration Guide

## Required API Keys

### 1. LiveKit API Keys
1. Sign up at https://cloud.livekit.io
2. Create a new project
3. Get your API key and secret
4. Update `.env` and `backend/.env` files

### 2. Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Update `.env` and `backend/.env` files

## Environment Variables

Update the following files with your API keys:

### Frontend (.env)
```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### Backend (backend/.env)
```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=your-secret-key-here
```

## Starting the Application

### Option 1: Start All Services
```bash
./start-all.sh
```

### Option 2: Start Services Individually
```bash
# Terminal 1: Start LiveKit Server
./start-livekit.sh

# Terminal 2: Start Backend
./start-backend.sh

# Terminal 3: Start Frontend
./start-frontend.sh
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **LiveKit Server**: ws://localhost:7880

## Testing

1. Open http://localhost:5173 in your browser
2. Login with any credentials (demo mode)
3. Navigate to Voice AI Assistant
4. Start audio capture and screen sharing
5. Begin voice interaction with AI

## Troubleshooting

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
EOF
    
    print_success "Configuration guide created"
}

# Main setup function
main() {
    echo "🎯 LiveKit + Gemini Voice AI Assistant Setup"
    echo "=============================================="
    
    check_dependencies
    install_frontend_deps
    install_backend_deps
    setup_env
    setup_livekit
    create_startup_scripts
    create_config_guide
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update .env files with your API keys"
    echo "2. Read CONFIGURATION_GUIDE.md for detailed instructions"
    echo "3. Run './start-all.sh' to start all services"
    echo ""
    echo "📚 Documentation:"
    echo "- LIVEKIT_INTEGRATION.md - Architecture overview"
    echo "- CONFIGURATION_GUIDE.md - Setup instructions"
    echo ""
    echo "🚀 Happy coding!"
}

# Run main function
main "$@" 