"""
Simple FastAPI backend for SynthChat
Provides a proxy to synthetic.new API to avoid CORS issues
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import httpx

from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = False
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    content: str
    model: str


# API configuration
SYNTHETIC_API_URL = "https://api.synthetic.new/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    async with httpx.AsyncClient() as client:
        app.state.http_client = client
        yield
    # Shutdown
    await client.aclose()


app = FastAPI(
    title="SynthChat API",
    description="Backend proxy for SynthChat PWA",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat")
async def chat_completion(request: ChatRequest, authorization: str = ""):
    """
    Proxy chat completion requests to synthetic.new API
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    api_token = authorization.replace("Bearer ", "")

    payload = {
        "model": request.model,
        "messages": [{"role": m.role, "content": m.content} for m in request.messages],
        "stream": request.stream,
        "temperature": request.temperature,
    }

    if request.max_tokens:
        payload["max_tokens"] = request.max_tokens

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{SYNTHETIC_API_URL}/chat/completions",
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail=f"API error: {response.text}"
                )

            data = response.json()
            content = data["choices"][0]["message"]["content"] if data.get("choices") else ""

            return ChatResponse(content=content, model=request.model)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to synthetic.new timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


# Serve static files (built frontend)
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        """Serve the frontend app"""
        if path.startswith("api"):
            return {"detail": "Not found"}

        file_path = f"dist/{path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse("dist/index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
