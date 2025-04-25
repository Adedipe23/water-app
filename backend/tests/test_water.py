from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.security import create_access_token
from app.models import User, WaterLog


def get_auth_headers(user: User):
    """Get authentication headers for a user."""
    # Convert UUID to string for token creation
    user_id_str = str(user.id)
    access_token = create_access_token(subject=user_id_str)
    return {"Authorization": f"Bearer {access_token}"}


def test_log_water(client: TestClient, session: Session, test_user: User):
    """Test logging water intake."""
    # Test data
    log_data = {
        "amount": 1,
        "notes": "Test log",
    }

    # Make request
    response = client.post(
        "/api/v1/water/log",
        json=log_data,
        headers=get_auth_headers(test_user),
    )

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == log_data["amount"]
    assert data["notes"] == log_data["notes"]
    assert "id" in data
    assert data["user_id"] == str(test_user.id)

    # Check database
    water_log = session.exec(select(WaterLog).where(WaterLog.user_id == test_user.id)).first()
    assert water_log is not None
    assert water_log.amount == log_data["amount"]
    assert water_log.notes == log_data["notes"]


def test_get_today_logs(client: TestClient, session: Session, test_user: User):
    """Test getting today's water logs."""
    # Create test logs
    log1 = WaterLog(
        user_id=test_user.id,
        amount=1,
        timestamp=datetime.now(timezone.utc),
    )
    log2 = WaterLog(
        user_id=test_user.id,
        amount=2,
        timestamp=datetime.now(timezone.utc),
    )
    session.add(log1)
    session.add(log2)
    session.commit()

    # Make request
    response = client.get(
        "/api/v1/water/today",
        headers=get_auth_headers(test_user),
    )

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "date" in data
    assert data["total_amount"] == 3
    assert len(data["logs"]) == 2


def test_get_goal(client: TestClient, session: Session, test_user: User):
    """Test getting water goal."""
    # Make request
    response = client.get(
        "/api/v1/water/goal",
        headers=get_auth_headers(test_user),
    )

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["goal_amount"] == 8
    assert data["user_id"] == str(test_user.id)


def test_update_goal(client: TestClient, session: Session, test_user: User):
    """Test updating water goal."""
    # Test data
    goal_data = {
        "goal_amount": 10,
    }

    # Make request
    response = client.post(
        "/api/v1/water/goal",
        json=goal_data,
        headers=get_auth_headers(test_user),
    )

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["goal_amount"] == goal_data["goal_amount"]
    assert data["user_id"] == str(test_user.id)
