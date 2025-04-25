import logging
import sys
from typing import Any, Dict, List, Tuple

from loguru import logger
from pydantic import BaseModel


class InterceptHandler(logging.Handler):
    """
    Default handler from examples in loguru documentation.
    See https://loguru.readthedocs.io/en/stable/overview.html
    """

    def emit(self, record: logging.LogRecord) -> None:
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


class LoggingSettings(BaseModel):
    LOGGING_LEVEL: str = logging.INFO
    LOGGERS: List[str] = ["uvicorn", "uvicorn.access"]


def setup_logging() -> None:
    """
    Configure logging with loguru.
    """
    logging_settings = LoggingSettings()
    
    # Remove default handlers
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stdout,
        enqueue=True,
        backtrace=True,
        level=logging_settings.LOGGING_LEVEL,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>"
        ),
    )

    # Intercept standard logging messages toward loguru
    logging.basicConfig(handlers=[InterceptHandler()], level=0)
    
    # Update logger levels for libraries
    for logger_name in logging_settings.LOGGERS:
        logging_logger = logging.getLogger(logger_name)
        logging_logger.handlers = [InterceptHandler()]
        logging_logger.propagate = False
