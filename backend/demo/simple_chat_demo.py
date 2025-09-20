#!/usr/bin/env python3
"""
Simple HTTP-based Voice AI Assistant Chat Demo

This demo simulates a voice conversation with the AI assistant using HTTP requests
instead of WebSocket, making it more reliable for testing.
"""

import requests
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional


class SimpleVoiceAgentChat:
    """Simple HTTP-based chat interface for the Voice AI Assistant."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = None
        self.user_id = f"user_{uuid.uuid4().hex[:8]}"
        self.conversation_history = []
        
    def check_server(self) -> bool:
        """Check if the server is running."""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Server is running: {data.get('message', 'Unknown')}")
                print(f"📋 Features: {', '.join(data.get('features', []))}")
                return True
            else:
                print(f"❌ Server responded with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed to connect to server: {e}")
            return False
    
    def create_livekit_token(self, room_name: str, participant_identity: str) -> Optional[str]:
        """Create a LiveKit access token."""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/livekit/token",
                params={
                    "room_name": room_name,
                    "participant_identity": participant_identity
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("access_token")
            else:
                print(f"❌ Failed to create token: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating token: {e}")
            return None
    
    def simulate_ai_response(self, user_message: str, screen_context: str = None) -> str:
        """Simulate AI response based on user input."""
        # This is a simple simulation - in a real app, this would call the AI API
        
        if screen_context:
            context_prompt = f"User is looking at: {screen_context}. "
        else:
            context_prompt = ""
        
        # Simple response logic based on keywords
        message_lower = user_message.lower()
        
        if "hello" in message_lower or "hi" in message_lower:
            return f"{context_prompt}Hello! I'm your AI assistant. How can I help you today?"
        
        elif "spreadsheet" in message_lower or "excel" in message_lower:
            return f"{context_prompt}I can help you with spreadsheets! What specific task would you like assistance with? I can help with formulas, data analysis, charts, and more."
        
        elif "help" in message_lower:
            return f"{context_prompt}I'm here to help! I can assist with various tasks like spreadsheet work, document creation, data analysis, and more. What would you like to work on?"
        
        elif "pivot" in message_lower or "table" in message_lower:
            return f"{context_prompt}I'll guide you through creating a pivot table. First, select your data including headers. Then go to Insert > PivotTable. Choose where you want it to appear, and drag your fields to the appropriate areas in the PivotTable Fields pane."
        
        elif "formula" in message_lower or "function" in message_lower:
            return f"{context_prompt}I can help you with Excel formulas! What type of calculation are you trying to perform? I can assist with SUM, AVERAGE, VLOOKUP, IF statements, and many other functions."
        
        elif "chart" in message_lower or "graph" in message_lower:
            return f"{context_prompt}Creating charts is easy! Select your data, then go to Insert > Charts. Choose the chart type that best represents your data. I can help you customize colors, labels, and formatting."
        
        elif "filter" in message_lower or "sort" in message_lower:
            return f"{context_prompt}To filter or sort your data, select your data range and go to Data > Filter. This will add filter arrows to your headers. You can also use Data > Sort to arrange your data in a specific order."
        
        else:
            return f"{context_prompt}I understand you're saying '{user_message}'. I'm here to help with various tasks. Could you tell me more specifically what you'd like assistance with?"
    
    def send_message(self, text: str, screen_context: str = None) -> Optional[Dict[str, Any]]:
        """Send a message to the AI assistant."""
        if not self.session_id:
            self.session_id = str(uuid.uuid4())
        
        # Simulate AI response
        ai_response = self.simulate_ai_response(text, screen_context)
        
        # Store conversation
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "user": text,
            "assistant": ai_response,
            "screen_context": screen_context
        })
        
        return {
            "action": "text_response",
            "session_id": self.session_id,
            "text": ai_response
        }
    
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
            if entry.get('screen_context'):
                print(f"   Screen: {entry['screen_context']}")
            print(f"   AI: {entry['assistant']}")
        
        print(f"\nTotal exchanges: {len(self.conversation_history)}")


def main():
    """Main interactive chat function."""
    print("🎤 Simple Voice AI Assistant Chat Demo")
    print("="*50)
    print("This demo simulates a voice conversation with your AI assistant.")
    print("Type your messages and the AI will respond as if you're speaking.")
    print("Commands:")
    print("  /screen <description> - Add screen context")
    print("  /history - Show conversation history")
    print("  /quit - End the session and exit")
    print("="*50)
    
    chat = SimpleVoiceAgentChat()
    
    # Check server
    if not chat.check_server():
        print("\n💡 Make sure your backend server is running with:")
        print("   python main.py")
        return
    
    print("\n🎯 Session ready! Start chatting with your AI assistant...")
    print("(Type your message and press Enter)")
    
    try:
        while True:
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
                    response = chat.send_message("", description)
                    if response:
                        print(f"🤖 AI Assistant: {response['text']}")
                    continue
                else:
                    print("❓ Unknown command. Available commands: /screen, /history, /quit")
                    continue
            
            # Send message to AI
            response = chat.send_message(user_input)
            if response:
                print(f"🤖 AI Assistant: {response['text']}")
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Interrupted by user")
    except EOFError:
        print("\n\n⏹️  End of input")
    
    # Show conversation summary
    print("\n👋 Ending session...")
    chat.print_conversation_summary()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Demo stopped by user")
    except Exception as e:
        print(f"❌ Demo error: {e}")
        print("\n💡 Make sure your backend server is running with:")
        print("   python main.py") 