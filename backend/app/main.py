import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.init_db import init_db

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup: Initialize database
    logger.info("Initializing database")
    init_db()
    logger.info("Database initialized")

    yield

    # Shutdown: Clean up resources if needed
    logger.info("Shutting down application")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="API for tracking water intake and maintaining hydration goals",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    # Set up CORS
    if settings.BACKEND_CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware,
            # allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Include API router
    application.include_router(api_router, prefix=settings.API_V1_STR)

    return application


app = create_application()


@app.get("/")
async def root():
    """
    Root endpoint that provides a welcome message.

    Returns:
        Simple welcome message with API name
    """
    return {"message": "Welcome to the Water Reminder Button API"}
