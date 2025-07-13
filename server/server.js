import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize Google AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VOICE_AGENT_SYSTEM_INSTRUCTION = `You are a world-class AWS expert AI assistant named 'Cloudy'. Your persona is helpful, friendly, and an expert instructor.
You are having a voice conversation with a user while watching their screen.
Your primary goal is to provide clear, accurate, and concise verbal guidance on AWS services based on what you see.
- Analyze the user's screen (the provided image) and their verbal request (the prompt).
- Provide step-by-step instructions. Be concise. Your responses will be spoken out loud, so keep them natural and easy to follow.
- If the user asks a question, answer it based on the visual context of their screen.
- Do not include markdown or code formatting in your response. Your entire response should be plain text, suitable for text-to-speech.
- Keep your tone encouraging and helpful. Start the first interaction with a friendly greeting and ask how you can help.`;

// Store active connections
const activeConnections = new Map();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authenticate client
  const apiKey = socket.handshake.auth.apiKey;
  if (apiKey !== process.env.API_KEY) {
    console.log('Invalid API key from:', socket.id);
    socket.disconnect();
    return;
  }

  // Store connection info
  activeConnections.set(socket.id, {
    socket,
    offer: null,
    screenShare: false,
    audioProcessor: null
  });

  // Handle WebRTC offer
  socket.on('offer', async (data) => {
    try {
      console.log('Received offer from:', socket.id);
      
      // Store connection info
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.offer = data.offer;
        connection.screenShare = data.screenShare || false;
      }

      // For now, we'll simulate the WebRTC connection
      // In a real implementation, you would use a WebRTC library like wrtc
      console.log('WebRTC connection established (simulated)');
      
      // Send a simulated answer back
      const simulatedAnswer = {
        type: 'answer',
        sdp: 'v=0\r\no=- 0 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:0\r\na=sendonly\r\na=rtpmap:111 opus/48000/2\r\n'
      };
      
      socket.emit('answer', simulatedAnswer);
      
      // Send welcome message
      setTimeout(() => {
        sendAIResponse(socket.id, "Hello! I'm Cloudy, your AWS voice assistant. How can I help you today?");
      }, 1000);

    } catch (error) {
      console.error('Error handling offer:', error);
      socket.emit('error', { message: 'Failed to establish connection' });
    }
  });

  // Handle ICE candidates from client
  socket.on('ice-candidate', async (candidate) => {
    try {
      console.log('Received ICE candidate from:', socket.id);
      // In a real implementation, you would add the ICE candidate to the peer connection
      // For now, we'll just acknowledge it
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  });

  // Handle voice messages
  socket.on('voice-message', async (data) => {
    try {
      console.log('Received voice message from:', socket.id, data.text);
      
      // Process the message with AI
      const response = await processWithAI(data.text);
      sendAIResponse(socket.id, response);
      
    } catch (error) {
      console.error('Error processing voice message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    cleanupConnection(socket.id);
  });
});

// Handle incoming audio stream
function handleAudioStream(socketId, stream) {
  console.log('Setting up audio processing for:', socketId);
  
  // For now, we'll simulate audio processing
  // In a real implementation, you would:
  // 1. Convert audio to text using speech-to-text service
  // 2. Process with AI
  // 3. Convert response to speech
  // 4. Send back via WebRTC
  
  // Simulate receiving a voice message after a delay
  setTimeout(() => {
    const connection = activeConnections.get(socketId);
    if (connection) {
      // Simulate user saying something
      const simulatedMessage = "How do I create an EC2 instance?";
      processWithAI(simulatedMessage).then(response => {
        sendAIResponse(socketId, response);
      });
    }
  }, 3000);
}

// Process message with AI
async function processWithAI(message) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: VOICE_AGENT_SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm sorry, I encountered an error. Could you please try again?";
  }
}

// Send AI response to client
function sendAIResponse(socketId, text) {
  const connection = activeConnections.get(socketId);
  if (connection) {
    connection.socket.emit('ai-response', {
      text,
      timestamp: Date.now()
    });
    
    // In a real implementation, you would:
    // 1. Convert text to speech
    // 2. Send audio stream back via WebRTC
    console.log('Sent AI response to:', socketId, text);
  }
}

// Cleanup connection
function cleanupConnection(socketId) {
  const connection = activeConnections.get(socketId);
  if (connection) {
    // In a real implementation, you would close the peer connection
    // For now, we'll just clean up the connection object
    activeConnections.delete(socketId);
  }
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebRTC server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 