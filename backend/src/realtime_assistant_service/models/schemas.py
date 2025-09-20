"""
Pydantic models for request/response validation and data schemas.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class ActionType(str, Enum):
    """WebSocket message action types."""
    START_SESSION = "start_session"
    AUDIO_INPUT = "audio_input"
    SCREEN_SHARE_FRAME = "screen_share_frame"
    END_SESSION = "end_session"
    AUDIO_OUTPUT = "audio_output"
    TEXT_RESPONSE = "text_response"
    ERROR = "error"


class WebSocketMessage(BaseModel):
    """Base WebSocket message model."""
    action: ActionType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class StartSessionMessage(WebSocketMessage):
    """Message to start a new session."""
    action: ActionType = ActionType.START_SESSION
    user_id: str = Field(..., description="User ID for the session")
    session_id: Optional[str] = Field(None, description="Optional custom session ID")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Session configuration")


class AudioInputMessage(WebSocketMessage):
    """Message containing audio input data."""
    action: ActionType = ActionType.AUDIO_INPUT
    session_id: str = Field(..., description="Session ID")
    data: str = Field(..., description="Base64 encoded audio chunk")
    format: str = Field(default="wav", description="Audio format")
    sample_rate: int = Field(default=16000, description="Audio sample rate")
    channels: int = Field(default=1, description="Number of audio channels")


class ScreenShareFrameMessage(WebSocketMessage):
    """Message containing screen share frame data."""
    action: ActionType = ActionType.SCREEN_SHARE_FRAME
    session_id: str = Field(..., description="Session ID")
    data: str = Field(..., description="Base64 encoded image frame")
    format: str = Field(default="png", description="Image format")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Frame timestamp")


class EndSessionMessage(WebSocketMessage):
    """Message to end a session."""
    action: ActionType = ActionType.END_SESSION
    session_id: str = Field(..., description="Session ID to end")


class AudioOutputMessage(WebSocketMessage):
    """Message containing audio output data."""
    action: ActionType = ActionType.AUDIO_OUTPUT
    session_id: str = Field(..., description="Session ID")
    data: str = Field(..., description="Base64 encoded audio chunk")
    format: str = Field(default="wav", description="Audio format")
    sample_rate: int = Field(default=16000, description="Audio sample rate")
    channels: int = Field(default=1, description="Number of audio channels")


class TextResponseMessage(WebSocketMessage):
    """Message containing text response."""
    action: ActionType = ActionType.TEXT_RESPONSE
    session_id: str = Field(..., description="Session ID")
    text: str = Field(..., description="Text response content")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score")


class ErrorMessage(WebSocketMessage):
    """Message containing error information."""
    action: ActionType = ActionType.ERROR
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


# REST API Models
class UserCreate(BaseModel):
    """Model for user registration."""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")


class UserLogin(BaseModel):
    """Model for user login."""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")


class UserProfile(BaseModel):
    """Model for user profile."""
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    full_name: Optional[str] = Field(None, description="Full name")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    is_active: bool = Field(default=True, description="Account status")


class Token(BaseModel):
    """Model for authentication token."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")


class SessionInfo(BaseModel):
    """Model for session information."""
    id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Session creation timestamp")
    ended_at: Optional[datetime] = Field(None, description="Session end timestamp")
    status: str = Field(..., description="Session status")
    config: Dict[str, Any] = Field(default_factory=dict, description="Session configuration")


class ConversationHistory(BaseModel):
    """Model for conversation history."""
    session_id: str = Field(..., description="Session ID")
    messages: List[Dict[str, Any]] = Field(default_factory=list, description="Conversation messages")
    total_messages: int = Field(default=0, description="Total number of messages")
    duration_seconds: Optional[float] = Field(None, description="Session duration in seconds")


class HealthCheck(BaseModel):
    """Model for health check response."""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Check timestamp")
    version: str = Field(..., description="Application version")
    uptime: float = Field(..., description="Service uptime in seconds")


class MetricsResponse(BaseModel):
    """Model for metrics response."""
    active_connections: int = Field(..., description="Number of active WebSocket connections")
    total_sessions: int = Field(..., description="Total number of sessions")
    average_response_time: float = Field(..., description="Average response time in milliseconds")
    error_rate: float = Field(..., description="Error rate percentage")
    memory_usage: float = Field(..., description="Memory usage in MB")
    cpu_usage: float = Field(..., description="CPU usage percentage") 