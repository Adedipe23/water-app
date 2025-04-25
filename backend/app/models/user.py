from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from uuid import UUID, uuid4


class UserBase(SQLModel):
    """Base User model with common attributes."""
    email: str = Field(unique=True, index=True)
    is_active: bool = Field(default=True)
    reminder_frequency: int = Field(default=60)  # in minutes
    active_hours_start: int = Field(default=8)   # 8 AM
    active_hours_end: int = Field(default=22)    # 10 PM


class User(UserBase, table=True):
    """User model for database storage."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    water_logs: List["WaterLog"] = Relationship(back_populates="user")
    goal: Optional["Goal"] = Relationship(back_populates="user")
    streak: Optional["Streak"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    """Schema for user creation."""
    password: str


class UserRead(UserBase):
    """Schema for reading user data."""
    id: UUID
    created_at: datetime
