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
