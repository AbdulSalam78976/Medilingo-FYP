"""
Message document schema for MongoDB.

Collection: messages
Fields:
    _id        — MongoDB ObjectId
    id         — UUID string (public identifier)
    session_id — references sessions.id
    role       — "user" | "assistant"
    content    — full message text
    sources    — list of retrieved-doc dicts, or None
    created_at — UTC datetime
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field


def _new_uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class MessageDoc(BaseModel):
    """Represents a message document stored in MongoDB."""

    id: str = Field(default_factory=_new_uuid)
    session_id: str
    role: Literal["user", "assistant"]
    content: str
    sources: list[dict] | None = None
    created_at: datetime = Field(default_factory=_utcnow)

    def to_mongo(self) -> dict:
        return self.model_dump()

    @classmethod
    def from_mongo(cls, doc: dict) -> "MessageDoc":
        doc = dict(doc)
        doc.pop("_id", None)
        # Motor returns naive datetimes; attach UTC so FastAPI serialises with 'Z'
        if isinstance(doc.get("created_at"), datetime) and doc["created_at"].tzinfo is None:
            doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
        return cls(**doc)
