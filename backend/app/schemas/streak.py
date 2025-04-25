from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class StreakBase(BaseModel):
    """Base streak schema."""
    current_streak: int
    longest_streak: int
    last_logged_date: date


class StreakInDBBase(StreakBase):
    """Streak in DB base schema."""
    id: UUID
    user_id: UUID
    updated_at: datetime

    class Config:
        orm_mode = True


class Streak(StreakInDBBase):
    """Streak schema."""
    pass


class StreakInDB(StreakInDBBase):
    """Streak in DB schema."""
    pass
