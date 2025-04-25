from typing import Optional
from uuid import UUID

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.goal import Goal
from app.models.streak import Streak
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """
    Service layer for user-related operations.

    This class provides methods for user management including:
    - User retrieval by email or ID
    - User creation with initial goal and streak
    - User profile updates
    - Authentication
    """

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """
        Retrieve a user by their email address.

        Args:
            db: Database session
            email: User's email address

        Returns:
            User object if found, None otherwise
        """
        return db.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> Optional[User]:
        """
        Retrieve a user by their ID.

        Args:
            db: Database session
            user_id: User's UUID

        Returns:
            User object if found, None otherwise
        """
        return db.get(User, user_id)

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        """
        Create a new user with default goal and streak.

        Args:
            db: Database session
            user_in: User creation data

        Returns:
            Created user object or None if user already exists
        """
        existing_user = UserService.get_by_email(db, user_in.email)
        if existing_user:
            return None

        user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            is_active=True,
            reminder_frequency=user_in.reminder_frequency,
            active_hours_start=user_in.active_hours_start,
            active_hours_end=user_in.active_hours_end,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Initialize default goal (8 units)
        goal = Goal(
            user_id=user.id,
            goal_amount=8,
        )
        db.add(goal)

        # Initialize streak tracking
        streak = Streak(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
        )
        db.add(streak)

        db.commit()

        return user

    @staticmethod
    def update(db: Session, user: User, user_in: UserUpdate) -> User:
        """
        Update a user's profile information.

        Args:
            db: Database session
            user: User object to update
            user_in: User update data

        Returns:
            Updated user object
        """
        if user_in.email is not None:
            user.email = user_in.email
        if user_in.is_active is not None:
            user.is_active = user_in.is_active
        if user_in.reminder_frequency is not None:
            user.reminder_frequency = user_in.reminder_frequency
        if user_in.active_hours_start is not None:
            user.active_hours_start = user_in.active_hours_start
        if user_in.active_hours_end is not None:
            user.active_hours_end = user_in.active_hours_end
        if user_in.password is not None:
            user.hashed_password = get_password_hash(user_in.password)

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password.

        Args:
            db: Database session
            email: User's email address
            password: User's plain text password

        Returns:
            User object if authentication succeeds, None otherwise
        """
        user = UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def is_active(user: User) -> bool:
        """
        Check if a user account is active.

        Args:
            user: User object to check

        Returns:
            True if user is active, False otherwise
        """
        return user.is_active
