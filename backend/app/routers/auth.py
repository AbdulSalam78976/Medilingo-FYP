"""
Authentication router — /auth/*

Endpoints:
    POST /auth/register  — create account, return access token + refresh cookie
    POST /auth/login     — verify credentials, return access token + refresh cookie
    POST /auth/refresh   — exchange refresh cookie for new access token
    POST /auth/logout    — clear refresh cookie
    GET  /auth/me        — return current user profile
"""

from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr, field_validator

from app.database import get_db
from app.models.user import UserDoc
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str


# ── OAuth2 scheme (used by get_current_user) ──────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

_REFRESH_COOKIE_NAME = "refresh_token"
_CREDENTIALS_EXC = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="strict",
        secure=False,   # set True behind HTTPS in production
        max_age=settings.REFRESH_TOKEN_EXPIRE_SECONDS,
    )


# ── Dependency: get_current_user ──────────────────────────────────────────────

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> UserDoc:
    """
    Validate Bearer token and return the corresponding UserDoc.
    Raises HTTP 401 on any failure.
    """
    try:
        payload = decode_token(token)
    except JWTError:
        raise _CREDENTIALS_EXC

    if payload.get("type") != "access":
        raise _CREDENTIALS_EXC

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise _CREDENTIALS_EXC

    doc = await db.users.find_one({"id": user_id})
    if doc is None:
        raise _CREDENTIALS_EXC

    return UserDoc.from_mongo(doc)


# ── POST /auth/register ───────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> TokenResponse:
    # Check uniqueness
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    user = UserDoc(email=body.email, hashed_password=hash_password(body.password))
    await db.users.insert_one(user.to_mongo())

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id, user.email)
    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token)


# ── POST /auth/login ──────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate with email and password",
)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> TokenResponse:
    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    doc = await db.users.find_one({"email": body.email})
    if doc is None:
        raise _invalid

    user = UserDoc.from_mongo(doc)
    if not verify_password(body.password, user.hashed_password):
        raise _invalid

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id, user.email)
    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token)


# ── POST /auth/refresh ────────────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange refresh cookie for a new access token",
)
async def refresh(
    refresh_token: str | None = Cookie(default=None, alias=_REFRESH_COOKIE_NAME),
) -> TokenResponse:
    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if refresh_token is None:
        raise _invalid

    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise _invalid

    if payload.get("type") != "refresh":
        raise _invalid

    user_id: str | None = payload.get("sub")
    email: str | None = payload.get("email")
    if not user_id or not email:
        raise _invalid

    return TokenResponse(access_token=create_access_token(user_id, email))


# ── POST /auth/logout ─────────────────────────────────────────────────────────

@router.post("/logout", status_code=status.HTTP_200_OK, summary="Clear refresh cookie")
async def logout(response: Response) -> dict:
    response.delete_cookie(key=_REFRESH_COOKIE_NAME, httponly=True, samesite="strict", secure=False)
    return {"detail": "Logged out"}


# ── GET /auth/me ──────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse, summary="Return current user profile")
async def me(current_user: UserDoc = Depends(get_current_user)) -> UserResponse:
    return UserResponse(id=current_user.id, email=current_user.email)
