"""
Integrated service combining LiveKit for media transport and Gemini for AI processing.
"""

import asyncio
import base64
import json
import time
from typing import Optional, Dict, Any, Callable, AsyncGenerator
from loguru import logger

from .config import settings
from ..connectors.livekit_connector import LiveKitConnector
from ..connectors.gemini_live import GeminiLiveConnector


class IntegratedVoiceAIService:
    """Integrated service combining LiveKit and Gemini for real-time voice AI."""
    
    def __init__(self):
        """Initialize the integrated service."""
        self.livekit_connector = LiveKitConnector()
        self.gemini_connector = GeminiLiveConnector()
        self.logger = logger.bind(name="IntegratedVoiceAIService")
        
        # Session management
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Callbacks
        self.on_audio_output: Optional[Callable[[bytes, str], None]] = None
        self.on_text_response: Optional[Callable[[str, float], None]] = None
        self.on_status_change: Optional[Callable[[str], None]] = None
        self.on_error: Optional[Callable[[str], None]] = None
        
    async def initialize(self) -> None:
        """Initialize both LiveKit and Gemini connectors."""
        try:
            # Initialize LiveKit connector
            await self.livekit_connector.initialize()
            
            # Initialize Gemini connector
            await self.gemini_connector.initialize()
            
            # Set up LiveKit callbacks
            self.livekit_connector.set_callbacks({
                'on_audio_input': self._handle_audio_input,
                'on_screen_share': self._handle_screen_share,
                'on_status_change': self._handle_livekit_status_change,
                'on_error': self._handle_livekit_error
            })
            
            self.logger.info("Initialized integrated voice AI service")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize integrated service: {e}")
            raise
    
    async def create_session(self, user_id: str, session_config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a new voice AI session with LiveKit room and Gemini session."""
        try:
            session_id = f"{settings.livekit_room_prefix}-{user_id}-{int(time.time())}"
            
            # Create LiveKit room
            room_info = await self.livekit_connector.create_room(session_id, user_id)
            
            # Start Gemini session
            gemini_session = await self.gemini_connector.start_session(session_id, user_id, session_config)
            
            # Store session information
            self.active_sessions[session_id] = {
                "user_id": user_id,
                "session_id": session_id,
                "room_info": room_info,
                "gemini_session": gemini_session,
                "start_time": time.time(),
                "status": "active"
            }
            
            self.logger.info(f"Created session {session_id} for user {user_id}")
            
            return {
                "status": "success",
                "session_id": session_id,
                "room_info": room_info,
                "gemini_session": gemini_session
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create session for user {user_id}: {e}")
            raise
    
    async def join_session(self, session_id: str, user_id: str, token: str) -> None:
        """Join an existing session as a server-side participant."""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            # Join LiveKit room
            await self.livekit_connector.join_room(session_id, user_id, token)
            
            # Update session status
            self.active_sessions[session_id]["status"] = "connected"
            
            self.logger.info(f"Joined session {session_id} as server participant")
            
        except Exception as e:
            self.logger.error(f"Failed to join session {session_id}: {e}")
            raise
    
    async def _handle_audio_input(self, audio_data: bytes, format: str) -> None:
        """Handle audio input from LiveKit and process with Gemini."""
        try:
            # Convert audio data to base64 for Gemini
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Find the session this audio belongs to
            session_id = self._get_current_session_id()
            if not session_id:
                self.logger.warning("No active session for audio input")
                return
            
            # Process audio with Gemini
            async for response in self.gemini_connector.process_audio_input(audio_base64, session_id):
                if response["type"] == "text_response":
                    # Send text response to client
                    if self.on_text_response:
                        self.on_text_response(response["content"], 1.0)
                    
                    # TODO: Convert text to speech and send audio back via LiveKit
                    # For now, we'll just log the response
                    self.logger.info(f"AI Response: {response['content']}")
                    
                elif response["type"] == "error":
                    if self.on_error:
                        self.on_error(response["error"])
                        
        except Exception as e:
            self.logger.error(f"Error handling audio input: {e}")
            if self.on_error:
                self.on_error(str(e))
    
    async def _handle_screen_share(self, frame_data: bytes, format: str) -> None:
        """Handle screen share from LiveKit and process with Gemini."""
        try:
            # Convert frame data to base64 for Gemini
            frame_base64 = base64.b64encode(frame_data).decode('utf-8')
            
            # Find the session this frame belongs to
            session_id = self._get_current_session_id()
            if not session_id:
                self.logger.warning("No active session for screen share")
                return
            
            # Process screen share with Gemini
            async for response in self.gemini_connector.process_screen_share(frame_base64, session_id):
                if response["type"] == "text_response":
                    # Send text response to client
                    if self.on_text_response:
                        self.on_text_response(response["content"], 1.0)
                    
                    self.logger.info(f"AI Screen Analysis: {response['content']}")
                    
                elif response["type"] == "error":
                    if self.on_error:
                        self.on_error(response["error"])
                        
        except Exception as e:
            self.logger.error(f"Error handling screen share: {e}")
            if self.on_error:
                self.on_error(str(e))
    
    async def _handle_livekit_status_change(self, status: str) -> None:
        """Handle LiveKit status changes."""
        try:
            self.logger.info(f"LiveKit status changed: {status}")
            
            if self.on_status_change:
                self.on_status_change(status)
                
        except Exception as e:
            self.logger.error(f"Error handling LiveKit status change: {e}")
    
    async def _handle_livekit_error(self, error: str) -> None:
        """Handle LiveKit errors."""
        try:
            self.logger.error(f"LiveKit error: {error}")
            
            if self.on_error:
                self.on_error(error)
                
        except Exception as e:
            self.logger.error(f"Error handling LiveKit error: {e}")
    
    def _get_current_session_id(self) -> Optional[str]:
        """Get the current active session ID."""
        for session_id, session_info in self.active_sessions.items():
            if session_info["status"] == "connected":
                return session_id
        return None
    
    async def publish_ai_audio(self, audio_data: bytes, sample_rate: int = 16000, channels: int = 1) -> None:
        """Publish AI-generated audio back to the LiveKit room."""
        try:
            await self.livekit_connector.publish_audio(audio_data, sample_rate, channels)
            
            if self.on_audio_output:
                self.on_audio_output(audio_data, "wav")
                
        except Exception as e:
            self.logger.error(f"Failed to publish AI audio: {e}")
            if self.on_error:
                self.on_error(str(e))
    
    def set_callbacks(self, callbacks: Dict[str, Callable]) -> None:
        """Set callback functions for various events."""
        self.on_audio_output = callbacks.get('on_audio_output')
        self.on_text_response = callbacks.get('on_text_response')
        self.on_status_change = callbacks.get('on_status_change')
        self.on_error = callbacks.get('on_error')
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End a voice AI session."""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            # End Gemini session
            gemini_result = await self.gemini_connector.end_session(session_id)
            
            # Disconnect from LiveKit room
            await self.livekit_connector.disconnect()
            
            # Update session status
            self.active_sessions[session_id]["status"] = "ended"
            self.active_sessions[session_id]["end_time"] = time.time()
            
            self.logger.info(f"Ended session {session_id}")
            
            return {
                "status": "success",
                "session_id": session_id,
                "gemini_result": gemini_result
            }
            
        except Exception as e:
            self.logger.error(f"Failed to end session {session_id}: {e}")
            raise
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a session."""
        if session_id in self.active_sessions:
            session_info = self.active_sessions[session_id].copy()
            session_info["livekit_info"] = self.livekit_connector.get_room_info()
            session_info["gemini_info"] = self.gemini_connector.get_session_info(session_id)
            return session_info
        return None
    
    def is_session_active(self, session_id: str) -> bool:
        """Check if a session is active."""
        return (session_id in self.active_sessions and 
                self.active_sessions[session_id]["status"] == "connected")
    
    async def cleanup(self) -> None:
        """Clean up all resources."""
        try:
            # End all active sessions
            for session_id in list(self.active_sessions.keys()):
                if self.active_sessions[session_id]["status"] == "connected":
                    await self.end_session(session_id)
            
            # Disconnect from LiveKit
            await self.livekit_connector.disconnect()
            
            self.logger.info("Cleaned up integrated service")
            
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}") 