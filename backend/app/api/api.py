from fastapi import APIRouter
from app.api import auth, admin, chat, consultations

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])


