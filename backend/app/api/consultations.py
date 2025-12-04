from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.db.database import get_db
from app.models.models import User, Consultation, UserRole, ConsultationStatus
from app.schemas.consultation import ConsultationCreate, Consultation as ConsultationSchema, ConsultationUpdate

router = APIRouter()

@router.post("/", response_model=ConsultationSchema)
def create_consultation(
    *,
    db: Session = Depends(get_db),
    consultation_in: ConsultationCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    consultation = Consultation(
        **consultation_in.dict(),
        user_id=current_user.id,
        status=ConsultationStatus.OPEN
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation

@router.get("/", response_model=List[ConsultationSchema])
def read_consultations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    if current_user.role == UserRole.EXPERT:
        # Experts see tickets assigned to them or open tickets (simplified logic)
        # For now, let's show all tickets to experts for simplicity, or just assigned ones
        # Real logic: show assigned + pool of unassigned
        return db.query(Consultation).filter(
            (Consultation.expert_id == current_user.id) | (Consultation.expert_id == None)
        ).offset(skip).limit(limit).all()
    elif current_user.role == UserRole.ADMIN:
        return db.query(Consultation).offset(skip).limit(limit).all()
    else:
        # Users see their own tickets
        return db.query(Consultation).filter(Consultation.user_id == current_user.id).offset(skip).limit(limit).all()

@router.patch("/{id}/assign", response_model=ConsultationSchema)
def assign_consultation(
    *,
    db: Session = Depends(get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    if current_user.role != UserRole.EXPERT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    consultation.expert_id = current_user.id
    consultation.status = ConsultationStatus.IN_PROGRESS
    db.commit()
    db.refresh(consultation)
    return consultation

@router.patch("/{id}/reply", response_model=ConsultationSchema)
def reply_consultation(
    *,
    db: Session = Depends(get_db),
    id: UUID,
    consultation_update: ConsultationUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    if current_user.role != UserRole.EXPERT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    if consultation_update.expert_response:
        consultation.expert_response = consultation_update.expert_response
        consultation.status = ConsultationStatus.RESOLVED
        
    db.commit()
    db.refresh(consultation)
    return consultation
