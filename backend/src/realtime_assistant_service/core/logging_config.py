"""
Logging configuration for the Real-time Voice AI Assistant Service.
"""

import sys
from pathlib import Path
from loguru import logger
from .config import settings


def setup_logging() -> None:
    """Configure structured logging for the application."""
    
    # Remove default logger
    logger.remove()
    
    # Add console logger with custom format
    logger.add(
        sys.stdout,
        format=settings.log_format,
        level=settings.log_level,
        colorize=True,
        backtrace=True,
        diagnose=True,
    )
    
    # Add file logger for production
    if not settings.debug:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        logger.add(
            log_dir / "app.log",
            format=settings.log_format,
            level=settings.log_level,
            rotation="10 MB",
            retention="7 days",
            compression="zip",
            backtrace=True,
            diagnose=True,
        )
        
        # Add error log file
        logger.add(
            log_dir / "error.log",
            format=settings.log_format,
            level="ERROR",
            rotation="10 MB",
            retention="30 days",
            compression="zip",
            backtrace=True,
            diagnose=True,
        )
    
    # Intercept standard library logging
    import logging
    
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Get corresponding Loguru level if it exists
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno
            
            # Find caller from where originated the logged message
            frame, depth = sys._getframe(6), 6
            while frame and frame.f_code.co_filename == __file__:
                frame = frame.f_back
                depth += 1
            
            logger.opt(depth=depth, exception=record.exc_info).log(
                level, record.getMessage()
            )
    
    # Replace standard library logging with loguru
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Set loguru as the default logger for uvicorn
    logging.getLogger("uvicorn").handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
    
    logger.info("Logging configured successfully")


def get_logger(name: str = __name__):
    """Get a logger instance with the specified name."""
    return logger.bind(name=name) 