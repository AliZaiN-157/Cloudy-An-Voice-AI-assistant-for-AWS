"""
LiveKit Connector for Real-time Voice AI Assistant Backend
Handles LiveKit room management, media streaming, and AI integration
"""

import asyncio
import base64
import json
import time
from typing import Dict, Any, Optional, List, Callable, AsyncGenerator
from loguru import logger
import aiohttp
from livekit import rtc
from livekit.rtc import Room, Participant, Track, DataPacketKind
from ..core.config import settings
from .gemini_live import GeminiLiveConnector


class LiveKitConnector:
    """LiveKit connector for real-time media streaming and AI integration."""
    
    def __init__(self):
        """Initialize the LiveKit connector."""
        self.livekit_url = settings.livekit_url
        self.livekit_api_key = settings.livekit_api_key
        self.livekit_api_secret = settings.livekit_api_secret
        self.room: Optional[Room] = None
        self.gemini_connector: Optional[GeminiLiveConnector] = None
        self.is_connected = False
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.logger = logger.bind(name="LiveKitConnector")
        
        # AI participant identity
        self.ai_identity = "ai-assistant"
        
    async def initialize(self) -> None:
        """Initialize the LiveKit connector and Gemini connector."""
        try:
            self.gemini_connector = GeminiLiveConnector()
            await self.gemini_connector.initialize()
            self.logger.info("LiveKit connector initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize LiveKit connector: {e}")
            raise
    
    async def create_room(self, room_name: str, user_id: str) -> Dict[str, Any]:
        """Create a LiveKit room and generate access tokens."""
        try:
            # Generate access token for user
            user_token = self._generate_access_token(room_name, user_id)
            
            # Generate access token for AI assistant
            ai_token = self._generate_access_token(room_name, self.ai_identity)
            
            # Create room configuration
            room_config = {
                "room_name": room_name,
                "user_token": user_token,
                "ai_token": ai_token,
                "livekit_url": self.livekit_url,
                "created_at": time.time(),
                "user_id": user_id
            }
            
            self.logger.info(f"Created room {room_name} for user {user_id}")
            return room_config
            
        except Exception as e:
            self.logger.error(f"Failed to create room {room_name}: {e}")
            raise
    
    async def join_room_as_ai(self, room_name: str) -> None:
        """Join a LiveKit room as the AI assistant."""
        try:
            # Create room instance
            self.room = Room()
            
            # Set up event listeners
            self._setup_room_event_listeners()
            
            # Generate AI access token
            ai_token = self._generate_access_token(room_name, self.ai_identity)
            
            # Connect to room
            await self.room.connect(
                self.livekit_url,
                ai_token,
                auto_subscribe=True
            )
            
            self.is_connected = True
            self.logger.info(f"AI assistant joined room {room_name}")
            
        except Exception as e:
            self.logger.error(f"Failed to join room {room_name} as AI: {e}")
            raise
    
    async def process_user_audio(self, audio_data: bytes, session_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process user audio through Gemini and generate AI response."""
        try:
            if not self.gemini_connector:
                raise ValueError("Gemini connector not initialized")
            
            # Convert audio to base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Process with Gemini
            async for response in self.gemini_connector.process_audio_input(audio_base64, session_id):
                if response.get("type") == "text_response":
                    # Send text response via data channel
                    await self._send_ai_response(response["content"], session_id)
                    yield response
                    
        except Exception as e:
            self.logger.error(f"Error processing user audio: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "session_id": session_id,
                "timestamp": time.time()
            }
    
    async def process_screen_share(self, image_data: bytes, session_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process screen share frame through Gemini."""
        try:
            if not self.gemini_connector:
                raise ValueError("Gemini connector not initialized")
            
            # Convert image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Process with Gemini
            async for response in self.gemini_connector.process_screen_share(image_base64, session_id):
                if response.get("type") == "text_response":
                    # Send text response via data channel
                    await self._send_ai_response(response["content"], session_id)
                    yield response
                    
        except Exception as e:
            self.logger.error(f"Error processing screen share: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "session_id": session_id,
                "timestamp": time.time()
            }
    
    async def start_session(self, session_id: str, user_id: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Start a new AI session."""
        try:
            if not self.gemini_connector:
                raise ValueError("Gemini connector not initialized")
            
            # Start Gemini session
            result = await self.gemini_connector.start_session(session_id, user_id, config)
            
            # Store session info
            self.active_sessions[session_id] = {
                "user_id": user_id,
                "start_time": time.time(),
                "config": config or {},
                "status": "active"
            }
            
            self.logger.info(f"Started session {session_id} for user {user_id}")
            return result
            
        except Exception as e:
            self.logger.error(f"Failed to start session {session_id}: {e}")
            raise
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End an AI session."""
        try:
            if not self.gemini_connector:
                raise ValueError("Gemini connector not initialized")
            
            # End Gemini session
            result = await self.gemini_connector.end_session(session_id)
            
            # Remove from active sessions
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            
            self.logger.info(f"Ended session {session_id}")
            return result
            
        except Exception as e:
            self.logger.error(f"Failed to end session {session_id}: {e}")
            raise
    
    async def disconnect(self) -> None:
        """Disconnect from LiveKit room."""
        if self.room:
            await self.room.disconnect()
            self.room = None
            self.is_connected = False
            self.logger.info("Disconnected from LiveKit room")
    
    def _generate_access_token(self, room_name: str, participant_identity: str) -> str:
        """Generate LiveKit access token."""
        try:
            from livekit import AccessToken
            
            token = AccessToken()
            token.add_grant(
                room_join=True,
                room=room_name,
                room_admin=False,
                room_create=False,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True
            )
            token.identity = participant_identity
            token.ttl = 3600  # 1 hour
            
            return token.to_jwt(self.livekit_api_key, self.livekit_api_secret)
            
        except Exception as e:
            self.logger.error(f"Failed to generate access token: {e}")
            raise
    
    def _setup_room_event_listeners(self) -> None:
        """Set up LiveKit room event listeners."""
        if not self.room:
            return
        
        # Participant connected
        self.room.on("participant_connected", self._on_participant_connected)
        
        # Participant disconnected
        self.room.on("participant_disconnected", self._on_participant_disconnected)
        
        # Track published
        self.room.on("track_published", self._on_track_published)
        
        # Track unpublished
        self.room.on("track_unpublished", self._on_track_unpublished)
        
        # Data received
        self.room.on("data_received", self._on_data_received)
        
        # Connected
        self.room.on("connected", self._on_connected)
        
        # Disconnected
        self.room.on("disconnected", self._on_disconnected)
    
    def _on_participant_connected(self, participant: Participant) -> None:
        """Handle participant connected event."""
        self.logger.info(f"Participant connected: {participant.identity}")
    
    def _on_participant_disconnected(self, participant: Participant) -> None:
        """Handle participant disconnected event."""
        self.logger.info(f"Participant disconnected: {participant.identity}")
    
    def _on_track_published(self, publication: rtc.TrackPublication, participant: Participant) -> None:
        """Handle track published event."""
        self.logger.info(f"Track published: {publication.kind} from {participant.identity}")
        
        # Handle user audio/video tracks
        if participant.identity != self.ai_identity:
            asyncio.create_task(self._handle_user_media(publication, participant))
    
    def _on_track_unpublished(self, publication: rtc.TrackPublication, participant: Participant) -> None:
        """Handle track unpublished event."""
        self.logger.info(f"Track unpublished: {publication.kind} from {participant.identity}")
    
    def _on_data_received(self, payload: bytes, participant: Participant) -> None:
        """Handle data received event."""
        try:
            data = json.loads(payload.decode('utf-8'))
            self.logger.info(f"Data received from {participant.identity}: {data}")
            
            # Handle different data types
            asyncio.create_task(self._process_data_message(data, participant))
            
        except Exception as e:
            self.logger.error(f"Error processing data message: {e}")
    
    def _on_connected(self) -> None:
        """Handle room connected event."""
        self.logger.info("Connected to LiveKit room")
        self.is_connected = True
    
    def _on_disconnected(self) -> None:
        """Handle room disconnected event."""
        self.logger.info("Disconnected from LiveKit room")
        self.is_connected = False
    
    async def _handle_user_media(self, publication: rtc.TrackPublication, participant: Participant) -> None:
        """Handle user media tracks (audio/video/screen share)."""
        try:
            if publication.kind == Track.Kind.Audio:
                # Handle audio track
                track = publication.track
                if track:
                    # Subscribe to audio track
                    await track.subscribe()
                    
                    # Process audio data
                    await self._process_audio_track(track, participant.identity)
                    
            elif publication.kind == Track.Kind.Video:
                # Handle video track (screen share)
                track = publication.track
                if track:
                    # Subscribe to video track
                    await track.subscribe()
                    
                    # Process video frames
                    await self._process_video_track(track, participant.identity)
                    
        except Exception as e:
            self.logger.error(f"Error handling user media: {e}")
    
    async def _process_audio_track(self, track: rtc.Track, participant_identity: str) -> None:
        """Process audio track data."""
        try:
            # Get session ID from participant metadata
            session_id = self._get_session_id_from_participant(participant_identity)
            if not session_id:
                return
            
            # Process audio chunks
            async for audio_chunk in self._get_audio_chunks(track):
                async for response in self.process_user_audio(audio_chunk, session_id):
                    # Handle response
                    if response.get("type") == "text_response":
                        self.logger.info(f"AI response: {response['content']}")
                        
        except Exception as e:
            self.logger.error(f"Error processing audio track: {e}")
    
    async def _process_video_track(self, track: rtc.Track, participant_identity: str) -> None:
        """Process video track data (screen share)."""
        try:
            # Get session ID from participant metadata
            session_id = self._get_session_id_from_participant(participant_identity)
            if not session_id:
                return
            
            # Process video frames
            async for frame_data in self._get_video_frames(track):
                async for response in self.process_screen_share(frame_data, session_id):
                    # Handle response
                    if response.get("type") == "text_response":
                        self.logger.info(f"AI response to screen share: {response['content']}")
                        
        except Exception as e:
            self.logger.error(f"Error processing video track: {e}")
    
    async def _process_data_message(self, data: Dict[str, Any], participant: Participant) -> None:
        """Process data channel messages."""
        try:
            message_type = data.get("type")
            
            if message_type == "start_session":
                session_id = data.get("session_id")
                user_id = data.get("user_id")
                config = data.get("config")
                
                if session_id and user_id:
                    result = await self.start_session(session_id, user_id, config)
                    await self._send_data_to_participant(participant, {
                        "type": "session_started",
                        "data": result
                    })
                    
            elif message_type == "end_session":
                session_id = data.get("session_id")
                
                if session_id:
                    result = await self.end_session(session_id)
                    await self._send_data_to_participant(participant, {
                        "type": "session_ended",
                        "data": result
                    })
                    
        except Exception as e:
            self.logger.error(f"Error processing data message: {e}")
    
    async def _send_ai_response(self, text: str, session_id: str) -> None:
        """Send AI response to all participants in the room."""
        if not self.room:
            return
        
        try:
            response_data = {
                "type": "ai_response",
                "text": text,
                "session_id": session_id,
                "timestamp": time.time()
            }
            
            # Send to all participants
            await self.room.local_participant.publish_data(
                json.dumps(response_data).encode('utf-8'),
                DataPacketKind.RELIABLE
            )
            
        except Exception as e:
            self.logger.error(f"Error sending AI response: {e}")
    
    async def _send_data_to_participant(self, participant: Participant, data: Dict[str, Any]) -> None:
        """Send data to a specific participant."""
        try:
            await self.room.local_participant.publish_data(
                json.dumps(data).encode('utf-8'),
                DataPacketKind.RELIABLE,
                destination_identities=[participant.identity]
            )
        except Exception as e:
            self.logger.error(f"Error sending data to participant: {e}")
    
    def _get_session_id_from_participant(self, participant_identity: str) -> Optional[str]:
        """Extract session ID from participant identity or metadata."""
        # For now, use participant identity as session ID
        # In a real implementation, you'd extract this from metadata
        return participant_identity
    
    async def _get_audio_chunks(self, track: rtc.Track) -> AsyncGenerator[bytes, None]:
        """Get audio chunks from track."""
        # This is a simplified implementation
        # In a real implementation, you'd process the actual audio data
        while track.is_subscribed:
            # Simulate audio chunk processing
            await asyncio.sleep(0.1)
            yield b"audio_chunk_data"
    
    async def _get_video_frames(self, track: rtc.Track) -> AsyncGenerator[bytes, None]:
        """Get video frames from track."""
        # This is a simplified implementation
        # In a real implementation, you'd process the actual video frames
        while track.is_subscribed:
            # Simulate video frame processing
            await asyncio.sleep(0.1)
            yield b"video_frame_data"
    
    def get_active_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Get all active sessions."""
        return self.active_sessions.copy()
    
    def is_session_active(self, session_id: str) -> bool:
        """Check if a session is active."""
        return session_id in self.active_sessions 