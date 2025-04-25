import logging
from uuid import uuid4

from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.db.session import engine
from app.models import User, Goal, Streak

logger = logging.getLogger(__name__)


def init_db() -> None:
    """
    Initialize the database schema and create initial data if needed.

    This function:
    1. Creates all database tables based on SQLModel definitions
    2. Creates an initial admin user if no users exist
    3. Sets up default goals and streak tracking for the admin
    """
    from app.db.session import create_db_and_tables

    # Create tables
    create_db_and_tables()

    # Add initial data if needed
    with Session(engine) as session:
        # Check if we need to create an initial admin user
        result = session.exec(select(User))
        user_count = len(result.all())

        if user_count == 0:
            logger.info("Creating initial admin user")

            # Create admin user with default credentials
            admin_id = uuid4()
            admin = User(
                id=admin_id,
                email="admin@example.com",
                hashed_password=get_password_hash("password123"),
                is_active=True,
            )
            session.add(admin)

            # Create initial goal for admin (8 units)
            goal = Goal(
                user_id=admin_id,
                goal_amount=8,
            )
            session.add(goal)

            # Create initial streak tracking for admin
            streak = Streak(
                user_id=admin_id,
                current_streak=0,
                longest_streak=0,
            )
            session.add(streak)

            session.commit()
            logger.info("Initial admin user created")
