from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.models.models import User, UserRole, Expert
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_experts(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Retrieve all users with the role 'expert'.
    """
    experts = db.query(User).filter(User.role == UserRole.EXPERT).all()
    return experts
