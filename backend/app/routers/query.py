"""
RAG query router — /query, /retrieve, /pipeline/*, /config, /info/*
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.rag_service import get_rag_engine, get_pipeline
from app.rag.engine import _strip_lang_prefix

router = APIRouter(tags=["rag"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ConversationMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: Optional[int] = Field(5, ge=1, le=20)
    temperature: Optional[float] = Field(0.4, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(1024, ge=100, le=4096)
    use_advanced: Optional[bool] = Field(False)
    # Prior conversation turns — enables multi-turn dialogue
    conversation_history: Optional[List[ConversationMessage]] = Field(None)


class QueryResponse(BaseModel):
    query: str
    response: str
    retrieved_docs: List[dict]
    num_retrieved: int
    model: str
    timestamp: str


class RetrievalResult(BaseModel):
    content: str
    source: str
    chunk_index: str
    similarity_score: float
    rank: int


class RetrievalResponse(BaseModel):
    query: str
    results: List[RetrievalResult]
    num_results: int


class PipelineStatus(BaseModel):
    vector_store_initialized: bool
    total_documents_indexed: int
    embedding_model: str
    chunk_size: int
    chunk_overlap: int
    vectorstore_path: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _history_dicts(request: QueryRequest) -> Optional[list]:
    if not request.conversation_history:
        return None
    return [{"role": m.role, "content": m.content} for m in request.conversation_history]


# ── POST /query ───────────────────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse, summary="Query the RAG system")
async def query_rag(request: QueryRequest) -> QueryResponse:
    engine = get_rag_engine()
    history = _history_dicts(request)
    try:
        if request.use_advanced:
            result = engine.query_with_expansion(
                request.query,
                top_k=request.top_k,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                conversation_history=history,
            )
        else:
            result = engine.query(
                request.query,
                top_k=request.top_k,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                conversation_history=history,
            )
        return QueryResponse(
            query=request.query,
            response=result["response"],
            retrieved_docs=result["retrieved_docs"],
            num_retrieved=result["num_retrieved"],
            model=result["model"],
            timestamp=datetime.now().isoformat(),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Query failed: {exc}")


# ── POST /query/stream ────────────────────────────────────────────────────────

@router.post("/query/stream", summary="Stream RAG response via SSE")
async def stream_query_rag(request: QueryRequest) -> StreamingResponse:
    engine = get_rag_engine()
    history = _history_dicts(request)

    async def event_stream():
        try:
            loop = asyncio.get_running_loop()

            docs = await loop.run_in_executor(
                None, lambda: engine.retrieve(request.query, top_k=request.top_k)
            )
            yield f"data: {json.dumps({'type': 'docs', 'docs': docs})}\n\n"

            queue: asyncio.Queue = asyncio.Queue()

            def produce():
                try:
                    for token in engine.stream_generate_response(
                        request.query,
                        docs,
                        temperature=request.temperature,
                        max_tokens=request.max_tokens,
                        conversation_history=history,
                    ):
                        loop.call_soon_threadsafe(queue.put_nowait, ("token", token))
                except Exception as exc:
                    loop.call_soon_threadsafe(queue.put_nowait, ("error", str(exc)))
                finally:
                    loop.call_soon_threadsafe(queue.put_nowait, ("done", None))

            loop.run_in_executor(None, produce)

            while True:
                kind, value = await queue.get()
                if kind == "done":
                    break
                elif kind == "error":
                    yield f"data: {json.dumps({'type': 'error', 'message': value})}\n\n"
                    break
                else:
                    yield f"data: {json.dumps({'type': 'token', 'token': value})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── POST /retrieve ────────────────────────────────────────────────────────────

@router.post("/retrieve", response_model=RetrievalResponse, summary="Retrieve documents only")
async def retrieve_documents(request: QueryRequest) -> RetrievalResponse:
    engine = get_rag_engine()
    try:
        docs = engine.retrieve(request.query, top_k=request.top_k)
        return RetrievalResponse(query=request.query, results=docs, num_results=len(docs))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {exc}")


# ── GET /query/example ────────────────────────────────────────────────────────

@router.get("/query/example", summary="Example queries")
async def example_query() -> dict:
    return {
        "examples": [
            "What are the symptoms of myocardial infarction?",
            "Explain the pathophysiology of type 2 diabetes",
            "What is the differential diagnosis for chest pain?",
            "Describe the treatment options for hypertension",
            "What are the complications of pneumonia?",
        ]
    }


# ── Pipeline endpoints ────────────────────────────────────────────────────────

@router.get("/pipeline/status", response_model=PipelineStatus, summary="Pipeline status")
async def get_pipeline_status() -> PipelineStatus:
    return get_pipeline().get_pipeline_status()


@router.post("/pipeline/ingest", summary="Start ingestion (background)")
async def ingest_documents(background_tasks: BackgroundTasks) -> dict:
    background_tasks.add_task(get_pipeline().run_full_pipeline)
    return {
        "status": "ingestion_started",
        "message": "Ingestion started in background. Check /pipeline/status.",
        "timestamp": datetime.now().isoformat(),
    }


@router.post("/pipeline/ingest-sync", summary="Run ingestion synchronously")
async def ingest_documents_sync() -> dict:
    results = get_pipeline().run_full_pipeline()
    return {"status": "completed", "results": results, "timestamp": datetime.now().isoformat()}


@router.post("/pipeline/update", summary="Incremental document update")
async def update_documents() -> dict:
    results = get_pipeline().run_incremental_update()
    return {"status": "completed", "results": results, "timestamp": datetime.now().isoformat()}


# ── Config endpoints ──────────────────────────────────────────────────────────

@router.get("/config", summary="Get RAG configuration")
async def get_config() -> dict:
    from app.config import settings
    return {
        "embedding_model": settings.EMBEDDING_MODEL,
        "groq_model": settings.GROQ_MODEL,
        "chunk_size": settings.CHUNK_SIZE,
        "chunk_overlap": settings.CHUNK_OVERLAP,
        "top_k_retrieval": settings.TOP_K_RETRIEVAL,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD,
        "temperature": settings.TEMPERATURE,
        "max_tokens": settings.MAX_TOKENS,
        "vectorstore_type": settings.VECTORSTORE_TYPE,
    }


@router.put("/config/top-k", summary="Update top-K retrieval")
async def update_top_k(top_k: int) -> dict:
    if not (1 <= top_k <= 20):
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 20.")
    get_rag_engine().set_top_k(top_k)
    return {"status": "updated", "top_k": top_k}


@router.put("/config/model", summary="Update LLM model")
async def update_model(model_name: str) -> dict:
    get_rag_engine().set_model(model_name)
    return {"status": "updated", "model": model_name}


# ── Info endpoints ────────────────────────────────────────────────────────────

@router.get("/info/documents", summary="Indexed document stats")
async def get_documents_info() -> dict:
    stats = get_rag_engine().vector_store.get_collection_stats()
    return {
        "total_documents": stats.get("total_documents", 0),
        "collection_name": stats.get("collection_name", "medical_documents"),
        "metadata": stats.get("metadata", {}),
    }


@router.get("/info/collections", summary="List ChromaDB collections")
async def list_collections() -> dict:
    collections = get_rag_engine().vector_store.list_collections()
    return {"collections": collections, "total": len(collections)}


# ── POST /query/image ─────────────────────────────────────────────────────────

@router.post("/query/image", summary="Analyze a medical image via Gemini vision")
async def analyze_image(
    file: UploadFile = File(...),
    question: str = Form("What does this medical document show?"),
    language: str = Form("Respond in English"),
) -> dict:
    from app.services.rag_service import get_rag_engine
    engine = get_rag_engine()

    # Gemini vision is only available on GeminiRAGEngine
    if not hasattr(engine, "analyze_image"):
        raise HTTPException(
            status_code=400,
            detail="Image analysis requires Gemini provider. Set LLM_PROVIDER=gemini in .env.",
        )

    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif",
                     "application/pdf"}
    mime_type = file.content_type or "image/jpeg"
    if mime_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime_type}")

    image_bytes = await file.read()
    if len(image_bytes) > 20 * 1024 * 1024:  # 20 MB limit
        raise HTTPException(status_code=400, detail="File too large (max 20 MB).")

    try:
        response_text = engine.analyze_image(image_bytes, mime_type, question, language)
        return {"response": response_text, "question": question, "filename": file.filename}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {exc}")


# ── POST /symptom-check ───────────────────────────────────────────────────────

class SymptomCheckRequest(BaseModel):
    symptoms: str = Field(..., min_length=3, max_length=2000)
    duration: str = Field("", max_length=200)
    severity: str = Field("moderate", max_length=100)
    age: Optional[int] = Field(None, ge=0, le=130)
    additional_context: str = Field("", max_length=500)
    language: str = Field("Respond in English", max_length=100)


@router.post("/symptom-check", summary="Structured symptom triage and differential")
async def symptom_check(request: SymptomCheckRequest) -> dict:
    engine = get_rag_engine()

    age_str = f"Age: {request.age}. " if request.age else ""
    duration_str = f"Duration: {request.duration}. " if request.duration else ""
    context_str = f"Additional context: {request.additional_context}." if request.additional_context else ""

    query = (
        f"{request.language}: {age_str}Symptoms: {request.symptoms}. "
        f"{duration_str}Severity: {request.severity}. {context_str}"
    )

    system_override = """You are Medilingo — a medical AI triage assistant.

Given the patient's symptoms, produce a structured clinical assessment with exactly these sections:

**Possible Causes** (list 3-5 differential diagnoses, most likely first, one sentence each)

**Red Flag Symptoms** (list any warning signs that need immediate attention, or "None identified")

**Recommended Next Steps** (2-4 practical recommendations: self-care, when to see a doctor, tests to consider)

**Emergency Warning** (if any symptom suggests a medical emergency, state it clearly and tell the user to seek immediate care)

Be concise, specific, and clinically accurate. Do not diagnose — provide differentials."""

    loop = asyncio.get_running_loop()
    try:
        docs = await loop.run_in_executor(None, lambda: engine.retrieve(query, top_k=5))

        lang_instruction, clean_query = _strip_lang_prefix(query)
        context = engine._build_context(docs)

        if hasattr(engine, "client"):  # Groq
            from app.rag.engine import _build_history_messages
            prompt = (
                f"Background knowledge:\n{context}\n\n" if context else ""
            ) + f"Patient information: {clean_query}\n\nProvide a structured triage assessment."

            def _call_groq():
                from groq import Groq
                client = engine.client
                messages = [
                    {"role": "system", "content": system_override},
                    {"role": "user", "content": prompt},
                ]
                resp = client.chat.completions.create(
                    model=engine.model, messages=messages,
                    temperature=0.3, max_tokens=1200,
                )
                return resp.choices[0].message.content

            response_text = await loop.run_in_executor(None, _call_groq)

        elif hasattr(engine, "_client"):  # Gemini
            from google.genai import types as t
            prompt = (
                f"Background knowledge:\n{context}\n\n" if context else ""
            ) + f"Patient information: {clean_query}\n\nProvide a structured triage assessment."

            def _call_gemini():
                config = engine._types.GenerateContentConfig(
                    system_instruction=system_override,
                    temperature=0.3,
                    max_output_tokens=1200,
                )
                resp = engine._client.models.generate_content(
                    model=engine.model,
                    contents=[engine._types.Part.from_text(text=prompt)],
                    config=config,
                )
                return resp.text

            response_text = await loop.run_in_executor(None, _call_gemini)
        else:
            raise HTTPException(status_code=500, detail="No LLM engine available.")

        return {
            "response": response_text,
            "symptoms": request.symptoms,
            "language": request.language,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Symptom check failed: {exc}")


# ── POST /drug-interactions ───────────────────────────────────────────────────

class DrugInteractionRequest(BaseModel):
    medicines: str = Field(..., min_length=3, max_length=1000,
                           description="Comma-separated list of medicine names")
    language: str = Field("Respond in English", max_length=100)


@router.post("/drug-interactions", summary="Check interactions between a list of medicines")
async def drug_interactions(request: DrugInteractionRequest) -> dict:
    engine = get_rag_engine()

    query = f"{request.language}: Drug interaction check for: {request.medicines}"

    system_override = """You are Medilingo — a clinical pharmacology AI assistant.

Analyze the given list of medicines for potential drug interactions. Structure your response as:

**Interaction Summary** (one sentence overview: e.g. "X interactions found, Y are significant")

**Significant Interactions** (list each pair with severity: Major / Moderate / Minor, and a 1-2 sentence explanation of the risk)

**General Advice** (2-3 practical recommendations for the patient/caregiver)

**Disclaimer** (always end with: "Always consult your pharmacist or doctor before making changes to your medications.")

Be specific about mechanisms when known. If no interactions are found, state so clearly."""

    loop = asyncio.get_running_loop()
    try:
        docs = await loop.run_in_executor(None, lambda: engine.retrieve(query, top_k=5))
        _, clean_query = _strip_lang_prefix(query)
        context = engine._build_context(docs)

        if hasattr(engine, "client"):  # Groq
            prompt = (
                f"Background knowledge:\n{context}\n\n" if context else ""
            ) + f"Medicines to check: {clean_query}"

            def _call_groq():
                messages = [
                    {"role": "system", "content": system_override},
                    {"role": "user", "content": prompt},
                ]
                resp = engine.client.chat.completions.create(
                    model=engine.model, messages=messages,
                    temperature=0.2, max_tokens=1200,
                )
                return resp.choices[0].message.content

            response_text = await loop.run_in_executor(None, _call_groq)

        elif hasattr(engine, "_client"):  # Gemini
            prompt = (
                f"Background knowledge:\n{context}\n\n" if context else ""
            ) + f"Medicines to check: {clean_query}"

            def _call_gemini():
                config = engine._types.GenerateContentConfig(
                    system_instruction=system_override,
                    temperature=0.2,
                    max_output_tokens=1200,
                )
                resp = engine._client.models.generate_content(
                    model=engine.model,
                    contents=[engine._types.Part.from_text(text=prompt)],
                    config=config,
                )
                return resp.text

            response_text = await loop.run_in_executor(None, _call_gemini)
        else:
            raise HTTPException(status_code=500, detail="No LLM engine available.")

        return {
            "response": response_text,
            "medicines": request.medicines,
            "language": request.language,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Drug interaction check failed: {exc}")
