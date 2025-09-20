@echo off
REM LiveKit + Gemini Voice AI Assistant Setup Script for Windows
REM This script helps you set up the new architecture quickly

echo 🚀 Setting up LiveKit + Gemini Voice AI Assistant...

REM Check if required tools are installed
echo [INFO] Checking dependencies...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.12+ is not installed. Please install Python first.
    exit /b 1
)

REM Check pip
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pip is not installed. Please install pip first.
    exit /b 1
)

echo [SUCCESS] All dependencies are installed

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)
npm install
echo [SUCCESS] Frontend dependencies installed

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
if not exist "backend\pyproject.toml" (
    echo [ERROR] backend\pyproject.toml not found. Please run this script from the project root.
    exit /b 1
)
cd backend
pip install -e .
cd ..
echo [SUCCESS] Backend dependencies installed

REM Setup environment variables
echo [INFO] Setting up environment variables...

REM Create .env file if it doesn't exist
if not exist ".env" (
    (
        echo # LiveKit Configuration
        echo LIVEKIT_URL=ws://localhost:7880
        echo LIVEKIT_API_KEY=your-livekit-api-key
        echo LIVEKIT_API_SECRET=your-livekit-api-secret
        echo.
        echo # Gemini Configuration
        echo GEMINI_API_KEY=your-gemini-api-key
        echo.
        echo # Backend Configuration
        echo SECRET_KEY=your-secret-key-here
        echo DEBUG=true
        echo HOST=0.0.0.0
        echo PORT=8000
        echo.
        echo # Database Configuration ^(optional^)
        echo DATABASE_URL=postgresql://user:password@localhost:5432/voice_ai
        echo REDIS_URL=redis://localhost:6379
    ) > .env
    echo [SUCCESS] Created .env file
) else (
    echo [WARNING] .env file already exists. Please update it manually with your API keys.
)

REM Create backend .env file
if not exist "backend\.env" (
    (
        echo # LiveKit Configuration
        echo LIVEKIT_URL=ws://localhost:7880
        echo LIVEKIT_API_KEY=your-livekit-api-key
        echo LIVEKIT_API_SECRET=your-livekit-api-secret
        echo.
        echo # Gemini Configuration
        echo GEMINI_API_KEY=your-gemini-api-key
        echo.
        echo # Backend Configuration
        echo SECRET_KEY=your-secret-key-here
        echo DEBUG=true
        echo HOST=0.0.0.0
        echo PORT=8000
        echo.
        echo # Database Configuration ^(optional^)
        echo DATABASE_URL=postgresql://user:password@localhost:5432/voice_ai
        echo REDIS_URL=redis://localhost:6379
    ) > backend\.env
    echo [SUCCESS] Created backend\.env file
) else (
    echo [WARNING] backend\.env file already exists. Please update it manually with your API keys.
)

REM Create startup scripts
echo [INFO] Creating startup scripts...

REM Frontend startup script
(
    echo @echo off
    echo echo Starting frontend development server...
    echo npm run dev
) > start-frontend.bat

REM Backend startup script
(
    echo @echo off
    echo echo Starting backend server...
    echo cd backend
    echo uvicorn src.realtime_assistant_service.main:app --reload --host 0.0.0.0 --port 8000
) > start-backend.bat

REM LiveKit startup script
(
    echo @echo off
    echo echo Starting LiveKit Server...
    echo echo Please install LiveKit Server manually from https://get.livekit.io
    echo echo Then run: livekit-server --dev
    echo pause
) > start-livekit.bat

REM Combined startup script
(
    echo @echo off
    echo echo Starting all services...
    echo echo.
    echo echo Please start services manually:
    echo echo 1. Start LiveKit Server: livekit-server --dev
    echo echo 2. Start Backend: start-backend.bat
    echo echo 3. Start Frontend: start-frontend.bat
    echo echo.
    echo pause
) > start-all.bat

echo [SUCCESS] Startup scripts created

REM Create configuration guide
echo [INFO] Creating configuration guide...

(
    echo # Configuration Guide
    echo.
    echo ## Required API Keys
    echo.
    echo ### 1. LiveKit API Keys
    echo 1. Sign up at https://cloud.livekit.io
    echo 2. Create a new project
    echo 3. Get your API key and secret
    echo 4. Update `.env` and `backend\.env` files
    echo.
    echo ### 2. Gemini API Key
    echo 1. Go to https://makersuite.google.com/app/apikey
    echo 2. Create a new API key
    echo 3. Update `.env` and `backend\.env` files
    echo.
    echo ## Environment Variables
    echo.
    echo Update the following files with your API keys:
    echo.
    echo ### Frontend ^(.env^)
    echo ```env
    echo LIVEKIT_URL=ws://localhost:7880
    echo LIVEKIT_API_KEY=your-livekit-api-key
    echo LIVEKIT_API_SECRET=your-livekit-api-secret
    echo ```
    echo.
    echo ### Backend ^(backend\.env^)
    echo ```env
    echo LIVEKIT_URL=ws://localhost:7880
    echo LIVEKIT_API_KEY=your-livekit-api-key
    echo LIVEKIT_API_SECRET=your-livekit-api-secret
    echo GEMINI_API_KEY=your-gemini-api-key
    echo SECRET_KEY=your-secret-key-here
    echo ```
    echo.
    echo ## Starting the Application
    echo.
    echo ### Option 1: Start All Services
    echo ```cmd
    echo start-all.bat
    echo ```
    echo.
    echo ### Option 2: Start Services Individually
    echo ```cmd
    echo REM Terminal 1: Start LiveKit Server
    echo start-livekit.bat
    echo.
    echo REM Terminal 2: Start Backend
    echo start-backend.bat
    echo.
    echo REM Terminal 3: Start Frontend
    echo start-frontend.bat
    echo ```
    echo.
    echo ## Access Points
    echo.
    echo - **Frontend**: http://localhost:5173
    echo - **Backend API**: http://localhost:8000
    echo - **API Documentation**: http://localhost:8000/docs
    echo - **LiveKit Server**: ws://localhost:7880
    echo.
    echo ## Testing
    echo.
    echo 1. Open http://localhost:5173 in your browser
    echo 2. Login with any credentials ^(demo mode^)
    echo 3. Navigate to Voice AI Assistant
    echo 4. Start audio capture and screen sharing
    echo 5. Begin voice interaction with AI
    echo.
    echo ## Troubleshooting
    echo.
    echo ### Common Issues
    echo.
    echo 1. **LiveKit Connection Failed**
    echo    - Check if LiveKit server is running
    echo    - Verify API keys in .env files
    echo    - Check network connectivity
    echo.
    echo 2. **Audio Not Working**
    echo    - Check browser microphone permissions
    echo    - Verify audio settings in browser
    echo    - Test with browser audio tools
    echo.
    echo 3. **AI Not Responding**
    echo    - Check Gemini API key
    echo    - Verify backend logs
    echo    - Test API endpoints
    echo.
    echo ### Debug Commands
    echo.
    echo ```cmd
    echo REM Check LiveKit server
    echo curl http://localhost:7880/health
    echo.
    echo REM Check backend
    echo curl http://localhost:8000/livekit/health
    echo.
    echo REM Check frontend
    echo curl http://localhost:5173
    echo ```
) > CONFIGURATION_GUIDE.md

echo [SUCCESS] Configuration guide created

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update .env files with your API keys
echo 2. Read CONFIGURATION_GUIDE.md for detailed instructions
echo 3. Run 'start-all.bat' to start all services
echo.
echo 📚 Documentation:
echo - LIVEKIT_INTEGRATION.md - Architecture overview
echo - CONFIGURATION_GUIDE.md - Setup instructions
echo.
echo 🚀 Happy coding!
pause 