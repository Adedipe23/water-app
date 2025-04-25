from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID


class WaterLogBase(BaseModel):
    """Base water log schema."""
    amount: Optional[int] = 1
    notes: Optional[str] = None


class WaterLogCreate(WaterLogBase):
    """Water log creation schema."""
    timestamp: Optional[datetime] = None


class WaterLogUpdate(WaterLogBase):
    """Water log update schema."""
    timestamp: Optional[datetime] = None


class WaterLogInDBBase(WaterLogBase):
    """Water log in DB base schema."""
    id: UUID
    user_id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True


class WaterLog(WaterLogInDBBase):
    """Water log schema."""
    pass


class WaterLogInDB(WaterLogInDBBase):
    """Water log in DB schema."""
    pass


class DailyWaterLog(BaseModel):
    """Daily water log schema."""
    date: date
    total_amount: int
    logs: List[WaterLog]


class DateRange(BaseModel):
    """Date range schema."""
    start_date: date
    end_date: date


class WaterStats(BaseModel):
    """Water stats schema."""
    period: str  # "weekly" or "monthly"
    data: List[dict]  # List of {date: str, amount: int}
