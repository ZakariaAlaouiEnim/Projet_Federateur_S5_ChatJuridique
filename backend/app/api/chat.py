from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.services import rag_service
from app.api import deps
from app.models.models import User, Conversation, Message, MessageRole
from app.db.database import get_db
import uuid

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    role: str
    content: str
    sources: list = []

class ChatResponse(BaseModel):
    response: str
    sources: list = []

@router.get("/history", response_model=list[MessageResponse])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # For now, we just get the most recent conversation or all messages flattened
    # Simpler approach: Get the latest conversation's messages
    conversation = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(desc(Conversation.created_at)).first()
    
    if not conversation:
        return []
        
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at).all()
    
    return [
        MessageResponse(
            role=msg.role,
            content=msg.content,
            sources=msg.citations if msg.citations else []
        ) for msg in messages
    ]

@router.post("/query", response_model=ChatResponse)
def chat_query(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    try:
        # Get or create conversation
        conversation = db.query(Conversation).filter(
            Conversation.user_id == current_user.id
        ).order_by(desc(Conversation.created_at)).first()
        
        if not conversation:
            conversation = Conversation(user_id=current_user.id, title="New Chat")
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=request.message
        )
        db.add(user_msg)
        
        # Get AI response
        result = rag_service.query_rag(request.message)
        
        # Extract sources from context
        sources = []
        if "context" in result:
            for doc in result["context"]:
                sources.append({
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata
                })
        
        # Save AI response
        ai_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=result["answer"],
            citations=sources
        )
        db.add(ai_msg)
        db.commit()
                
        return {
            "response": result["answer"],
            "sources": sources
        }
    except ValueError as e:
        # Handle case where vector store is empty
        return {
            "response": "I'm sorry, my knowledge base is currently empty. Please ask an administrator to upload legal documents.",
            "sources": []
        }
    except Exception as e:
        print(f"Error in chat_query: {e}")
        raise HTTPException(status_code=500, detail=str(e))
