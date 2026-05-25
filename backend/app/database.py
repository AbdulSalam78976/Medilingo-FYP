"""
MongoDB connection using Motor (async driver).

Exports:
    get_database()  — returns the AsyncIOMotorDatabase instance
    connect_db()    — called on app startup
    close_db()      — called on app shutdown
    get_db()        — FastAPI dependency that yields the database
"""

import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger(__name__)

# Module-level client — created once on startup
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Open the MongoDB connection and create indexes."""
    global _client, _db
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI} ...")
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client[settings.MONGODB_DB_NAME]

    # ── Indexes ───────────────────────────────────────────────────────────────
    # users: unique email
    await _db.users.create_index("email", unique=True)

    # sessions: list by user ordered by updated_at DESC
    await _db.sessions.create_index([("user_id", 1), ("updated_at", -1)])

    # messages: list by session ordered by created_at ASC
    await _db.messages.create_index([("session_id", 1), ("created_at", 1)])

    logger.info("MongoDB connected and indexes ensured.")


async def close_db() -> None:
    """Close the MongoDB connection."""
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance (call after connect_db)."""
    if _db is None:
        raise RuntimeError("Database not initialised — call connect_db() first.")
    return _db


async def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency that yields the MongoDB database."""
    yield get_database()
