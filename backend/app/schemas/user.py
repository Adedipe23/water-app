from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema."""
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    reminder_frequency: Optional[int] = 60  # in minutes
    active_hours_start: Optional[int] = 8   # 8 AM
    active_hours_end: Optional[int] = 22    # 10 PM


class UserCreate(UserBase):
    """User creation schema."""
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    """User update schema."""
    password: Optional[str] = None


class UserInDBBase(UserBase):
    """User in DB base schema."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class User(UserInDBBase):
    """User schema."""
    pass


class UserInDB(UserInDBBase):
    """User in DB schema."""
    hashed_password: str
