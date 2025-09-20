#!/usr/bin/env python3
"""
Start Backend Server Script

This script starts the Voice AI Assistant backend server with proper configuration.
"""

import os
import sys
import subprocess
import time
from pathlib import Path


def setup_environment():
    """Set up environment variables for development."""
    env_vars = {
        "DEBUG": "true",
        "HOST": "0.0.0.0",
        "PORT": "8000",
        "GEMINI_API_KEY": "AIzaSyBLGahuzLlYLMTS7sQrY8-aJW7MvW5KfuM",  # Demo key
        "SECRET_KEY": "cloudySaaS",
        "LIVEKIT_API_KEY": "demo_key",
        "LIVEKIT_API_SECRET": "demo_secret",
        "LIVEKIT_URL": "ws://localhost:7880",
        "LOG_LEVEL": "DEBUG"
    }
    
    # Set environment variables
    for key, value in env_vars.items():
        os.environ[key] = value
    
    print("✅ Environment variables set")


def check_dependencies():
    """Check if required dependencies are installed."""
    required_packages = [
        "fastapi",
        "uvicorn",
        "websockets",
        "google-generativeai",
        "loguru",
        "pydantic",
        "pydantic-settings",
        "python-jose",
        "passlib",
        "jwt"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        for package in missing_packages:
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", 
                    package, "--user"
                ])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package}")
                return False
    
    print("✅ All dependencies are available")
    return True


def start_server():
    """Start the FastAPI server."""
    print("🚀 Starting Voice AI Assistant Backend Server...")
    print("="*50)
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    main_script = project_root / "main.py"
    
    if not main_script.exists():
        print(f"❌ Main script not found at {main_script}")
        return False
    
    try:
        # Change to project root directory
        os.chdir(project_root)
        
        # Start the server
        print(f"📁 Working directory: {os.getcwd()}")
        print(f"🐍 Python executable: {sys.executable}")
        print(f"📄 Main script: {main_script}")
        
        # Run the server
        process = subprocess.Popen([
            sys.executable, str(main_script)
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Server started successfully!")
        print("🌐 Server URL: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
        print("🔌 WebSocket: ws://localhost:8000/ws/livekit")
        print("="*50)
        print("Press Ctrl+C to stop the server")
        print("="*50)
        
        # Stream output
        for line in process.stdout:
            print(line.rstrip())
        
        return True
        
    except KeyboardInterrupt:
        print("\n⏹️  Stopping server...")
        if process:
            process.terminate()
        return True
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False


def main():
    """Main function."""
    print("🎤 Voice AI Assistant Backend Starter")
    print("="*40)
    
    # Setup environment
    setup_environment()
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Failed to install dependencies")
        return
    
    # Start server
    if not start_server():
        print("❌ Failed to start server")
        return
    
    print("✅ Backend server setup complete!")


if __name__ == "__main__":
    main() 