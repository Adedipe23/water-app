from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models import User


def test_register(client: TestClient, session: Session):
    """
    Test user registration endpoint.

    Verifies that:
    1. Registration endpoint returns 200 status code
    2. Response contains expected user data
    3. User is properly created in the database
    """
    # Test data
    user_data = {
        "email": "newuser@example.com",
        "password": "password123",
        "reminder_frequency": 60,
        "active_hours_start": 8,
        "active_hours_end": 22,
    }

    # Make request
    response = client.post("/api/v1/auth/register", json=user_data)

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data

    # Check database
    user = session.exec(select(User).where(User.email == user_data["email"])).first()
    assert user is not None
    assert user.email == user_data["email"]
    assert user.is_active is True


def test_login(client: TestClient, test_user: User):
    """
    Test user login endpoint.

    Verifies that:
    1. Login endpoint returns 200 status code with valid credentials
    2. Response contains access token and correct token type

    Args:
        client: Test client fixture
        test_user: Pre-created test user fixture (used indirectly)
    """
    # Test data
    login_data = {
        "username": "test@example.com",
        "password": "password",
    }

    # Make request
    response = client.post("/api/v1/auth/login", data=login_data)

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, test_user: User):
    """
    Test login with incorrect password.

    Verifies that:
    1. Login endpoint returns 401 Unauthorized with invalid credentials
    2. Response contains error detail message

    Args:
        client: Test client fixture
        test_user: Pre-created test user fixture (used indirectly)
    """
    # Test data
    login_data = {
        "username": "test@example.com",
        "password": "wrong_password",
    }

    # Make request
    response = client.post("/api/v1/auth/login", data=login_data)

    # Check response
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
