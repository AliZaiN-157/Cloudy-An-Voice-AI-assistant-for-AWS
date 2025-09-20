"""
Main FastAPI application for the Real-time Voice AI Assistant Service.
"""

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from .core.config import settings
from .core.logging_config import setup_logging
from .api.rest_routes import router as rest_router
from .api.livekit_routes import router as livekit_router, livekit_endpoint


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting Real-time Voice AI Assistant Service...")
    setup_logging()
    logger.info(f"Application version: {settings.app_version}")
    logger.info(f"Debug mode: {settings.debug}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Real-time Voice AI Assistant Service...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Real-time Voice AI Assistant Backend with LiveKit integration and Gemini Live API",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Include REST API routes
app.include_router(rest_router)

# Include LiveKit routes
app.include_router(livekit_router)


@app.websocket("/ws/livekit")
async def livekit_websocket_endpoint(websocket: WebSocket):
    """LiveKit WebSocket endpoint for real-time communication."""
    try:
        await websocket.accept()
        await livekit_endpoint(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket.client_state.value != 3:  # Not closed
            await websocket.close()


@app.websocket("/ws/test")
async def test_websocket_endpoint(websocket: WebSocket):
    """Simple test WebSocket endpoint."""
    await websocket.accept()
    await websocket.send_text("Hello from WebSocket!")
    await websocket.close()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Real-time Voice AI Assistant Service",
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs" if settings.debug else "Documentation disabled in production",
        "features": [
            "LiveKit media streaming",
            "Gemini Live API integration",
            "Voice AI assistant"
        ]
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    uvicorn.run(
        "src.realtime_assistant_service.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    ) 