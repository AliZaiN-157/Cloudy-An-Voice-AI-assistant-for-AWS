#!/usr/bin/env python3
"""
Interactive Voice Agent Chat Demo

This demo allows you to chat with the voice AI assistant through text input,
simulating a voice conversation with the agent running on your LiveKit backend.
"""

import asyncio
import json
import websockets
import uuid
import time
from typing import Dict, Any, Optional
from datetime import datetime
import base64
import os
import sys


class VoiceAgentChat:
    """Interactive chat interface for the Voice AI Assistant."""
    
    def __init__(self, uri: str = "ws://localhost:8000/ws/livekit"):
        self.uri = uri
        self.websocket = None
        self.session_id = None
        self.user_id = f"user_{uuid.uuid4().hex[:8]}"
        self.conversation_history = []
        
    async def connect(self) -> bool:
        """Connect to the LiveKit WebSocket server."""
        try:
            self.websocket = await websockets.connect(self.uri)
            print(f"✅ Connected to Voice AI Assistant at {self.uri}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect: {e}")
            print("Make sure the backend server is running with: python main.py")
            return False
    
    async def start_session(self) -> bool:
        """Start a new chat session with the AI assistant."""
        if not self.websocket:
            print("❌ Not connected to server")
            return False
        
        self.session_id = str(uuid.uuid4())
        message = {
            "action": "start_session",
            "userId": self.user_id,
            "sessionId": self.session_id,
            "config": {
                "model": "gemini-1.5-flash",
                "language": "en",
                "assistant_persona": "helpful_guide"
            }
        }
        
        try:
            await self.websocket.send(json.dumps(message))
            response = await self.websocket.recv()
            response_data = json.loads(response)
            
            if response_data.get("action") == "session_started":
                print("🎉 Session started successfully!")
                livekit_info = response_data.get("livekit", {})
                print(f"📡 LiveKit Room: {livekit_info.get('room_name')}")
                print(f"🔑 Access Token: {livekit_info.get('access_token', '')[:30]}...")
                return True
            else:
                print(f"❌ Failed to start session: {response_data}")
                return False
                
        except Exception as e:
            print(f"❌ Error starting session: {e}")
            return False
    
    async def send_message(self, text: str) -> Optional[Dict[str, Any]]:
        """Send a text message to the AI assistant (simulating voice input)."""
        if not self.websocket or not self.session_id:
            print("❌ No active session")
            return None
        
        # Simulate audio input by encoding text as base64
        audio_data = base64.b64encode(text.encode()).decode()
        
        message = {
            "action": "audio_input",
            "sessionId": self.session_id,
            "data": audio_data,
            "format": "wav",
            "sample_rate": 16000,
            "channels": 1
        }
        
        try:
            await self.websocket.send(json.dumps(message))
            print(f"💬 You: {text}")
            
            # Wait for response
            response = await asyncio.wait_for(self.websocket.recv(), timeout=15.0)
            response_data = json.loads(response)
            
            if response_data.get("action") == "text_response":
                ai_response = response_data.get("text", "No response received")
                print(f"🤖 AI Assistant: {ai_response}")
                
                # Store conversation
                self.conversation_history.append({
                    "timestamp": datetime.now().isoformat(),
                    "user": text,
                    "assistant": ai_response
                })
                
                return response_data
            elif response_data.get("action") == "error":
                print(f"❌ Error: {response_data.get('message', 'Unknown error')}")
                return response_data
            else:
                print(f"📡 Received: {response_data}")
                return response_data
                
        except asyncio.TimeoutError:
            print("⏰ Timeout waiting for response")
            return None
        except Exception as e:
            print(f"❌ Error sending message: {e}")
            return None
    
    async def send_screen_context(self, description: str) -> Optional[Dict[str, Any]]:
        """Send screen context to the AI assistant."""
        if not self.websocket or not self.session_id:
            print("❌ No active session")
            return None
        
        # Simulate screen share by encoding description as base64
        image_data = base64.b64encode(description.encode()).decode()
        
        message = {
            "action": "screen_share_frame",
            "sessionId": self.session_id,
            "data": image_data,
            "format": "png"
        }
        
        try:
            await self.websocket.send(json.dumps(message))
            print(f"🖥️  Screen Context: {description}")
            
            # Wait for response
            response = await asyncio.wait_for(self.websocket.recv(), timeout=15.0)
            response_data = json.loads(response)
            
            if response_data.get("action") == "text_response":
                ai_response = response_data.get("text", "No response received")
                print(f"🤖 AI Assistant: {ai_response}")
                return response_data
            else:
                print(f"📡 Received: {response_data}")
                return response_data
                
        except asyncio.TimeoutError:
            print("⏰ Timeout waiting for response")
            return None
        except Exception as e:
            print(f"❌ Error sending screen context: {e}")
            return None
    
    async def end_session(self) -> bool:
        """End the current chat session."""
        if not self.websocket or not self.session_id:
            print("❌ No active session")
            return False
        
        message = {
            "action": "end_session",
            "sessionId": self.session_id
        }
        
        try:
            await self.websocket.send(json.dumps(message))
            response = await self.websocket.recv()
            response_data = json.loads(response)
            
            if response_data.get("action") == "session_ended":
                print("👋 Session ended successfully!")
                return True
            else:
                print(f"❌ Failed to end session: {response_data}")
                return False
                
        except Exception as e:
            print(f"❌ Error ending session: {e}")
            return False
    
    async def close(self):
        """Close the WebSocket connection."""
        if self.websocket:
            await self.websocket.close()
            print("🔌 Connection closed")
    
    def print_conversation_summary(self):
        """Print a summary of the conversation."""
        if not self.conversation_history:
            print("📝 No conversation history")
            return
        
        print("\n" + "="*50)
        print("📝 CONVERSATION SUMMARY")
        print("="*50)
        
        for i, entry in enumerate(self.conversation_history, 1):
            print(f"\n{i}. {entry['timestamp']}")
            print(f"   You: {entry['user']}")
            print(f"   AI: {entry['assistant']}")
        
        print(f"\nTotal exchanges: {len(self.conversation_history)}")


async def main():
    """Main interactive chat function."""
    print("🎤 Voice AI Assistant Chat Demo")
    print("="*40)
    print("This demo simulates a voice conversation with your AI assistant.")
    print("Type your messages and the AI will respond as if you're speaking.")
    print("Commands:")
    print("  /screen <description> - Add screen context")
    print("  /history - Show conversation history")
    print("  /quit - End the session and exit")
    print("="*40)
    
    chat = VoiceAgentChat()
    
    # Connect to server
    if not await chat.connect():
        return
    
    try:
        # Start session
        if not await chat.start_session():
            print("❌ Failed to start session")
            return
        
        print("\n🎯 Session ready! Start chatting with your AI assistant...")
        print("(Type your message and press Enter)")
        
        while True:
            try:
                # Get user input
                user_input = input("\n💬 You: ").strip()
                
                if not user_input:
                    continue
                
                # Handle commands
                if user_input.startswith("/"):
                    if user_input == "/quit":
                        break
                    elif user_input == "/history":
                        chat.print_conversation_summary()
                        continue
                    elif user_input.startswith("/screen "):
                        description = user_input[8:]  # Remove "/screen "
                        await chat.send_screen_context(description)
                        continue
                    else:
                        print("❓ Unknown command. Type /help for available commands.")
                        continue
                
                # Send message to AI
                await chat.send_message(user_input)
                
            except KeyboardInterrupt:
                print("\n\n⏹️  Interrupted by user")
                break
            except EOFError:
                print("\n\n⏹️  End of input")
                break
        
        # End session
        print("\n👋 Ending session...")
        await chat.end_session()
        
        # Show conversation summary
        chat.print_conversation_summary()
        
    except Exception as e:
        print(f"❌ Error during chat: {e}")
    finally:
        await chat.close()


if __name__ == "__main__":
    # Check if backend is running
    print("🔍 Checking backend connection...")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Demo stopped by user")
    except Exception as e:
        print(f"❌ Demo error: {e}")
        print("\n💡 Make sure your backend is running with:")
        print("   python main.py") 