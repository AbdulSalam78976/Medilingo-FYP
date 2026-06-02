"""
Central configuration for Medilingo.
All settings are loaded from environment variables via python-dotenv.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

_ENV_PATH = Path(__file__).parent.parent / ".env"
load_dotenv(_ENV_PATH)

_BACKEND_DIR = Path(__file__).parent.parent


class Settings:
    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "medilingo")

    # ── JWT Auth ──────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 900        # 15 minutes
    REFRESH_TOKEN_EXPIRE_SECONDS: int = 604_800   # 7 days

    # ── LLM provider ─────────────────────────────────────────────────────────
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")  # "groq" or "gemini"

    # ── Groq LLM ──────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ── Gemini LLM ────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # ── Embedding model ───────────────────────────────────────────────────────
    # BAAI/bge-small-en-v1.5: 384-dim, free, open-source, better retrieval than
    # all-MiniLM-L6-v2 for domain-specific text.
    # NOTE: changing this requires re-running POST /pipeline/ingest-sync.
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # ── RAG / chunking ────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RETRIEVAL: int = 5
    # Minimum cosine similarity for a chunk to be included in the LLM context.
    # 0.35 works well with bge-small; raise to 0.45 if responses pull in noise.
    SIMILARITY_THRESHOLD: float = 0.35
    MAX_TOKENS: int = 1024
    TEMPERATURE: float = 0.4
    VECTORSTORE_TYPE: str = "chromadb"

    # ── File paths ────────────────────────────────────────────────────────────
    DATASETS_PATH: str = str(_BACKEND_DIR / "datasets")
    VECTORSTORE_PATH: str = str(_BACKEND_DIR / "vectorstore")
    PROCESSED_DATA_PATH: str = str(_BACKEND_DIR / "processed_data")

    # ── Email / SMTP ──────────────────────────────────────────────────────────
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@medilingo.com")
    FROM_NAME: str = os.getenv("FROM_NAME", "Medilingo")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # ── Admin ─────────────────────────────────────────────────────────────────
    ADMIN_DEFAULT_EMAIL: str = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@medilingo.com")
    ADMIN_DEFAULT_PASSWORD: str = os.getenv("ADMIN_DEFAULT_PASSWORD", "12345678")

    # Comma-separated list of emails that can access /admin endpoints.
    # The default admin email is always included automatically.
    _default_admin = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@medilingo.com")
    _env_admins = [e.strip() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()]
    if _default_admin and _default_admin not in _env_admins:
        _env_admins.append(_default_admin)
    ADMIN_EMAILS: list[str] = _env_admins

    def validate(self) -> None:
        import logging as _log
        _logger = _log.getLogger(__name__)
        if not self.SECRET_KEY:
            _logger.warning("SECRET_KEY is not set — tokens will be invalidated on every restart. Set SECRET_KEY in .env for production.")
        if not self.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set in .env")
        os.makedirs(self.VECTORSTORE_PATH, exist_ok=True)
        os.makedirs(self.PROCESSED_DATA_PATH, exist_ok=True)


settings = Settings()
