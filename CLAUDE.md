# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

MedLingo AI is a cross-lingual medical RAG (Retrieval-Augmented Generation) chatbot supporting English, Urdu, and Roman Urdu. It consists of a FastAPI backend and a React/Vite frontend.

## Commands

### Backend (run from `backend/`)

```bash
# Start server
python run.py
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# No pytest test suite exists in the current backend — test via the API at http://localhost:8000/docs
```

### Frontend (run from `medlingo-frontend/`)

```bash
npm run dev          # Dev server on port 5173
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest watch mode
```

### Docker (from repo root)

```bash
docker-compose up -d
```

## Environment Variables

**`backend/.env`** (required):
```
GROQ_API_KEY=...
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=medlingo
SECRET_KEY=...   # JWT signing secret — any strong random string
```

**`medlingo-frontend/.env`** (optional in dev):
```
VITE_API_URL=    # Empty in dev — Vite proxy handles routing
```

In production set `ALLOWED_ORIGINS` on the backend to the deployed frontend domain.

## Architecture

### Backend (`backend/app/`)

The app uses **FastAPI with a lifespan startup sequence**: MongoDB connects first, then the RAG stack (sentence-transformers + ChromaDB + Groq) initialises. If `GROQ_API_KEY` is missing the server still starts, but `/query` returns 500 until fixed.

```
app/
├── main.py           — FastAPI factory, CORS, lifespan startup/shutdown
├── config.py         — Settings class, loaded from backend/.env
├── database.py       — Motor async MongoDB singleton (connect_db / close_db / get_db)
├── routers/
│   ├── auth.py       — /auth/* (register, login, refresh, logout, me)
│   ├── sessions.py   — /sessions/* (CRUD for chat sessions + messages)
│   └── query.py      — /query, /retrieve, /pipeline/*, /config, /info/*
├── services/
│   └── rag_service.py — RAG singleton: init_rag() / shutdown_rag() / get_rag_engine()
├── models/           — MongoDB document classes (UserDoc, SessionDoc, MessageDoc)
└── rag/
    ├── engine.py     — RAGQueryEngine + AdvancedRAGEngine (Groq LLaMA 3.3-70b)
    ├── embeddings.py — EmbeddingGenerator (all-MiniLM-L6-v2, 384-dim)
    ├── vector_store.py — ChromaDB wrapper (cosine similarity)
    ├── pipeline.py   — RAGIngestionPipeline (one-time PDF indexing)
    ├── loader.py     — PDF extraction (pdfplumber + pypdf)
    ├── chunker.py    — Semantic chunking (1000 chars, 200 overlap)
    └── preprocessor.py — Text cleaning and medical abbreviation handling
```

Heavy ML imports (`sentence-transformers`, `chromadb`) are deferred — only loaded inside `init_rag()`, not at module import time.

### Frontend (`medlingo-frontend/src/`)

React 19 + TypeScript + Vite + TailwindCSS + Zustand.

The Vite dev server **proxies all API routes** (`/auth`, `/sessions`, `/query`, `/retrieve`, `/pipeline`, `/config`, `/info`, `/health`) to `http://localhost:8000`, so cookies work correctly without CORS issues during development. In production, set `VITE_API_URL` to the backend URL.

```
src/
├── router.tsx        — React Router routes (/, /login, /register, /chat, /app)
├── App.tsx           — Root: silently restores session via refresh cookie on mount
├── hooks/
│   ├── useAuthStore.ts — Zustand auth store (user + accessToken)
│   ├── useAuth.ts    — login/register/logout actions
│   ├── useChat.ts    — query + local message state
│   ├── useSessions.ts — session CRUD
│   └── useVoiceInput/Output.ts — Web Speech API wrappers
├── services/
│   ├── apiClient.ts  — fetchWithTimeout, authenticatedFetch (auto-refresh on 401)
│   ├── authService.ts — /auth/* calls
│   └── sessionService.ts — /sessions/* calls
├── types/index.ts    — All shared types + LANGUAGE_INSTRUCTIONS map
└── pages/            — LandingPage, ChatPage, LoginPage, RegisterPage
```

## Key Design Decisions

### Language prefix system
The frontend prepends a language instruction to every query before sending it to the backend (e.g., `"Respond in Urdu: بخار کیا ہے؟"`). The backend's `engine.py` **strips this prefix before embedding** so that semantic search always runs against English medical text, then passes the instruction into the Groq system prompt to control response language. Do not embed the language-prefixed string directly.

### JWT dual-token auth
- **Access tokens** (15 min) are stored in-memory in Zustand only — never localStorage.
- **Refresh tokens** (7 days) are set as HttpOnly cookies.
- `authenticatedFetch` in `apiClient.ts` automatically calls `/auth/refresh` on 401 and retries the original request once. On refresh failure it clears auth state and redirects to `/login`.

### RAG singleton lifecycle
`rag_service.py` holds module-level `_rag_engine` and `_pipeline` singletons. Routers call `get_rag_engine()` which raises `RuntimeError` if not initialised. All ingestion happens via `POST /pipeline/ingest-sync` or `POST /pipeline/ingest` (background). PDF files go in `backend/datasets/`; ChromaDB persists to `backend/vectorstore/`.

### MongoDB document model pattern
`UserDoc`, `SessionDoc`, and `MessageDoc` each use `uuid4` string IDs (stored as `id` in MongoDB, not `_id`). They expose `to_mongo()` / `from_mongo()` class methods for serialisation. Indexes are created on startup in `connect_db()`.
