import os
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import settings
from app.api.deps import get_db
from app.main import app
from app.models import User, Goal, Streak
from app.core.security import get_password_hash


@pytest.fixture(name="client")
def client_fixture():
    """Create a test client."""
    with TestClient(app) as client:
        yield client


@pytest.fixture(name="session")
def session_fixture():
    """Create a test database session."""
    # Create an in-memory SQLite database for testing
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Override the get_db dependency
        def get_test_session():
            yield session

        app.dependency_overrides[get_db] = get_test_session

        yield session

    # Clean up
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session):
    """Create a test user."""
    # Create test user
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password"),
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create goal for test user
    goal = Goal(
        user_id=user.id,
        goal_amount=8,
    )
    session.add(goal)

    # Create streak for test user
    streak = Streak(
        user_id=user.id,
        current_streak=0,
        longest_streak=0,
    )
    session.add(streak)

    session.commit()

    return user
