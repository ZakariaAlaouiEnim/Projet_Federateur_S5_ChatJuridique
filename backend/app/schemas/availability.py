from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ExpertAvailabilityBase(BaseModel):
    day_of_week: Optional[str] = None
    specific_date: Optional[datetime] = None
    start_time: str
    end_time: str
    is_recurring: bool = True

class ExpertAvailabilityCreate(ExpertAvailabilityBase):
    pass

class ExpertAvailability(ExpertAvailabilityBase):
    id: UUID
    expert_id: UUID

    class Config:
        from_attributes = True
