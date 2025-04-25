from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.token import Token
from app.schemas.user import User, UserCreate
from app.services.user import UserService

router = APIRouter()


@router.post("/register", response_model=User)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    """
    Register a new user in the system.

    Parameters:
    - **user_in**: User creation data including email, password, and preferences

    Returns:
    - User object with created user details

    Raises:
    - 400 Bad Request: If email is already registered
    """
    user = UserService.get_by_email(db, user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = UserService.create(db, user_in)
    return user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login endpoint.

    Parameters:
    - **username**: Email address of the user (sent as username in the form)
    - **password**: User's password

    Returns:
    - JWT access token for authenticating future requests

    Raises:
    - 401 Unauthorized: If credentials are invalid
    - 400 Bad Request: If user account is inactive
    """
    user = UserService.authenticate(
        db, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not UserService.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
