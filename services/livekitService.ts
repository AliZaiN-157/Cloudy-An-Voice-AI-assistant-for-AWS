/**
 * LiveKit Service for Real-time Voice AI Assistant
 * Implements LiveKit + Gemini architecture for ultra-low latency voice interactions
 */

import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Track,
  TrackPublication,
  RemoteTrack,
  LocalTrack,
  AudioCaptureOptions,
  VideoCaptureOptions,
  ScreenShareCaptureOptions,
  DataPacket_Kind,
  DisconnectReason,
  ConnectionState,
  Participant,
  TrackPublicationEvent,
  DataReceivedEvent,
  AudioTrack,
  VideoTrack,
  LocalAudioTrack,
  LocalVideoTrack
} from 'livekit-client';

export interface LiveKitConfig {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
  roomName: string;
  participantName: string;
}

export interface LiveKitCallbacks {
  onConnected?: (room: Room) => void;
  onDisconnected?: (reason?: DisconnectReason) => void;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onTrackSubscribed?: (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => void;
  onTrackUnsubscribed?: (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => void;
  onDataReceived?: (payload: Uint8Array, participant?: RemoteParticipant) => void;
  onAudioLevelChanged?: (participant: Participant, level: number) => void;
  onError?: (error: Error) => void;
  onAIResponse?: (text: string, audioData?: ArrayBuffer) => void;
  onScreenShareStarted?: () => void;
  onScreenShareStopped?: () => void;
}

export interface AudioSettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
  channelCount: number;
}

export interface VideoSettings {
  width: number;
  height: number;
  frameRate: number;
}

export class LiveKitService {
  private room: Room | null = null;
  private config: LiveKitConfig;
  private callbacks: LiveKitCallbacks = {};
  private isConnected = false;
  private localAudioTrack: LocalAudioTrack | null = null;
  private localVideoTrack: LocalVideoTrack | null = null;
  private screenShareTrack: LocalVideoTrack | null = null;
  private aiParticipant: RemoteParticipant | null = null;

  constructor(config: LiveKitConfig) {
    this.config = config;
  }

  /**
   * Connect to LiveKit room
   */
  public async connect(): Promise<void> {
    try {
      // Create room instance
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [
            { width: 320, height: 180, fps: 15 },
            { width: 640, height: 360, fps: 30 },
            { width: 1280, height: 720, fps: 30 }
          ]
        }
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect to room
      await this.room.connect(this.config.serverUrl, this.config.apiKey, {
        metadata: JSON.stringify({
          participantName: this.config.participantName,
          timestamp: Date.now()
        })
      });

      this.isConnected = true;
      this.callbacks.onConnected?.(this.room);

    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from LiveKit room
   */
  public async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      this.isConnected = false;
      this.localAudioTrack = null;
      this.localVideoTrack = null;
      this.screenShareTrack = null;
      this.aiParticipant = null;
    }
  }

  /**
   * Start audio capture and publishing
   */
  public async startAudioCapture(settings?: Partial<AudioSettings>): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      const audioOptions: AudioCaptureOptions = {
        echoCancellation: settings?.echoCancellation ?? true,
        noiseSuppression: settings?.noiseSuppression ?? true,
        autoGainControl: settings?.autoGainControl ?? true,
        sampleRate: settings?.sampleRate ?? 48000,
        channelCount: settings?.channelCount ?? 1
      };

      this.localAudioTrack = await this.room.localParticipant.createMicrophoneTrack(audioOptions);
      await this.room.localParticipant.publishTrack(this.localAudioTrack);

      console.log('Audio capture started and published');

    } catch (error) {
      console.error('Failed to start audio capture:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  public async stopAudioCapture(): Promise<void> {
    if (this.localAudioTrack) {
      await this.room?.localParticipant.unpublishTrack(this.localAudioTrack);
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
      console.log('Audio capture stopped');
    }
  }

  /**
   * Start video capture and publishing
   */
  public async startVideoCapture(settings?: Partial<VideoSettings>): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      const videoOptions: VideoCaptureOptions = {
        width: settings?.width ?? 1280,
        height: settings?.height ?? 720,
        frameRate: settings?.frameRate ?? 30
      };

      this.localVideoTrack = await this.room.localParticipant.createCameraTrack(videoOptions);
      await this.room.localParticipant.publishTrack(this.localVideoTrack);

      console.log('Video capture started and published');

    } catch (error) {
      console.error('Failed to start video capture:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop video capture
   */
  public async stopVideoCapture(): Promise<void> {
    if (this.localVideoTrack) {
      await this.room?.localParticipant.unpublishTrack(this.localVideoTrack);
      this.localVideoTrack.stop();
      this.localVideoTrack = null;
      console.log('Video capture stopped');
    }
  }

  /**
   * Start screen sharing
   */
  public async startScreenShare(settings?: Partial<VideoSettings>): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      const screenOptions: ScreenShareCaptureOptions = {
        width: settings?.width ?? 1920,
        height: settings?.height ?? 1080,
        frameRate: settings?.frameRate ?? 30
      };

      this.screenShareTrack = await this.room.localParticipant.createScreenShareTrack(screenOptions);
      await this.room.localParticipant.publishTrack(this.screenShareTrack);

      this.callbacks.onScreenShareStarted?.();
      console.log('Screen sharing started');

    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  public async stopScreenShare(): Promise<void> {
    if (this.screenShareTrack) {
      await this.room?.localParticipant.unpublishTrack(this.screenShareTrack);
      this.screenShareTrack.stop();
      this.screenShareTrack = null;
      this.callbacks.onScreenShareStopped?.();
      console.log('Screen sharing stopped');
    }
  }

  /**
   * Send data to AI backend via LiveKit data channel
   */
  public async sendDataToAI(data: any): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      const payload = new TextEncoder().encode(JSON.stringify(data));
      await this.room.localParticipant.publishData(payload, DataPacket_Kind.RELIABLE);
    } catch (error) {
      console.error('Failed to send data to AI:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Set callbacks for various events
   */
  public setCallbacks(callbacks: LiveKitCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current room state
   */
  public getRoomState(): {
    isConnected: boolean;
    participants: RemoteParticipant[];
    localParticipant: LocalParticipant | null;
    aiParticipant: RemoteParticipant | null;
  } {
    return {
      isConnected: this.isConnected,
      participants: this.room?.remoteParticipants.values() ?? [],
      localParticipant: this.room?.localParticipant ?? null,
      aiParticipant: this.aiParticipant
    };
  }

  /**
   * Check if connected
   */
  public isRoomConnected(): boolean {
    return this.isConnected && this.room?.connectionState === ConnectionState.Connected;
  }

  /**
   * Get local audio track
   */
  public getLocalAudioTrack(): LocalAudioTrack | null {
    return this.localAudioTrack;
  }

  /**
   * Get local video track
   */
  public getLocalVideoTrack(): LocalVideoTrack | null {
    return this.localVideoTrack;
  }

  /**
   * Get screen share track
   */
  public getScreenShareTrack(): LocalVideoTrack | null {
    return this.screenShareTrack;
  }

  /**
   * Set up event listeners for the room
   */
  private setupEventListeners(): void {
    if (!this.room) return;

    // Connection events
    this.room.on(RoomEvent.Connected, () => {
      console.log('Connected to LiveKit room');
      this.isConnected = true;
    });

    this.room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
      console.log('Disconnected from LiveKit room:', reason);
      this.isConnected = false;
      this.callbacks.onDisconnected?.(reason);
    });

    // Participant events
    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant connected:', participant.identity);
      
      // Check if this is the AI participant
      if (participant.identity.includes('ai') || participant.identity.includes('assistant')) {
        this.aiParticipant = participant;
      }
      
      this.callbacks.onParticipantConnected?.(participant);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participant disconnected:', participant.identity);
      
      if (participant === this.aiParticipant) {
        this.aiParticipant = null;
      }
      
      this.callbacks.onParticipantDisconnected?.(participant);
    });

    // Track events
    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
      
      // Handle AI audio responses
      if (participant === this.aiParticipant && track.kind === Track.Kind.Audio) {
        this.handleAIAudioTrack(track as AudioTrack);
      }
      
      this.callbacks.onTrackSubscribed?.(track, publication, participant);
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => {
      console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
      this.callbacks.onTrackUnsubscribed?.(track, publication, participant);
    });

    // Data events
    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        console.log('Data received:', data);
        
        // Handle AI text responses
        if (data.type === 'ai_response' && data.text) {
          this.callbacks.onAIResponse?.(data.text, data.audioData);
        }
        
        this.callbacks.onDataReceived?.(payload, participant);
      } catch (error) {
        console.error('Failed to parse data received:', error);
      }
    });

    // Audio level events
    this.room.on(RoomEvent.AudioLevelChanged, (participant: Participant, level: number) => {
      this.callbacks.onAudioLevelChanged?.(participant, level);
    });
  }

  /**
   * Handle AI audio track for playback
   */
  private handleAIAudioTrack(track: AudioTrack): void {
    // Create audio element for AI responses
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    audioElement.volume = 0.8;
    
    // Attach the track to the audio element
    track.attach(audioElement);
    
    // Add to DOM temporarily for playback
    document.body.appendChild(audioElement);
    
    // Clean up when track ends
    track.on(TrackEvent.Ended, () => {
      document.body.removeChild(audioElement);
    });
  }
}

// Factory function to create LiveKit service
export const createLiveKitService = (config: LiveKitConfig): LiveKitService => {
  return new LiveKitService(config);
};

// Global instance
let liveKitServiceInstance: LiveKitService | null = null;

export const getLiveKitService = (): LiveKitService | null => {
  return liveKitServiceInstance;
};

export const setLiveKitService = (service: LiveKitService): void => {
  liveKitServiceInstance = service;
}; 