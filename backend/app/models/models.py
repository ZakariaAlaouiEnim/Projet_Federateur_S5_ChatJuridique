import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    EXPERT = "expert"
    ADMIN = "admin"

class SourceType(str, enum.Enum):
    CODE = "Code"
    JURISPRUDENCE = "Jurisprudence"
    ARTICLE = "Article"

class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ConsultationStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.USER) # Storing enum as string for simplicity
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    expert_profile = relationship("Expert", back_populates="user", uselist=False)
    conversations = relationship("Conversation", back_populates="user")
    consultations = relationship("Consultation", back_populates="user")
    appointments = relationship("Appointment", back_populates="user")

class Expert(Base):
    __tablename__ = "experts"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    domain = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    verified = Column(Boolean, default=False)

    user = relationship("User", back_populates="expert_profile")
    consultations = relationship("Consultation", back_populates="expert")
    availability = relationship("ExpertAvailability", back_populates="expert")
    appointments = relationship("Appointment", back_populates="expert")

class LegalSource(Base):
    __tablename__ = "legal_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    source_type = Column(String, nullable=False) # Enum: Code, Jurisprudence, Article
    url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    citations = Column(JSON, nullable=True) # List of LegalSource IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    expert_id = Column(UUID(as_uuid=True), ForeignKey("experts.id"), nullable=True)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default=ConsultationStatus.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expert_response = Column(Text, nullable=True)

    user = relationship("User", back_populates="consultations")
    expert = relationship("Expert", back_populates="consultations")

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    EXPERT_PROPOSED_NEW_TIME = "expert_proposed_new_time"
    USER_PROPOSED_NEW_TIME = "user_proposed_new_time"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ExpertAvailability(Base):
    __tablename__ = "expert_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id = Column(UUID(as_uuid=True), ForeignKey("experts.id"), nullable=False)
    day_of_week = Column(String, nullable=True) # 0=Monday, 6=Sunday
    specific_date = Column(DateTime, nullable=True) # For specific overrides
    start_time = Column(String, nullable=False) # Format "HH:MM"
    end_time = Column(String, nullable=False) # Format "HH:MM"
    is_recurring = Column(Boolean, default=True)

    expert = relationship("Expert", back_populates="availability")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    expert_id = Column(UUID(as_uuid=True), ForeignKey("experts.id"), nullable=False)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default=AppointmentStatus.PENDING)
    meeting_link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="appointments")
    expert = relationship("Expert", back_populates="appointments")
    consultation = relationship("Consultation")
