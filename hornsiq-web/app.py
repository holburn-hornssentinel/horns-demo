"""
HornsIQ Web Chat Interface

FastAPI server providing web-based chat interface powered by Onyx.
"""
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from onyx_client import OnyxClient


app = FastAPI(
    title="HornsIQ Web Chat",
    description="AI-powered security assistant",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Onyx client
onyx = OnyxClient()

# Static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


class ChatRequest(BaseModel):
    message: str
    persona_id: int = 0
    conversation_id: Optional[int] = None


class SearchRequest(BaseModel):
    query: str
    limit: int = 5


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main chat interface."""
    chat_file = Path(__file__).parent / "static" / "chat.html"
    if chat_file.exists():
        return FileResponse(chat_file)
    return HTMLResponse(content="<h1>HornsIQ Chat</h1><p>Chat interface not found</p>")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "hornsiq-web"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Send a chat message and get a response.

    Args:
        request: Chat request with message and optional persona

    Returns:
        Chat response from Onyx
    """
    try:
        response = await onyx.chat(
            message=request.message,
            persona_id=request.persona_id,
            conversation_id=request.conversation_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
async def search(request: SearchRequest):
    """
    Search the knowledge base.

    Args:
        request: Search request with query and limit

    Returns:
        Search results
    """
    try:
        response = await onyx.search(
            query=request.query,
            limit=request.limit
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/personas")
async def get_personas():
    """Get available chat personas."""
    return {"personas": onyx.get_personas()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3978)
