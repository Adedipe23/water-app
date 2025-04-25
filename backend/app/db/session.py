from typing import Generator
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,  # Set to True for debugging
    connect_args={"check_same_thread": False} if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {},
)


def create_db_and_tables() -> None:
    """Create database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Get a database session."""
    with Session(engine) as session:
        yield session
