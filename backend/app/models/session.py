"""
Session document schema for MongoDB.

Collection: sessions
Fields:
    _id        — MongoDB ObjectId
    id         — UUID string (public identifier)
    user_id    — references users.id
    title      — optional human-readable title
    created_at — UTC datetime
    updated_at — UTC datetime; bumped on every new message
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel, Field


def _new_uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SessionDoc(BaseModel):
    """Represents a session document stored in MongoDB."""

    id: str = Field(default_factory=_new_uuid)
    user_id: str
    title: str | None = None
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    def to_mongo(self) -> dict:
        return self.model_dump()

    @classmethod
    def from_mongo(cls, doc: dict) -> "SessionDoc":
        doc = dict(doc)
        doc.pop("_id", None)
        return cls(**doc)
