
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AgentStatus } from '../types';
import { createWebRTCService, WebRTCConfig, VoiceMessage } from '../services/webrtcService';
import { PowerIcon, MicrophoneIcon, LoaderIcon, SpeakingIcon } from './icons';

// Add SpeechRecognition types to window for browsers that support it under a prefix
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const StatusDisplay: React.FC<{ status: AgentStatus; transcript: string }> = ({ status, transcript }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'listening':
                return { icon: <MicrophoneIcon className="h-8 w-8 text-[#623CEA]" />, text: "Listening..." };
            case 'processing':
                return { icon: <LoaderIcon className="h-8 w-8 animate-spin text-[#623CEA]" />, text: "Cloudy is thinking..." };
            case 'speaking':
                return { icon: <SpeakingIcon className="h-8 w-8 text-[#623CEA]" />, text: "Cloudy is speaking..." };
            case 'connecting':
                return { icon: <LoaderIcon className="h-8 w-8 animate-spin text-[#623CEA]" />, text: "Connecting to voice service..." };
            case 'connected':
                return { icon: <MicrophoneIcon className="h-8 w-8 text-green-500" />, text: "Connected and ready" };
            case 'disconnected':
                return { icon: <MicrophoneIcon className="h-8 w-8 text-gray-400" />, text: "Disconnected" };
            case 'error':
                return { icon: <MicrophoneIcon className="h-8 w-8 text-red-500" />, text: "Sorry, an error occurred. Please try again." };
            default: // idle
                return { icon: <MicrophoneIcon className="h-8 w-8 text-gray-400" />, text: "Agent is idle" };
        }
    };
    const { icon, text } = getStatusInfo();
    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-2xl shadow-md border border-gray-100 min-w-[320px]">
            <div className="flex items-center gap-3">
                {icon}
                <p className="text-lg font-medium text-gray-700">{text}</p>
            </div>
            {transcript && status === 'processing' && (
                <p className="text-gray-500 italic text-center">You said: "{transcript}"</p>
            )}
        </div>
    )
}

interface VoiceAgentPageProps {
  onBack?: () => void;
}


export const VoiceAgentPage: React.FC<VoiceAgentPageProps> = ({ onBack }) => {
    const [isAgentActive, setIsAgentActive] = useState(false);
    const [status, setStatus] = useState<AgentStatus>('idle');
    const [transcript, setTranscript] = useState('');
    const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const webrtcServiceRef = useRef<any>(null);
    
    // Check if API key is available
    useEffect(() => {
        if (!process.env.API_KEY) {
            setStatus('error');
            alert('API key not configured. Please set the API_KEY environment variable.');
        }
    }, []);

    // Initialize WebRTC service
    const initializeWebRTC = useCallback(async () => {
        try {
            const config: WebRTCConfig = {
                serverUrl: process.env.VITE_WEBRTC_SERVER_URL || 'http://localhost:3001',
                apiKey: process.env.API_KEY || ''
            };
            
            const webrtcService = createWebRTCService(config);
            webrtcServiceRef.current = webrtcService;
            
            // Set up callbacks
            webrtcService.setCallbacks(
                (message: VoiceMessage) => {
                    setVoiceMessages(prev => [...prev, message]);
                    if (message.type === 'ai') {
                        setTranscript(message.text);
                    }
                },
                (status: string) => {
                    setStatus(status as AgentStatus);
                },
                (error: string) => {
                    console.error('WebRTC error:', error);
                    setStatus('error');
                }
            );
            
            await webrtcService.initialize();
        } catch (error) {
            console.error('Failed to initialize WebRTC:', error);
            setStatus('error');
        }
    }, []);

    // Initialize WebRTC when component mounts
    useEffect(() => {
        initializeWebRTC();
        
        return () => {
            if (webrtcServiceRef.current) {
                webrtcServiceRef.current.stopVoiceSession();
            }
        };
    }, [initializeWebRTC]);
    
    const stopAgent = useCallback(async () => {
        setIsAgentActive(false);
        setStatus('idle');
        setTranscript('');
        setVoiceMessages([]);
        
        if (webrtcServiceRef.current) {
            await webrtcServiceRef.current.stopVoiceSession();
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);
    
    const startAgent = async () => {
        try {
            setStatus('processing');
            
            // Request screen sharing permission
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { cursor: "always" } as any, 
                audio: false 
            });

            if(videoRef.current && webrtcServiceRef.current) {
                videoRef.current.srcObject = displayStream;
                streamRef.current = displayStream;
                displayStream.getVideoTracks()[0].onended = stopAgent; // Stop if user clicks browser "Stop sharing"
                
                setIsAgentActive(true);
                setStatus('connecting');
                
                // Start WebRTC voice session
                await webrtcServiceRef.current.startVoiceSession(displayStream);
            }
        } catch (err) {
            console.error("Error starting agent:", err);
            setStatus('error');
            
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    alert("Permission denied. Please allow screen sharing permissions to use the voice agent.");
                } else {
                    alert(`Error starting voice agent: ${err.message}`);
                }
            } else {
                alert("Could not start screen sharing. Please allow permissions and try again.");
            }
            
            setIsAgentActive(false);
        }
    };

    const handleToggleAgent = () => {
        if (isAgentActive) {
            stopAgent();
        } else {
            startAgent();
        }
    };

    return (
        <div className="relative flex flex-col h-full w-full items-center justify-center bg-gray-50 p-4 md:p-8 gap-6">
            {onBack && (
              <button onClick={onBack} className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 text-white hover:bg-black/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Dashboard
              </button>
            )}

            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">AWS Voice Assistant</h1>
                <p className="text-gray-600">Your real-time guide to the AWS console</p>
            </div>
            
            <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative">
                 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" muted />
                 {!isAgentActive && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 p-4 text-center">
                         <img src="https://i.ibb.co/6P8fCgC/cloudy-logo.png" alt="Cloudy Logo" className="w-20 h-20 mb-4"/>
                         <p className="text-xl font-semibold">Your screen share will appear here</p>
                         <p className="text-md mt-1 text-gray-300">Click "Start Session" to begin</p>
                     </div>
                 )}
            </div>
            
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {/* Voice Messages Display */}
            {voiceMessages.length > 0 && (
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-gray-100 p-4 max-h-48 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Conversation</h3>
                    <div className="space-y-2">
                        {voiceMessages.map((message, index) => (
                            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                                    message.type === 'user' 
                                        ? 'bg-[#623CEA] text-white' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    <p className="text-sm">{message.text}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <StatusDisplay status={status} transcript={transcript} />

            <button
                onClick={handleToggleAgent}
                className={`flex items-center justify-center gap-3 px-8 py-4 w-64 rounded-full text-lg font-semibold text-white shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    isAgentActive ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300' : `bg-[#623CEA] hover:bg-[#5028d9] focus:ring-[#623CEA]/50`
                }`}
            >
                <PowerIcon className="h-6 w-6" />
                <span>{isAgentActive ? 'End Session' : 'Start Session'}</span>
            </button>
        </div>
    );
};
