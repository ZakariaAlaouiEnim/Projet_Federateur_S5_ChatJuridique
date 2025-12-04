from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.models import ConsultationStatus

class ConsultationBase(BaseModel):
    subject: str
    description: str

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationUpdate(BaseModel):
    status: Optional[ConsultationStatus] = None
    expert_response: Optional[str] = None

class ConsultationInDBBase(ConsultationBase):
    id: UUID
    user_id: UUID
    expert_id: Optional[UUID] = None
    status: ConsultationStatus
    created_at: datetime
    expert_response: Optional[str] = None

    class Config:
        from_attributes = True

class Consultation(ConsultationInDBBase):
    pass
