"""
Sessions router — /sessions/*

Endpoints:
    GET    /sessions                        — list user's sessions
    POST   /sessions                        — create session
    GET    /sessions/{id}                   — get single session
    DELETE /sessions/{id}                   — delete session + messages
    GET    /sessions/{id}/messages          — list messages
    POST   /sessions/{id}/messages          — append message
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models.message import MessageDoc
from app.models.session import SessionDoc
from app.models.user import UserDoc
from app.routers.auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    title: str | None = None


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str | None
    created_at: datetime
    updated_at: datetime


class MessageCreate(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    sources: list[dict] | None = None


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sources: list[dict] | None
    created_at: datetime


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_owned_session(
    session_id: str,
    current_user: UserDoc,
    db: AsyncIOMotorDatabase,
) -> SessionDoc:
    """Return the session if it exists and belongs to current_user, else 404."""
    doc = await db.sessions.find_one({"id": session_id})
    if doc is None or doc.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    return SessionDoc.from_mongo(doc)


def _session_to_response(s: SessionDoc) -> SessionResponse:
    return SessionResponse(
        id=s.id,
        title=s.title,
        created_at=s.created_at,
        updated_at=s.updated_at,
    )


def _message_to_response(m: MessageDoc) -> MessageResponse:
    return MessageResponse(
        id=m.id,
        session_id=m.session_id,
        role=m.role,
        content=m.content,
        sources=m.sources,
        created_at=m.created_at,
    )


# ── GET /sessions ─────────────────────────────────────────────────────────────

@router.get("", response_model=list[SessionResponse], summary="List all sessions")
async def list_sessions(
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[SessionResponse]:
    cursor = db.sessions.find({"user_id": current_user.id}).sort("updated_at", -1)
    sessions = [SessionDoc.from_mongo(doc) async for doc in cursor]
    return [_session_to_response(s) for s in sessions]


# ── POST /sessions ────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat session",
)
async def create_session(
    body: SessionCreate,
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SessionResponse:
    session = SessionDoc(user_id=current_user.id, title=body.title)
    await db.sessions.insert_one(session.to_mongo())
    return _session_to_response(session)


# ── GET /sessions/{session_id} ────────────────────────────────────────────────

@router.get("/{session_id}", response_model=SessionResponse, summary="Get a session by ID")
async def get_session(
    session_id: str,
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SessionResponse:
    session = await _get_owned_session(session_id, current_user, db)
    return _session_to_response(session)


# ── DELETE /sessions/{session_id} ─────────────────────────────────────────────

@router.delete("/{session_id}", status_code=status.HTTP_200_OK, summary="Delete a session")
async def delete_session(
    session_id: str,
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    await _get_owned_session(session_id, current_user, db)
    # Cascade-delete messages first, then the session
    await db.messages.delete_many({"session_id": session_id})
    await db.sessions.delete_one({"id": session_id})
    return {}


# ── PATCH /sessions/{session_id} ──────────────────────────────────────────────

class SessionUpdate(BaseModel):
    title: str


@router.patch(
    "/{session_id}",
    response_model=SessionResponse,
    summary="Rename a session",
)
async def rename_session(
    session_id: str,
    body: SessionUpdate,
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SessionResponse:
    """Update the title of a session owned by the current user."""
    session = await _get_owned_session(session_id, current_user, db)
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"title": body.title.strip()}},
    )
    session.title = body.title.strip()
    return _session_to_response(session)


# ── GET /sessions/{session_id}/messages ──────────────────────────────────────

@router.get(
    "/{session_id}/messages",
    response_model=list[MessageResponse],
    summary="List messages in a session",
)
async def list_messages(
    session_id: str,
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[MessageResponse]:
    await _get_owned_session(session_id, current_user, db)
    cursor = db.messages.find({"session_id": session_id}).sort("created_at", 1)
    messages = [MessageDoc.from_mongo(doc) async for doc in cursor]
    return [_message_to_response(m) for m in messages]


# ── POST /sessions/{session_id}/messages ─────────────────────────────────────

@router.post(
    "/{session_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Append a message to a session",
)
async def create_message(
    session_id: str,
    body: MessageCreate,
    current_user: UserDoc = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> MessageResponse:
    await _get_owned_session(session_id, current_user, db)

    message = MessageDoc(
        session_id=session_id,
        role=body.role,
        content=body.content,
        sources=body.sources,
    )
    await db.messages.insert_one(message.to_mongo())

    # Bump session.updated_at
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"updated_at": datetime.now(timezone.utc)}},
    )

    return _message_to_response(message)
