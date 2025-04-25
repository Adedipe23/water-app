from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from uuid import UUID, uuid4


class GoalBase(SQLModel):
    """Base Goal model with common attributes."""
    goal_amount: int = Field(default=8)  # Default to 8 units (e.g., 8 glasses)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Goal(GoalBase, table=True):
    """Goal model for database storage."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
    
    # Relationships
    user: "User" = Relationship(back_populates="goal")


class GoalCreate(GoalBase):
    """Schema for goal creation."""
    pass


class GoalRead(GoalBase):
    """Schema for reading goal data."""
    id: UUID
    user_id: UUID
