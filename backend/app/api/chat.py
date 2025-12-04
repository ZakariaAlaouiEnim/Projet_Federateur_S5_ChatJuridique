from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services import rag_service
from app.api import deps
from app.models.models import User

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: list = []

@router.post("/query", response_model=ChatResponse)
def chat_query(
    request: ChatRequest,
    current_user: User = Depends(deps.get_current_user)
):
    try:
        result = rag_service.query_rag(request.message)
        
        # Extract sources from context
        sources = []
        if "context" in result:
            for doc in result["context"]:
                sources.append({
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata
                })
                
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
        raise HTTPException(status_code=500, detail=str(e))
