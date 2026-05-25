"""
Authentication helpers: JWT creation/validation and password hashing.
"""

from __future__ import annotations

import uuid
import warnings
from datetime import datetime, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# ── Secret key ────────────────────────────────────────────────────────────────
_SECRET_KEY = settings.SECRET_KEY
if not _SECRET_KEY:
    _SECRET_KEY = str(uuid.uuid4())
    warnings.warn(
        "SECRET_KEY is not set in .env. "
        "A random key was generated — tokens will not survive a restart.",
        stacklevel=1,
    )

# ── Password hashing ──────────────────────────────────────────────────────────
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(plaintext: str) -> str:
    return _pwd_context.hash(plaintext)


def verify_password(plaintext: str, hashed: str) -> bool:
    return _pwd_context.verify(plaintext, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────

def create_access_token(user_id: str, email: str) -> str:
    """Return a signed JWT access token (expires in 15 min)."""
    now = int(datetime.now(timezone.utc).timestamp())
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "iat": now,
        "exp": now + settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, _SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str, email: str) -> str:
    """Return a signed JWT refresh token (expires in 7 days)."""
    now = int(datetime.now(timezone.utc).timestamp())
    payload = {
        "sub": user_id,
        "email": email,
        "type": "refresh",
        "iat": now,
        "exp": now + settings.REFRESH_TOKEN_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, _SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT.
    Raises JWTError on any failure (expired, bad signature, etc.).
    """
    return jwt.decode(token, _SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
