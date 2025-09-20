# Voice AI Assistant Chat Demo

This demo allows you to interact with your Voice AI Assistant through a text-based chat interface, simulating voice conversations with the AI.

## 🚀 Quick Start

### 1. Start the Backend Server

First, start the backend server using the provided script:

```bash
python demo/start_backend.py
```

This will:
- Set up environment variables
- Install missing dependencies
- Start the FastAPI server on `http://localhost:8000`

### 2. Start the Chat Demo

In a new terminal, run the chat demo:

```bash
python demo/voice_agent_chat.py
```

## 🎯 Features

### Interactive Chat
- **Text Input**: Type your messages and the AI responds as if you're speaking
- **Real-time Communication**: Uses WebSocket connection to your LiveKit backend
- **Session Management**: Maintains conversation context throughout the session

### Commands
- `/screen <description>` - Add screen context (e.g., "I'm looking at a spreadsheet")
- `/history` - Show conversation history
- `/quit` - End the session and exit

### Example Conversation

```
🎤 Voice AI Assistant Chat Demo
========================================
✅ Connected to Voice AI Assistant at ws://localhost:8000/ws/livekit
🎉 Session started successfully!
📡 LiveKit Room: voice-ai-session-123
🔑 Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🎯 Session ready! Start chatting with your AI assistant...
(Type your message and press Enter)

💬 You: Hello, I need help with my spreadsheet
🤖 AI Assistant: I'd be happy to help you with your spreadsheet! I can see you're working on some data. What specific task would you like assistance with? Are you looking to create formulas, format data, or analyze information?

💬 You: /screen I have a sales report with customer data
🤖 AI Assistant: I can see your sales report with customer data. This looks like a comprehensive dataset. What would you like to do with this information? I can help you with data analysis, creating charts, filtering data, or any other spreadsheet tasks you have in mind.

💬 You: How do I create a pivot table?
🤖 AI Assistant: I'll guide you through creating a pivot table for your sales data. First, select all your data including headers. Then go to Insert > PivotTable. Choose where you want the pivot table to appear. In the PivotTable Fields pane, drag your fields to the appropriate areas - typically you'd put customer names in Rows, sales amounts in Values, and dates in Columns if you want to see trends over time.
```

## 🔧 Configuration

The demo uses these default settings:
- **Backend URL**: `ws://localhost:8000/ws/livekit`
- **Gemini Model**: `gemini-1.5-flash`
- **Language**: English
- **Session Timeout**: 15 seconds per response

## 🛠️ Troubleshooting

### Connection Issues
If you get connection errors:
1. Make sure the backend server is running (`python demo/start_backend.py`)
2. Check that port 8000 is available
3. Verify the WebSocket URL is correct

### No Response from AI
If the AI doesn't respond:
1. Check the backend logs for errors
2. Verify your Gemini API key is set correctly
3. Try restarting both the backend and chat demo

### Dependencies Issues
If you get import errors:
```bash
pip install websockets asyncio
```

## 📝 Conversation History

The demo automatically saves your conversation history and displays a summary when you end the session. This helps you track what you discussed with the AI assistant.

## 🎨 Customization

You can modify the demo by editing `voice_agent_chat.py`:
- Change the WebSocket URL
- Modify the AI assistant persona
- Add new commands
- Customize the conversation flow

## 🔗 Related Files

- `start_backend.py` - Backend server starter
- `voice_agent_chat.py` - Main chat demo
- `../main.py` - Backend server entry point
- `../src/realtime_assistant_service/` - Backend source code

## 🚀 Next Steps

After trying the demo, you can:
1. Integrate real voice input using microphone
2. Add screen capture for real-time screen analysis
3. Implement TTS (Text-to-Speech) for AI responses
4. Build a web interface for the chat
5. Add more advanced AI features

Enjoy chatting with your Voice AI Assistant! 🎤🤖 