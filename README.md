# Medilingo — Cross-lingual Medical AI Assistant

A full-stack RAG (Retrieval-Augmented Generation) chatbot for medical queries, supporting **English, Urdu, and Roman Urdu**. Built with FastAPI, React 19, and powered by Groq LLaMA 3.3-70b with optional Gemini 2.0 Flash vision capabilities.

![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Stack](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Stack](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

---

## Features

- **Multilingual chat** — English, Urdu (اردو), and Roman Urdu responses via a language-prefix system; semantic search always runs over English medical text
- **Image & document analysis** — Upload prescriptions, lab reports, or medicine packet photos; powered by Gemini 2.0 Flash vision
- **Symptom checker** — Guided 2-step wizard (symptoms → severity/duration/context) with structured differential output
- **Drug interaction checker** — Paste a medicine list, get a structured pharmacology analysis
- **RAG pipeline** — PDF ingestion → semantic chunking → BAAI/bge-small-en-v1.5 embeddings → ChromaDB cosine retrieval → Groq generation with source citations
- **JWT dual-token auth** — Access tokens in-memory, refresh tokens in HttpOnly cookies with auto-refresh on 401
- **Admin dashboard** — Query volume, user counts, system info, recent queries (access gated by `ADMIN_EMAILS` env var)
- **Dark mode** — Full CSS-variable–based theme, toggled per-page and persisted in localStorage
- **PWA** — Installable with `vite-plugin-pwa`, offline shell caching via Workbox
- **Voice I/O** — Web Speech API for speech-to-text input and text-to-speech output with persona selection

---

## Architecture

```
medlingo-ai/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI factory, CORS, lifespan startup
│       ├── config.py            # Settings (pydantic, from .env)
│       ├── database.py          # Motor async MongoDB singleton
│       ├── routers/
│       │   ├── auth.py          # /auth/* — register, login, refresh, logout, me
│       │   ├── sessions.py      # /sessions/* — chat session + message CRUD
│       │   ├── query.py         # /query, /query/image, /symptom-check, /drug-interactions
│       │   └── admin.py         # /admin/stats, /admin/queries, /admin/users
│       ├── services/
│       │   └── rag_service.py   # RAG singleton lifecycle (init / shutdown / get)
│       ├── models/              # MongoDB document classes (UserDoc, SessionDoc, MessageDoc)
│       └── rag/
│           ├── engine.py        # RAGQueryEngine + AdvancedRAGEngine (Groq / Gemini)
│           ├── embeddings.py    # EmbeddingGenerator (BAAI/bge-small-en-v1.5, 384-dim)
│           ├── vector_store.py  # ChromaDB wrapper (cosine similarity)
│           ├── pipeline.py      # RAGIngestionPipeline (PDF indexing)
│           ├── loader.py        # PDF extraction (pdfplumber + pypdf fallback)
│           ├── chunker.py       # Semantic chunking (1000 chars, 200 overlap)
│           └── preprocessor.py  # Text cleaning + medical abbreviation handling
├── medlingo-frontend/
│   └── src/
│       ├── router.tsx           # React Router routes
│       ├── App.tsx              # Root — session restore on mount
│       ├── hooks/               # useAuthStore, useChat, useSessions, useVoice*
│       ├── services/            # apiClient, authService, sessionService
│       ├── pages/               # ChatPage, SymptomCheckerPage, DrugCheckerPage, AdminPage, …
│       └── components/          # Sidebar, MessageBubble, InputBar, ThemeToggle, …
└── docker-compose.yml
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| MongoDB | 6+ (local or Atlas) |

---

## Environment Setup

### Backend — `backend/.env`

```env
# Required
GROQ_API_KEY=gsk_...           # https://console.groq.com
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=medilingo
SECRET_KEY=change-me-to-a-long-random-string

# Optional — image analysis (Gemini vision)
LLM_PROVIDER=groq              # set to "gemini" to enable /query/image
GEMINI_API_KEY=AIza...         # https://aistudio.google.com

# Optional — admin dashboard
ADMIN_EMAILS=you@example.com,colleague@example.com
```

### Frontend — `medlingo-frontend/.env`

In development, the Vite dev server proxies all API routes to `localhost:8000` — no frontend `.env` is needed.

For production, set:
```env
VITE_API_URL=https://your-backend-domain.com
```

---

## Running Locally

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
# or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at **http://localhost:8000/docs**

### 2. Frontend

```bash
cd medlingo-frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Docker (full stack)

```bash
docker-compose up -d
```

---

## Indexing Medical Documents

1. Drop your PDF files into `backend/datasets/`
2. With the backend running, call:

```bash
curl -X POST http://localhost:8000/pipeline/ingest-sync
```

This runs the full pipeline: PDF extraction → cleaning → semantic chunking → embedding → ChromaDB indexing. The vectorstore persists to `backend/vectorstore/` and survives restarts.

---

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Log in, get access + refresh tokens |
| POST | `/auth/refresh` | Silently refresh access token |
| GET | `/auth/me` | Current user info |
| GET | `/sessions` | List chat sessions |
| POST | `/sessions` | Create session |
| POST | `/query` | RAG query (text) |
| POST | `/query/image` | Image/document analysis (requires Gemini) |
| POST | `/symptom-check` | Symptom checker |
| POST | `/drug-interactions` | Drug interaction analysis |
| POST | `/pipeline/ingest-sync` | Index PDFs (blocking) |
| GET | `/admin/stats` | Admin: usage stats |
| GET | `/health` | Health check |

---

## Language System

The frontend prepends a language instruction before sending every query:

```
"Respond in Urdu: بخار کیا ہے؟"
```

The backend's `engine.py` **strips this prefix before embedding** so semantic search always runs against English medical text. The instruction is then injected into the Groq system prompt to control response language.

---

## Development Commands

```bash
# Frontend
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest watch mode

# Backend — no pytest suite; test interactively at /docs
```

---

## Tech Stack

**Backend:** FastAPI · Motor (async MongoDB) · ChromaDB · Sentence Transformers · Groq LLaMA 3.3-70b · Gemini 2.0 Flash · PyJWT · pdfplumber · python-multipart

**Frontend:** React 19 · TypeScript · Vite · TailwindCSS · Zustand · React Router · react-hot-toast · vite-plugin-pwa · Workbox

---

## Troubleshooting

**`/query` returns 500 on first run**
→ The RAG stack initialises lazily. If `GROQ_API_KEY` is missing, the server starts but queries fail. Verify `backend/.env` and restart.

**Image analysis returns 400**
→ Set `LLM_PROVIDER=gemini` and provide `GEMINI_API_KEY` in `backend/.env`. The Groq engine does not support vision.

**Admin dashboard shows "You don't have admin access"**
→ Add your account email to `ADMIN_EMAILS` in `backend/.env` and restart the backend.

**No results from RAG queries**
→ Run `POST /pipeline/ingest-sync` after adding PDFs to `backend/datasets/`. Check `GET /pipeline/status` to verify the document count.

**ChromaDB error on startup**
→ Delete `backend/vectorstore/` and re-ingest. The directory will be recreated cleanly.

---

## License

For educational and research purposes.
