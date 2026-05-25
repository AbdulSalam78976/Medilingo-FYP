"""Embedding generation — supports BGE and MiniLM model families."""

import logging
from typing import Dict, List

import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    """
    Wraps SentenceTransformer with BGE-aware query prefix handling.

    BGE models (BAAI/bge-*) require a short instruction prefix on query
    embeddings for optimal retrieval but NOT on document embeddings.
    MiniLM and other models skip the prefix entirely.
    """

    # Instruction prefix used by BGE models at query time
    _BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5", device: str = "cpu"):
        logger.info("Loading embedding model: %s", model_name)
        self.model = SentenceTransformer(model_name, device=device)
        self.embedding_dim: int = self.model.get_sentence_embedding_dimension()
        self._is_bge = "bge" in model_name.lower()
        logger.info("Embedding model ready — dim=%d, bge=%s", self.embedding_dim, self._is_bge)

    # ── Document embeddings (no prefix) ──────────────────────────────────────

    def generate_embeddings(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """Batch-embed document texts. No query prefix applied."""
        if not texts:
            return np.array([])
        return self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )

    # ── Query embedding (prefix applied for BGE) ──────────────────────────────

    def generate_embedding(self, text: str) -> np.ndarray:
        """Single query embedding. Applies BGE prefix when appropriate."""
        if not text:
            return np.zeros(self.embedding_dim)
        encoded = (self._BGE_QUERY_PREFIX + text) if self._is_bge else text
        return self.model.encode(
            [encoded],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )[0]

    # ── Chunk helper ──────────────────────────────────────────────────────────

    def generate_embeddings_for_chunks(self, chunks: List[Dict]) -> List[Dict]:
        texts = [c["content"] for c in chunks]
        embeddings = self.generate_embeddings(texts)
        result = []
        for i, chunk in enumerate(chunks):
            c = chunk.copy()
            c["embedding"] = embeddings[i]
            c["embedding_dim"] = self.embedding_dim
            result.append(c)
        return result
