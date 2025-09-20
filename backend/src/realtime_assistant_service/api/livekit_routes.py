"""
LiveKit-based routes for real-time voice AI assistant communication.
"""

import json
import uuid
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from loguru import logger
import time
import hashlib
import hmac

from ..models.schemas import (
    StartSessionMessage, AudioInputMessage, ScreenShareFrameMessage,
    EndSessionMessage, AudioOutputMessage, TextResponseMessage, ErrorMessage,
    ActionType
)
from ..connectors.gemini_live import GeminiLiveConnector
from ..core.config import settings


class LiveKitConnectionManager:
    """Manages LiveKit connections and sessions."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_connectors: Dict[str, GeminiLiveConnector] = {}
        self.room_sessions: Dict[str, Dict[str, Any]] = {}
        self.logger = logger.bind(name="LiveKitConnectionManager")
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept a WebSocket connection."""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.logger.info(f"LiveKit WebSocket connected for session {session_id}")
    
    def disconnect(self, session_id: str):
        """Remove a WebSocket connection."""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.session_connectors:
            del self.session_connectors[session_id]
        if session_id in self.room_sessions:
            del self.room_sessions[session_id]
        self.logger.info(f"LiveKit WebSocket disconnected for session {session_id}")
    
    async def send_message(self, session_id: str, message: Dict[str, Any]):
        """Send a message to a specific WebSocket connection."""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(message))
            except Exception as e:
                self.logger.error(f"Error sending message to session {session_id}: {e}")
                self.disconnect(session_id)
    
    async def send_error(self, session_id: str, code: str, message: str, details: Dict[str, Any] = None):
        """Send an error message to a WebSocket connection."""
        error_message = ErrorMessage(
            action=ActionType.ERROR,
            session_id=session_id,
            code=code,
            message=message,
            details=details
        )
        await self.send_message(session_id, error_message.dict())
    
    def create_access_token(self, room_name: str, participant_identity: str) -> str:
        """Create a LiveKit access token using HMAC."""
        # Create a simple token for demo purposes
        timestamp = int(time.time())
        expires = timestamp + 3600  # 1 hour
        
        # Create a simple token string
        token_data = f"{settings.livekit_api_key}:{participant_identity}:{room_name}:{expires}"
        
        # Create HMAC signature
        signature = hmac.new(
            settings.livekit_api_secret.encode('utf-8'),
            token_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Return a simple token format
        return f"{token_data}:{signature}"


# Global connection manager
manager = LiveKitConnectionManager()


async def livekit_endpoint(websocket: WebSocket):
    """Main LiveKit WebSocket endpoint for real-time communication."""
    session_id = None
    connector = None
    
    try:
        logger.info("New LiveKit WebSocket connection established")
        
        async for message in websocket.iter_text():
            try:
                # Parse the message
                data = json.loads(message)
                action = data.get("action")
                
                if action == ActionType.START_SESSION:
                    await handle_start_session(websocket, data)
                    
                elif action == ActionType.AUDIO_INPUT:
                    await handle_audio_input(websocket, data)
                    
                elif action == ActionType.SCREEN_SHARE_FRAME:
                    await handle_screen_share_frame(websocket, data)
                    
                elif action == ActionType.END_SESSION:
                    await handle_end_session(websocket, data)
                    
                else:
                    await websocket.send_text(json.dumps({
                        "action": "error",
                        "code": "INVALID_ACTION",
                        "message": f"Unknown action: {action}"
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "action": "error",
                    "code": "INVALID_JSON",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_text(json.dumps({
                    "action": "error",
                    "code": "INTERNAL_ERROR",
                    "message": "Internal server error"
                }))
                
    except WebSocketDisconnect:
        logger.info(f"LiveKit WebSocket disconnected for session {session_id}")
        if session_id:
            manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"LiveKit WebSocket error: {e}")
        if session_id:
            manager.disconnect(session_id)


async def handle_start_session(websocket: WebSocket, data: Dict[str, Any]):
    """Handle session start request with LiveKit integration."""
    try:
        # Validate the message
        start_message = StartSessionMessage(**data)
        
        # Generate session ID if not provided
        session_id = start_message.session_id or str(uuid.uuid4())
        user_id = start_message.user_id
        
        # Create LiveKit room name
        room_name = f"{settings.livekit_room_prefix}-{session_id}"
        
        # Create LiveKit access token
        access_token = manager.create_access_token(room_name, user_id)
        
        # Create Gemini connector for this session
        connector = GeminiLiveConnector()
        await connector.initialize()
        
        # Start the session
        result = await connector.start_session(session_id, user_id, start_message.config)
        
        # Store the connector and session info
        manager.session_connectors[session_id] = connector
        manager.room_sessions[session_id] = {
            "room_name": room_name,
            "user_id": user_id,
            "access_token": access_token,
            "start_time": datetime.now(timezone.utc),
            "status": "active"
        }
        
        # Send success response with LiveKit info
        await websocket.send_text(json.dumps({
            "action": "session_started",
            "session_id": session_id,
            "status": "success",
            "message": "Session started successfully",
            "livekit": {
                "room_name": room_name,
                "access_token": access_token,
                "url": settings.livekit_url
            }
        }))
        
        logger.info(f"LiveKit session {session_id} started for user {user_id} in room {room_name}")
        
    except Exception as e:
        logger.error(f"Error starting LiveKit session: {e}")
        await websocket.send_text(json.dumps({
            "action": "error",
            "code": "SESSION_START_ERROR",
            "message": f"Failed to start session: {str(e)}"
        }))


async def handle_audio_input(websocket: WebSocket, data: Dict[str, Any]):
    """Handle audio input from client via LiveKit."""
    try:
        # Validate the message
        audio_message = AudioInputMessage(**data)
        session_id = audio_message.session_id
        
        # Get the connector for this session
        connector = manager.session_connectors.get(session_id)
        if not connector:
            await websocket.send_text(json.dumps({
                "action": "error",
                "code": "SESSION_NOT_FOUND",
                "message": f"Session {session_id} not found"
            }))
            return
        
        # Process the audio input with error handling
        try:
            async for response in connector.process_audio_input(audio_message.data, session_id):
                if response["type"] == "text_response":
                    # Send text response
                    text_message = TextResponseMessage(
                        action=ActionType.TEXT_RESPONSE,
                        session_id=session_id,
                        text=response["content"]
                    )
                    await websocket.send_text(json.dumps(text_message.dict()))
                    
                elif response["type"] == "audio_response":
                    # Send audio response (placeholder for now)
                    audio_message = AudioOutputMessage(
                        action=ActionType.AUDIO_OUTPUT,
                        session_id=session_id,
                        data="",  # Placeholder for audio data
                        format="wav",
                        sample_rate=16000,
                        channels=1
                    )
                    await websocket.send_text(json.dumps(audio_message.dict()))
                    
                elif response["type"] == "error":
                    # Handle processing error - default to silence as per Error-Driven Silence principle
                    logger.warning(f"Audio processing error for session {session_id}: {response['error']}")
                    await websocket.send_text(json.dumps({
                        "action": "error",
                        "code": "AUDIO_PROCESSING_ERROR",
                        "message": "Audio processing failed, please try again"
                    }))
                    
        except Exception as processing_error:
            # Critical error - default to silence
            logger.error(f"Critical audio processing error for session {session_id}: {processing_error}")
            await websocket.send_text(json.dumps({
                "action": "error",
                "code": "CRITICAL_AUDIO_ERROR",
                "message": "Audio processing unavailable, please restart session"
            }))
                
    except Exception as e:
        logger.error(f"Error processing audio input: {e}")
        await websocket.send_text(json.dumps({
            "action": "error",
            "code": "AUDIO_PROCESSING_ERROR",
            "message": f"Failed to process audio: {str(e)}"
        }))


async def handle_screen_share_frame(websocket: WebSocket, data: Dict[str, Any]):
    """Handle screen share frame from client via LiveKit."""
    try:
        # Validate the message
        screen_message = ScreenShareFrameMessage(**data)
        session_id = screen_message.session_id
        
        # Get the connector for this session
        connector = manager.session_connectors.get(session_id)
        if not connector:
            await websocket.send_text(json.dumps({
                "action": "error",
                "code": "SESSION_NOT_FOUND",
                "message": f"Session {session_id} not found"
            }))
            return
        
        # Process the screen share frame with error handling
        try:
            async for response in connector.process_screen_share(screen_message.data, session_id):
                if response["type"] == "text_response":
                    # Send text response
                    text_message = TextResponseMessage(
                        action=ActionType.TEXT_RESPONSE,
                        session_id=session_id,
                        text=response["content"]
                    )
                    await websocket.send_text(json.dumps(text_message.dict()))
                    
                elif response["type"] == "error":
                    # Handle processing error - default to silence
                    logger.warning(f"Screen share processing error for session {session_id}: {response['error']}")
                    await websocket.send_text(json.dumps({
                        "action": "error",
                        "code": "SCREEN_SHARE_ERROR",
                        "message": "Screen analysis failed, please try again"
                    }))
                    
        except Exception as processing_error:
            # Critical error - default to silence
            logger.error(f"Critical screen share processing error for session {session_id}: {processing_error}")
            await websocket.send_text(json.dumps({
                "action": "error",
                "code": "CRITICAL_SCREEN_ERROR",
                "message": "Screen analysis unavailable, please restart session"
            }))
                
    except Exception as e:
        logger.error(f"Error processing screen share: {e}")
        await websocket.send_text(json.dumps({
            "action": "error",
            "code": "SCREEN_SHARE_ERROR",
            "message": f"Failed to process screen share: {str(e)}"
        }))


async def handle_end_session(websocket: WebSocket, data: Dict[str, Any]):
    """Handle session end request."""
    try:
        # Validate the message
        end_message = EndSessionMessage(**data)
        session_id = end_message.session_id
        
        # Get the connector for this session
        connector = manager.session_connectors.get(session_id)
        if not connector:
            await websocket.send_text(json.dumps({
                "action": "error",
                "code": "SESSION_NOT_FOUND",
                "message": f"Session {session_id} not found"
            }))
            return
        
        # End the session
        result = await connector.end_session(session_id)
        
        # Clean up LiveKit session
        manager.disconnect(session_id)
        
        # Send success response
        await websocket.send_text(json.dumps({
            "action": "session_ended",
            "session_id": session_id,
            "status": "success",
            "message": "Session ended successfully",
            "duration": result.get("duration", 0)
        }))
        
        logger.info(f"LiveKit session {session_id} ended successfully")
        
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        await websocket.send_text(json.dumps({
            "action": "error",
            "code": "SESSION_END_ERROR",
            "message": f"Failed to end session: {str(e)}"
        }))


# REST API endpoints for LiveKit management
router = APIRouter(prefix="/api/v1/livekit", tags=["livekit"])


@router.post("/token")
async def create_livekit_token(room_name: str, participant_identity: str):
    """Create a LiveKit access token."""
    try:
        access_token = manager.create_access_token(room_name, participant_identity)
        return {
            "access_token": access_token,
            "room_name": room_name,
            "participant_identity": participant_identity
        }
    except Exception as e:
        logger.error(f"Error creating LiveKit token: {e}")
        raise HTTPException(status_code=500, detail="Failed to create access token")


@router.get("/sessions/{session_id}")
async def get_session_info(session_id: str):
    """Get LiveKit session information."""
    session_info = manager.room_sessions.get(session_id)
    if not session_info:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "room_name": session_info["room_name"],
        "user_id": session_info["user_id"],
        "status": session_info["status"],
        "start_time": session_info["start_time"].isoformat()
    } 