#!/usr/bin/env python3
"""
Voice AI Assistant Demo Launcher

This script starts both the backend server and the chat demo in one command.
"""

import asyncio
import subprocess
import sys
import time
import os
from pathlib import Path


def setup_environment():
    """Set up environment variables for the demo."""
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
    
    for key, value in env_vars.items():
        os.environ[key] = value
    
    print("✅ Environment configured")


def start_backend():
    """Start the backend server in a subprocess."""
    print("🚀 Starting Voice AI Assistant Backend...")
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    main_script = project_root / "main.py"
    
    if not main_script.exists():
        print(f"❌ Backend script not found: {main_script}")
        return None
    
    try:
        # Start the backend server
        process = subprocess.Popen([
            sys.executable, str(main_script)
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Backend server started")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None


def wait_for_backend():
    """Wait for the backend server to be ready."""
    print("⏳ Waiting for backend server to start...")
    
    import requests
    
    for i in range(30):  # Wait up to 30 seconds
        try:
            response = requests.get("http://localhost:8000/", timeout=2)
            if response.status_code == 200:
                print("✅ Backend server is ready!")
                return True
        except:
            pass
        
        time.sleep(1)
        if i % 5 == 0:
            print(f"⏳ Still waiting... ({i+1}/30)")
    
    print("❌ Backend server failed to start")
    return False


def start_chat_demo():
    """Start the chat demo."""
    print("🎤 Starting Voice AI Assistant Chat Demo...")
    
    chat_script = Path(__file__).parent / "voice_agent_chat.py"
    
    if not chat_script.exists():
        print(f"❌ Chat demo script not found: {chat_script}")
        return None
    
    try:
        # Start the chat demo
        process = subprocess.Popen([
            sys.executable, str(chat_script)
        ], stdin=sys.stdin, stdout=sys.stdout, stderr=sys.stderr)
        
        print("✅ Chat demo started")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start chat demo: {e}")
        return None


def main():
    """Main function to run the complete demo."""
    print("🎤 Voice AI Assistant Demo Launcher")
    print("="*50)
    print("This will start both the backend server and chat demo.")
    print("Press Ctrl+C to stop everything.")
    print("="*50)
    
    # Setup environment
    setup_environment()
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start backend")
        return
    
    # Wait for backend to be ready
    if not wait_for_backend():
        print("❌ Backend server failed to start")
        backend_process.terminate()
        return
    
    # Give backend a moment to fully initialize
    time.sleep(2)
    
    # Start chat demo
    chat_process = start_chat_demo()
    if not chat_process:
        print("❌ Failed to start chat demo")
        backend_process.terminate()
        return
    
    try:
        # Wait for chat demo to finish
        chat_process.wait()
        
    except KeyboardInterrupt:
        print("\n⏹️  Stopping demo...")
        
    finally:
        # Clean up processes
        if chat_process:
            chat_process.terminate()
        if backend_process:
            backend_process.terminate()
        
        print("👋 Demo stopped")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Demo stopped by user")
    except Exception as e:
        print(f"❌ Demo error: {e}") 