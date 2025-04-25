from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class GoalBase(BaseModel):
    """Base goal schema."""
    goal_amount: int = 8


class GoalCreate(GoalBase):
    """Goal creation schema."""
    pass


class GoalUpdate(GoalBase):
    """Goal update schema."""
    pass


class GoalInDBBase(GoalBase):
    """Goal in DB base schema."""
    id: UUID
    user_id: UUID
    updated_at: datetime

    class Config:
        orm_mode = True


class Goal(GoalInDBBase):
    """Goal schema."""
    pass


class GoalInDB(GoalInDBBase):
    """Goal in DB schema."""
    pass
