from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import socketio
from app.socket_events import sio

fastapi_app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from app.api.api import api_router
fastapi_app.include_router(api_router, prefix=settings.API_V1_STR)


# Set all CORS enabled origins
# Set all CORS enabled origins
# Set all CORS enabled origins
origins = []
if settings.BACKEND_CORS_ORIGINS:
    origins.extend([str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS])

# Add explicit origins just in case
origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"])

print(f"Allowed Origins: {origins}")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@fastapi_app.get("/")
def root():
    return {"message": "Welcome to Jurid-AI API"}

# Mount Socket.IO app as a sub-application
# socketio_path="" because FastAPI strips the "/socket.io" prefix
socket_app = socketio.ASGIApp(sio, socketio_path="")
fastapi_app.mount("/socket.io", socket_app)

app = fastapi_app
