from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from app.models.models import AppointmentStatus

class AppointmentBase(BaseModel):
    start_time: datetime
    end_time: datetime
    consultation_id: Optional[UUID] = None

class AppointmentCreate(AppointmentBase):
    expert_id: UUID

class AppointmentUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    meeting_link: Optional[str] = None

class Appointment(AppointmentBase):
    id: UUID
    user_id: UUID
    expert_id: UUID
    status: AppointmentStatus
    meeting_link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
