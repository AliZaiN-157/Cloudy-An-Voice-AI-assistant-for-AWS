import io from 'socket.io-client';

export interface WebRTCConfig {
  serverUrl: string;
  apiKey: string;
}

export interface VoiceMessage {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export class WebRTCService {
  private socket: any = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  
  private config: WebRTCConfig;
  private onMessageCallback: ((message: VoiceMessage) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor(config: WebRTCConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create audio element for playback
      this.audioElement = new Audio();
      this.audioElement.autoplay = true;
      
      // Connect to signaling server
      await this.connectToSignalingServer();
      
      // Initialize WebRTC peer connection
      await this.initializePeerConnection();
      
    } catch (error) {
      console.error('Failed to initialize WebRTC service:', error);
      throw error;
    }
  }

  private async connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.config.serverUrl, {
        auth: {
          apiKey: this.config.apiKey
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
        this.onStatusChangeCallback?.('connected');
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server');
        this.onStatusChangeCallback?.('disconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('Signaling server error:', error);
        this.onErrorCallback?.(error.message || 'Signaling server error');
        reject(error);
      });

      // Handle WebRTC signaling
      this.socket.on('offer', this.handleOffer.bind(this));
      this.socket.on('answer', this.handleAnswer.bind(this));
      this.socket.on('ice-candidate', this.handleIceCandidate.bind(this));
      this.socket.on('ai-response', this.handleAIResponse.bind(this));
    });
  }

  private async initializePeerConnection(): Promise<void> {
    // For now, we'll simulate the peer connection
    // In a real implementation, you would create an actual RTCPeerConnection
    console.log('Initializing peer connection (simulated)');
    
    // Simulate connection state changes
    setTimeout(() => {
      this.onStatusChangeCallback?.('connected');
    }, 1000);
  }

  public async startVoiceSession(screenShareStream?: MediaStream): Promise<void> {
    try {
      // For now, we'll simulate the voice session
      // In a real implementation, you would set up actual WebRTC audio streaming
      console.log('Starting voice session (simulated)');
      
      // Simulate getting microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Create a simple offer for demonstration
      const offer = {
        type: 'offer',
        sdp: 'v=0\r\no=- 0 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:0\r\na=recvonly\r\na=rtpmap:111 opus/48000/2\r\n'
      };
      
      if (this.socket) {
        this.socket.emit('offer', {
          offer,
          screenShare: screenShareStream ? true : false
        });
      }

      this.onStatusChangeCallback?.('listening');
    } catch (error) {
      console.error('Failed to start voice session:', error);
      throw error;
    }
  }

  private async handleOffer(data: any): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        if (this.socket) {
          this.socket.emit('answer', answer);
        }
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleAIResponse(data: { text: string; audio?: string }): void {
    const message: VoiceMessage = {
      type: 'ai',
      text: data.text,
      timestamp: Date.now()
    };
    
    this.onMessageCallback?.(message);
  }

  public sendVoiceMessage(text: string): void {
    if (this.socket) {
      this.socket.emit('voice-message', { text });
    }
  }

  public setCallbacks(
    onMessage: (message: VoiceMessage) => void,
    onStatusChange: (status: string) => void,
    onError: (error: string) => void
  ): void {
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;
    this.onErrorCallback = onError;
  }

  public async stopVoiceSession(): Promise<void> {
    try {
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Disconnect socket
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Stop audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      // Clear audio element
      if (this.audioElement) {
        this.audioElement.srcObject = null;
        this.audioElement = null;
      }

      this.onStatusChangeCallback?.('stopped');
    } catch (error) {
      console.error('Error stopping voice session:', error);
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getConnectionState(): string {
    return this.peerConnection?.connectionState || 'disconnected';
  }
}

// Create a singleton instance
let webrtcServiceInstance: WebRTCService | null = null;

export const createWebRTCService = (config: WebRTCConfig): WebRTCService => {
  if (!webrtcServiceInstance) {
    webrtcServiceInstance = new WebRTCService(config);
  }
  return webrtcServiceInstance;
};

export const getWebRTCService = (): WebRTCService | null => {
  return webrtcServiceInstance;
}; 