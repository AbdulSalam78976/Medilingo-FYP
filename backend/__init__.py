"""
Backend package initialization
"""

__version__ = "1.0.0"
__author__ = "Medical RAG Team"

from backend.config import RAGConfig
from backend.document_loader import DocumentLoader
from backend.text_preprocessor import PreprocessingPipeline
from backend.text_chunker import AdaptiveChunker
from backend.embedding_generator import EmbeddingGenerator
from backend.vector_store import VectorStore
from backend.rag_engine import RAGQueryEngine, AdvancedRAGEngine
from backend.ingestion_pipeline import RAGIngestionPipeline

__all__ = [
    'RAGConfig',
    'DocumentLoader',
    'PreprocessingPipeline',
    'AdaptiveChunker',
    'EmbeddingGenerator',
    'VectorStore',
    'RAGQueryEngine',
    'AdvancedRAGEngine',
    'RAGIngestionPipeline'
]
