"""
Medilingo — FastAPI application factory.

Startup sequence:
    1. Connect to MongoDB (Motor async driver)
    2. Initialise RAG components (embeddings + ChromaDB + Groq)

Shutdown sequence:
    1. Persist ChromaDB vector store
    2. Close MongoDB connection
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import connect_db, close_db
from app.routers import auth, sessions, query, admin
from app.services.rag_service import init_rag, shutdown_rag

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (replaces deprecated @app.on_event) ─────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    logger.info("=== Medilingo starting up ===")

    # 1. MongoDB
    await connect_db()

    # 2. RAG (heavy — sentence-transformers + ChromaDB)
    try:
        settings.validate()
        init_rag()
    except Exception as exc:
        logger.error(f"RAG initialisation failed: {exc}")
        # App still starts; /query endpoints will return 500 until fixed

    logger.info("=== Startup complete ===")
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("=== Medilingo shutting down ===")
    shutdown_rag()
    await close_db()


# ── App instance ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Medilingo",
    description=(
        "Cross-lingual medical assistant — English, Urdu, Roman Urdu. "
        "Powered by RAG (ChromaDB + Groq LLaMA) with MongoDB persistence."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

import os as _os

# Allowed origins — comma-separated list in ALLOWED_ORIGINS env var.
# Defaults to the Vite dev server. In production set this to your frontend domain.
_raw_origins = _os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
)
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,       # required for HttpOnly cookie exchange
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(query.router)
app.include_router(admin.router)

# ── Global exception handler ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error.", "error": str(exc)},
    )

# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["system"], summary="Health check")
async def health_check() -> dict:
    from datetime import datetime
    return {
        "status": "healthy" if settings.GROQ_API_KEY else "degraded",
        "timestamp": datetime.now().isoformat(),
        "groq_configured": bool(settings.GROQ_API_KEY),
        "mongodb_uri": settings.MONGODB_URI.split("@")[-1],  # hide credentials
    }

# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/", tags=["system"], summary="API info")
async def root() -> dict:
    return {
        "name": "Medilingo",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "auth": "/auth",
            "sessions": "/sessions",
            "query": "/query",
            "image_analysis": "/query/image",
            "symptom_check": "/symptom-check",
            "drug_interactions": "/drug-interactions",
            "pipeline": "/pipeline/status",
            "admin": "/admin/stats",
        },
    }
