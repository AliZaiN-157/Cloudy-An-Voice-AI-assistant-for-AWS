"""
Configuration settings for the Real-time Voice AI Assistant Service.
"""

from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application settings
    app_name: str = "Real-time Voice AI Assistant"
    app_version: str = "0.1.0"
    debug: bool = Field(default=False, env="DEBUG")
    
    # Server settings
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    
    # Gemini Live API settings
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-1.5-flash", env="GEMINI_MODEL")
    
    # LiveKit settings
    livekit_url: str = Field(default="ws://localhost:7880", env="LIVEKIT_URL")
    livekit_api_key: str = Field(..., env="LIVEKIT_API_KEY")
    livekit_api_secret: str = Field(..., env="LIVEKIT_API_SECRET")
    livekit_room_prefix: str = Field(default="voice-ai", env="LIVEKIT_ROOM_PREFIX")
    
    # Database settings
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    # Redis settings (for session management)
    redis_url: Optional[str] = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Authentication settings
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Logging settings
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(
        default="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
                "<level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
                "<level>{message}</level>",
        env="LOG_FORMAT"
    )
    
    # WebSocket settings
    max_connections: int = Field(default=1000, env="MAX_CONNECTIONS")
    ping_interval: int = Field(default=20, env="PING_INTERVAL")
    ping_timeout: int = Field(default=20, env="PING_TIMEOUT")
    
    # Audio settings
    audio_sample_rate: int = Field(default=16000, env="AUDIO_SAMPLE_RATE")
    audio_channels: int = Field(default=1, env="AUDIO_CHANNELS")
    audio_format: str = Field(default="wav", env="AUDIO_FORMAT")
    
    # CORS settings
    cors_origins: list[str] = Field(default=["*"], env="CORS_ORIGINS")
    cors_allow_credentials: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")
    cors_allow_methods: list[str] = Field(default=["*"], env="CORS_ALLOW_METHODS")
    cors_allow_headers: list[str] = Field(default=["*"], env="CORS_ALLOW_HEADERS")
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }


# Global settings instance
settings = Settings() 