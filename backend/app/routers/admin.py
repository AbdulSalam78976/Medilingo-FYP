"""
Admin router — /admin/*

Requires the caller to be an authenticated user whose email is in ADMIN_EMAILS.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.database import get_db
from app.models.user import UserDoc
from app.routers.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(user: UserDoc = Depends(get_current_user)) -> UserDoc:
    if user.email not in settings.ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return user


# ── GET /admin/stats ──────────────────────────────────────────────────────────

@router.get("/stats", summary="Aggregate platform statistics")
async def get_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    _: UserDoc = Depends(_require_admin),
) -> dict:
    users_count = await db.users.count_documents({})
    sessions_count = await db.sessions.count_documents({})
    messages_count = await db.messages.count_documents({})
    assistant_messages = await db.messages.count_documents({"role": "assistant"})

    # Sessions created in the last 7 days
    from datetime import timedelta
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent_sessions = await db.sessions.count_documents(
        {"created_at": {"$gte": week_ago}}
    )

    # Top active users (by message count)
    pipeline = [
        {"$group": {"_id": "$session_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_sessions_cursor = db.messages.aggregate(pipeline)
    top_sessions = await top_sessions_cursor.to_list(length=5)

    # RAG vector store info
    try:
        from app.services.rag_service import get_rag_engine
        engine = get_rag_engine()
        vs_stats = engine.vector_store.get_collection_stats()
        indexed_docs = vs_stats.get("total_documents", 0)
    except Exception:
        indexed_docs = 0

    return {
        "users": users_count,
        "sessions": sessions_count,
        "messages": messages_count,
        "assistant_messages": assistant_messages,
        "recent_sessions_7d": recent_sessions,
        "indexed_documents": indexed_docs,
        "top_sessions_by_messages": top_sessions,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── GET /admin/queries ────────────────────────────────────────────────────────

@router.get("/queries", summary="Recent user queries (last 50 user messages)")
async def get_recent_queries(
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _: UserDoc = Depends(_require_admin),
) -> dict:
    if limit > 200:
        limit = 200

    cursor = db.messages.find(
        {"role": "user"},
        {"_id": 0, "id": 1, "session_id": 1, "content": 1, "created_at": 1},
    ).sort("created_at", -1).limit(limit)

    messages: List[dict] = await cursor.to_list(length=limit)
    return {"queries": messages, "count": len(messages)}


# ── GET /admin/users ──────────────────────────────────────────────────────────

@router.get("/users", summary="List registered users")
async def list_users(
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _: UserDoc = Depends(_require_admin),
) -> dict:
    if limit > 500:
        limit = 500
    cursor = db.users.find(
        {},
        {"_id": 0, "id": 1, "email": 1, "created_at": 1},
    ).sort("created_at", -1).limit(limit)
    users = await cursor.to_list(length=limit)
    return {"users": users, "count": len(users)}
