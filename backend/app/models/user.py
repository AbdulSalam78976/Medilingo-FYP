"""
User document schema for MongoDB.

Collection: users
Fields:
    _id           — MongoDB ObjectId (auto-generated)
    id            — UUID string (used as the public identifier)
    email         — unique, indexed
    hashed_password — bcrypt hash
    created_at    — UTC datetime
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field


def _new_uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserDoc(BaseModel):
    """Represents a user document stored in MongoDB."""

    id: str = Field(default_factory=_new_uuid)
    email: EmailStr
    hashed_password: str
    created_at: datetime = Field(default_factory=_utcnow)

    def to_mongo(self) -> dict:
        """Serialize to a dict suitable for MongoDB insertion."""
        return self.model_dump()

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserDoc":
        """Deserialize from a MongoDB document."""
        doc = dict(doc)
        doc.pop("_id", None)   # strip ObjectId
        return cls(**doc)
