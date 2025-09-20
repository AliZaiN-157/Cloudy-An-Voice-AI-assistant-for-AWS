
import React, { useState, useEffect, useRef } from 'react';
import { 
  createLiveKitService, 
  LiveKitService, 
  LiveKitConfig, 
  LiveKitCallbacks,
  AudioSettings,
  VideoSettings 
} from '../services/livekitService';
import { getLiveKitConfig, livekitConfig } from '../config/livekit';

interface VoiceAgentPageProps {
  userId: string;
  accessToken: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
}

const VoiceAgentPage: React.FC<VoiceAgentPageProps> = ({ userId, accessToken }) => {
  const [liveKitService, setLiveKitService] = useState<LiveKitService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioCapturing, setIsAudioCapturing] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomState, setRoomState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioLevelRef = useRef<HTMLDivElement>(null);

  // LiveKit configuration
  const liveKitConfig: LiveKitConfig = getLiveKitConfig(userId);

  // LiveKit callbacks
  const liveKitCallbacks: LiveKitCallbacks = {
    onConnected: (room) => {
      console.log('Connected to LiveKit room:', room);
      setIsConnected(true);
      setError(null);
    },
    onDisconnected: (reason) => {
      console.log('Disconnected from LiveKit room:', reason);
      setIsConnected(false);
      setIsAudioCapturing(false);
      setIsScreenSharing(false);
    },
    onParticipantConnected: (participant) => {
      console.log('Participant connected:', participant.identity);
      updateRoomState();
    },
    onParticipantDisconnected: (participant) => {
      console.log('Participant disconnected:', participant.identity);
      updateRoomState();
    },
    onTrackSubscribed: (track, publication, participant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
    },
    onTrackUnsubscribed: (track, publication, participant) => {
      console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
    },
    onDataReceived: (payload, participant) => {
      console.log('Data received from', participant?.identity);
    },
    onAudioLevelChanged: (participant, level) => {
      // Update audio level indicator
      if (audioLevelRef.current) {
        audioLevelRef.current.style.height = `${level * 100}%`;
      }
    },
    onError: (error) => {
      console.error('LiveKit error:', error);
      setError(error.message);
    },
    onAIResponse: (text, audioData) => {
      console.log('AI response:', text);
      addMessage('ai', text, audioData);
    },
    onScreenShareStarted: () => {
      setIsScreenSharing(true);
    },
    onScreenShareStopped: () => {
      setIsScreenSharing(false);
    }
  };

  useEffect(() => {
    initializeLiveKit();
    return () => {
      if (liveKitService) {
        liveKitService.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeLiveKit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const service = createLiveKitService(liveKitConfig);
      service.setCallbacks(liveKitCallbacks);
      
      await service.connect();
      setLiveKitService(service);
      
    } catch (err) {
      console.error('Failed to initialize LiveKit:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize LiveKit');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoomState = () => {
    if (liveKitService) {
      setRoomState(liveKitService.getRoomState());
    }
  };

  const addMessage = (type: 'user' | 'ai', text: string, audioData?: ArrayBuffer) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
      audioData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startAudioCapture = async () => {
    if (!liveKitService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const audioSettings: Partial<AudioSettings> = livekitConfig.audio;
      
      await liveKitService.startAudioCapture(audioSettings);
      setIsAudioCapturing(true);
      
      addMessage('user', 'Started audio capture...');
      
    } catch (err) {
      console.error('Failed to start audio capture:', err);
      setError(err instanceof Error ? err.message : 'Failed to start audio capture');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudioCapture = async () => {
    if (!liveKitService) return;
    
    try {
      await liveKitService.stopAudioCapture();
      setIsAudioCapturing(false);
      addMessage('user', 'Stopped audio capture');
    } catch (err) {
      console.error('Failed to stop audio capture:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop audio capture');
    }
  };

  const startScreenShare = async () => {
    if (!liveKitService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const videoSettings: Partial<VideoSettings> = livekitConfig.screenShare;
      
      await liveKitService.startScreenShare(videoSettings);
      
    } catch (err) {
      console.error('Failed to start screen share:', err);
      setError(err instanceof Error ? err.message : 'Failed to start screen share');
    } finally {
      setIsLoading(false);
    }
  };

  const stopScreenShare = async () => {
    if (!liveKitService) return;
    
    try {
      await liveKitService.stopScreenShare();
    } catch (err) {
      console.error('Failed to stop screen share:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop screen share');
    }
  };

  const sendDataToAI = async (data: any) => {
    if (!liveKitService) return;
    
    try {
      await liveKitService.sendDataToAI(data);
    } catch (err) {
      console.error('Failed to send data to AI:', err);
      setError(err instanceof Error ? err.message : 'Failed to send data to AI');
    }
  };

  const disconnect = async () => {
    if (liveKitService) {
      await liveKitService.disconnect();
      setLiveKitService(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voice AI Assistant</h1>
            <p className="text-sm text-gray-600">Real-time voice interaction with AI</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Audio Level Indicator */}
          <div className="px-6 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  ref={audioLevelRef}
                  className="w-full bg-blue-500 transition-all duration-100"
                  style={{ height: '0%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">
                {isAudioCapturing ? 'Audio Level' : 'No Audio'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-6">
            {/* Connection Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connection</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {roomState && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Participants:</span>
                      <span className="text-sm font-medium">{roomState.participants.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">AI Assistant:</span>
                      <span className="text-sm font-medium">
                        {roomState.aiParticipant ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Audio Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audio</h3>
              <div className="space-y-3">
                <button
                  onClick={isAudioCapturing ? stopAudioCapture : startAudioCapture}
                  disabled={!isConnected || isLoading}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    isAudioCapturing
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Loading...' : isAudioCapturing ? 'Stop Audio' : 'Start Audio'}
                </button>
              </div>
            </div>

            {/* Screen Share Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Screen Share</h3>
              <div className="space-y-3">
                <button
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  disabled={!isConnected || isLoading}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScreenSharing
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Loading...' : isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
                </button>
              </div>
            </div>

            {/* AI Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Assistant</h3>
              <div className="space-y-3">
                <button
                  onClick={() => sendDataToAI({ type: 'start_session', user_id: userId })}
                  disabled={!isConnected || isLoading}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start AI Session
                </button>
                <button
                  onClick={() => sendDataToAI({ type: 'end_session' })}
                  disabled={!isConnected || isLoading}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  End AI Session
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentPage;
