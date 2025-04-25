from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from uuid import UUID, uuid4


class WaterLogBase(SQLModel):
    """Base WaterLog model with common attributes."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    amount: int = Field(default=1)  # Default to 1 unit (e.g., 1 glass)
    notes: Optional[str] = None


class WaterLog(WaterLogBase, table=True):
    """WaterLog model for database storage."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    
    # Relationships
    user: "User" = Relationship(back_populates="water_logs")


class WaterLogCreate(WaterLogBase):
    """Schema for water log creation."""
    pass


class WaterLogRead(WaterLogBase):
    """Schema for reading water log data."""
    id: UUID
    user_id: UUID
