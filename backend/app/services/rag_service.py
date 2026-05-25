"""
RAG service — singleton lifecycle wrapper exposed to the routers.
"""

from __future__ import annotations

import logging

from app.config import settings

logger = logging.getLogger(__name__)

_rag_engine = None
_pipeline = None


def get_rag_engine():
    if _rag_engine is None:
        raise RuntimeError("RAG engine not initialised — call init_rag() first.")
    return _rag_engine


def get_pipeline():
    if _pipeline is None:
        raise RuntimeError("Ingestion pipeline not initialised — call init_rag() first.")
    return _pipeline


def init_rag() -> None:
    """Initialise all RAG components. Called once from FastAPI lifespan startup."""
    global _rag_engine, _pipeline

    from app.rag.embeddings import EmbeddingGenerator
    from app.rag.vector_store import VectorStore
    from app.rag.pipeline import RAGIngestionPipeline

    logger.info("Initialising RAG components (provider=%s)…", settings.LLM_PROVIDER)

    embedding_generator = EmbeddingGenerator(model_name=settings.EMBEDDING_MODEL)
    vector_store = VectorStore(persist_path=settings.VECTORSTORE_PATH)

    collection = vector_store.get_collection("medical_documents")
    if collection:
        logger.info("Loaded existing vector store collection.")
    else:
        logger.info("No existing collection — run POST /pipeline/ingest-sync to index documents.")

    if settings.LLM_PROVIDER == "gemini":
        from app.rag.engine import GeminiAdvancedRAGEngine
        _rag_engine = GeminiAdvancedRAGEngine(
            gemini_api_key=settings.GEMINI_API_KEY,
            vector_store=vector_store,
            embedding_generator=embedding_generator,
            top_k=settings.TOP_K_RETRIEVAL,
            similarity_threshold=settings.SIMILARITY_THRESHOLD,
        )
    else:
        from app.rag.engine import AdvancedRAGEngine
        _rag_engine = AdvancedRAGEngine(
            groq_api_key=settings.GROQ_API_KEY,
            vector_store=vector_store,
            embedding_generator=embedding_generator,
            top_k=settings.TOP_K_RETRIEVAL,
            similarity_threshold=settings.SIMILARITY_THRESHOLD,
        )

    _pipeline = RAGIngestionPipeline()
    logger.info("RAG components initialised successfully (provider=%s).", settings.LLM_PROVIDER)


def shutdown_rag() -> None:
    global _rag_engine
    if _rag_engine is not None:
        _rag_engine.vector_store.persist()
        logger.info("Vector store persisted on shutdown.")
