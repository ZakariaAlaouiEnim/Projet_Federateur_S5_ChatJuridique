from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.db.database import get_db
from app.models.models import User, UserRole, Appointment, AppointmentStatus
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, Appointment as AppointmentSchema

router = APIRouter()

@router.post("/", response_model=AppointmentSchema)
def create_appointment(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Request a new appointment.
    """
    appointment = Appointment(
        user_id=current_user.id,
        expert_id=appointment_in.expert_id,
        consultation_id=appointment_in.consultation_id,
        start_time=appointment_in.start_time,
        end_time=appointment_in.end_time,
        status=AppointmentStatus.PENDING
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/me", response_model=List[AppointmentSchema])
def read_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get appointments for the current user (either as client or expert).
    """
    if current_user.role == UserRole.EXPERT:
        appointments = db.query(Appointment).filter(Appointment.expert_id == current_user.id).all()
    else:
        appointments = db.query(Appointment).filter(Appointment.user_id == current_user.id).all()
    return appointments

@router.patch("/{appointment_id}", response_model=AppointmentSchema)
def update_appointment(
    appointment_id: UUID,
    appointment_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Update appointment status or time.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Check permissions
    if current_user.id != appointment.user_id and current_user.id != appointment.expert_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if appointment_in.status:
        appointment.status = appointment_in.status
    if appointment_in.start_time:
        appointment.start_time = appointment_in.start_time
    if appointment_in.end_time:
        appointment.end_time = appointment_in.end_time
    if appointment_in.meeting_link:
        appointment.meeting_link = appointment_in.meeting_link
        
    db.commit()
    db.refresh(appointment)
    return appointment
