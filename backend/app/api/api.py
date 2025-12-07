from fastapi import APIRouter
from app.api import auth, admin, chat, consultations, availability, appointments, experts

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(experts.router, prefix="/experts", tags=["experts"])


