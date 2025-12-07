from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.db.database import get_db
from app.models.models import User, UserRole, ExpertAvailability, Expert
from app.schemas.availability import ExpertAvailabilityCreate, ExpertAvailability as ExpertAvailabilitySchema

router = APIRouter()

@router.get("/{expert_id}/availability", response_model=List[ExpertAvailabilitySchema])
def read_expert_availability(
    expert_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Get availability slots for a specific expert.
    """
    availability = db.query(ExpertAvailability).filter(ExpertAvailability.expert_id == expert_id).all()
    return availability

@router.post("/me/availability", response_model=ExpertAvailabilitySchema)
def create_availability(
    availability_in: ExpertAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create a new availability slot. Only for experts.
    """
    if current_user.role != UserRole.EXPERT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Verify expert profile exists
    expert = db.query(Expert).filter(Expert.id == current_user.id).first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert profile not found")

    availability = ExpertAvailability(
        expert_id=current_user.id,
        day_of_week=availability_in.day_of_week,
        specific_date=availability_in.specific_date,
        start_time=availability_in.start_time,
        end_time=availability_in.end_time,
        is_recurring=availability_in.is_recurring
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability

@router.delete("/me/availability/{availability_id}")
def delete_availability(
    availability_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Delete an availability slot.
    """
    if current_user.role != UserRole.EXPERT:
        raise HTTPException(status_code=403, detail="Not authorized")

    availability = db.query(ExpertAvailability).filter(
        ExpertAvailability.id == availability_id,
        ExpertAvailability.expert_id == current_user.id
    ).first()
    
    if not availability:
        raise HTTPException(status_code=404, detail="Availability slot not found")
        
    db.delete(availability)
    db.commit()
    return {"message": "Availability slot deleted"}
