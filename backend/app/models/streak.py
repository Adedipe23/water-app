from datetime import date, datetime
from sqlmodel import Field, Relationship, SQLModel
from uuid import UUID, uuid4


class StreakBase(SQLModel):
    """Base Streak model with common attributes."""
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    last_logged_date: date = Field(default_factory=lambda: date.today())
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Streak(StreakBase, table=True):
    """Streak model for database storage."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
    
    # Relationships
    user: "User" = Relationship(back_populates="streak")


class StreakRead(StreakBase):
    """Schema for reading streak data."""
    id: UUID
    user_id: UUID
