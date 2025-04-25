from typing import Generator, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import get_session
from app.models.user import User
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting a database session.
    """
    yield from get_session()


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2),
) -> User:
    """
    Dependency for getting the current user.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    try:
        # Try to convert the token subject to UUID
        user_id = UUID(token_data.sub)
        user = db.exec(select(User).where(User.id == user_id)).first()
    except ValueError:
        # If conversion fails, try using the string directly
        user = db.exec(select(User).where(User.id == token_data.sub)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency for getting the current active user.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user
