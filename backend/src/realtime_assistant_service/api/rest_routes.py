"""
REST API routes for management tasks and user operations.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger
from ..models.schemas import (
    UserCreate, UserLogin, UserProfile, Token, SessionInfo,
    ConversationHistory, HealthCheck, MetricsResponse
)
from ..core.config import settings

# Security
security = HTTPBearer()

# Router
router = APIRouter(prefix="/api/v1", tags=["management"])


# Authentication utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    from jose import JWTError, jwt
    
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token."""
    from jose import JWTError, jwt
    
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Mock user database (replace with actual database)
mock_users = {
    "user1": {
        "id": "user1",
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ8Kz6e",  # "password"
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": True
    }
}


@router.post("/users/register", response_model=UserProfile)
async def register_user(user: UserCreate):
    """Register a new user."""
    # Check if user already exists
    for existing_user in mock_users.values():
        if existing_user["username"] == user.username or existing_user["email"] == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
    
    # Create new user (in real implementation, hash the password)
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user_id = f"user_{len(mock_users) + 1}"
    new_user = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": pwd_context.hash(user.password),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    mock_users[user_id] = new_user
    
    logger.info(f"New user registered: {user.username}")
    
    return UserProfile(**new_user)


@router.post("/users/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    """Authenticate user and return access token."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Find user by username or email
    user = None
    for existing_user in mock_users.values():
        if (existing_user["username"] == user_credentials.username or 
            existing_user["email"] == user_credentials.username):
            user = existing_user
            break
    
    if not user or not pwd_context.verify(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user['username']}")
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.get("/users/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(user_id: str, current_user_id: str = Depends(verify_token)):
    """Get user profile."""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this profile"
        )
    
    user = mock_users.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserProfile(**user)


@router.put("/users/{user_id}/profile", response_model=UserProfile)
async def update_user_profile(
    user_id: str, 
    profile_update: dict,
    current_user_id: str = Depends(verify_token)
):
    """Update user profile."""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this profile"
        )
    
    user = mock_users.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update allowed fields
    allowed_fields = ["full_name", "email"]
    for field, value in profile_update.items():
        if field in allowed_fields:
            user[field] = value
    
    user["updated_at"] = datetime.utcnow()
    
    logger.info(f"User profile updated: {user_id}")
    
    return UserProfile(**user)


@router.get("/sessions/{session_id}/history", response_model=ConversationHistory)
async def get_session_history(
    session_id: str,
    current_user_id: str = Depends(verify_token)
):
    """Get conversation history for a session."""
    # Get the connector for this session
    # The manager object is no longer imported, so this part of the code will need to be refactored
    # or the manager object needs to be re-introduced.
    # For now, we'll raise an error as the manager is removed.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Session history retrieval is not yet implemented."
    )


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint."""
    import psutil
    import time
    
    # Calculate uptime (simplified)
    start_time = getattr(health_check, '_start_time', None)
    if start_time is None:
        start_time = time.time()
        health_check._start_time = start_time
    
    uptime = time.time() - start_time
    
    return HealthCheck(
        status="healthy",
        version=settings.app_version,
        uptime=uptime
    )


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """Get system metrics."""
    import psutil
    
    # Get system metrics
    memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=1)
    
    # Get connection metrics
    # The manager object is no longer imported, so this part of the code will need to be refactored
    # or the manager object needs to be re-introduced.
    # For now, we'll return placeholder values.
    active_connections = 0 # Placeholder
    total_sessions = 0 # Placeholder
    
    # Calculate average response time (simplified)
    # In a real implementation, you'd track this over time
    average_response_time = 500.0  # Placeholder
    
    # Calculate error rate (simplified)
    error_rate = 0.0  # Placeholder
    
    return MetricsResponse(
        active_connections=active_connections,
        total_sessions=total_sessions,
        average_response_time=average_response_time,
        error_rate=error_rate,
        memory_usage=memory.used / (1024 * 1024),  # MB
        cpu_usage=cpu_percent
    )


@router.get("/sessions", response_model=List[SessionInfo])
async def list_user_sessions(current_user_id: str = Depends(verify_token)):
    """List all sessions for the current user."""
    # The manager object is no longer imported, so this part of the code will need to be refactored
    # or the manager object needs to be re-introduced.
    # For now, we'll return an empty list.
    return [] 