import shutil
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services import rag_service
from app.api import deps
from app.models.models import User, UserRole

router = APIRouter()

@router.post("/ingest")
def ingest_documents(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user)
):
    # Check if user is admin
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        num_chunks = rag_service.ingest_document(file_path)
        return {"message": f"Successfully ingested {file.filename}", "chunks": num_chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

from app.schemas.user import UserCreate, User as UserSchema
from app.services import security
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Expert

class ExpertCreate(UserCreate):
    domain: str = "General"

@router.post("/experts", response_model=UserSchema)
def create_expert(
    expert_in: ExpertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.email == expert_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
        
    user = User(
        email=expert_in.email,
        hashed_password=security.get_password_hash(expert_in.password),
        full_name=expert_in.full_name,
        role=UserRole.EXPERT,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    expert = Expert(
        id=user.id,
        domain=expert_in.domain,
        is_available=True,
        verified=True # Admin created, so verified by default
    )
    db.add(expert)
    db.commit()
    
    return user
