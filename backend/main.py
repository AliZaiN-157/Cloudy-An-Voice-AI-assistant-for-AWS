"""
Entry point for the Real-time Voice AI Assistant Backend.
"""

import uvicorn
from src.realtime_assistant_service.core.config import settings
from src.realtime_assistant_service.core.logging_config import setup_logging


def main():
    """Main entry point for the application."""
    # Setup logging
    setup_logging()
    
    # Start the server
    uvicorn.run(
        "src.realtime_assistant_service.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )


if __name__ == "__main__":
    main()
