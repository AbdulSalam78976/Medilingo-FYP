"""
Vector store — ChromaDB wrapper.
Moved from backend/vector_store.py and updated imports.
"""

import json
import logging
import os
from typing import Any, Dict, List

import chromadb
import numpy as np

logger = logging.getLogger(__name__)


class VectorStore:
    """Persistent ChromaDB vector store."""

    def __init__(self, persist_path: str = "./vectorstore"):
        self.persist_path = persist_path
        os.makedirs(persist_path, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_path)
        self.collection = None
        logger.info(f"VectorStore initialised at {persist_path}")

    # ── Collection management ─────────────────────────────────────────────────

    def create_collection(self, collection_name: str = "medical_documents",
                          metadata: Dict = None) -> None:
        try:
            self.client.delete_collection(name=collection_name)
        except Exception:
            pass  # Collection doesn't exist yet — that's fine
        self.collection = self.client.create_collection(
            name=collection_name,
            metadata=metadata or {"hnsw:space": "cosine"},
        )
        logger.info(f"Created collection: {collection_name}")

    def get_collection(self, collection_name: str = "medical_documents"):
        try:
            self.collection = self.client.get_collection(name=collection_name)
            logger.info(f"Loaded collection: {collection_name}")
            return self.collection
        except Exception as exc:
            logger.warning(f"Collection not found: {exc}")
            return None

    def list_collections(self) -> List[str]:
        return [c.name for c in self.client.list_collections()]

    def delete_collection(self, collection_name: str) -> None:
        try:
            self.client.delete_collection(name=collection_name)
        except Exception as exc:
            logger.error(f"Failed to delete collection: {exc}")

    # ── Document operations ───────────────────────────────────────────────────

    def add_documents(self, chunks: List[Dict[str, Any]]) -> None:
        if not self.collection:
            raise RuntimeError("Collection not initialised.")
        if not chunks:
            return

        ids, embeddings, documents, metadatas = [], [], [], []
        for chunk in chunks:
            ids.append(chunk["id"])
            embeddings.append(chunk["embedding"].tolist())
            documents.append(chunk["content"])
            metadatas.append({
                "source": chunk.get("source", ""),
                "chunk_index": str(chunk.get("chunk_index", 0)),
                "length": str(chunk.get("length", 0)),
            })

        self.collection.add(ids=ids, embeddings=embeddings,
                            documents=documents, metadatas=metadatas)
        logger.info(f"Added {len(chunks)} documents to collection.")

    def query(self, query_embedding: np.ndarray, top_k: int = 5) -> Dict[str, Any]:
        if not self.collection:
            raise RuntimeError("Collection not initialised.")
        return self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k,
        )

    def get_collection_stats(self) -> Dict[str, Any]:
        if not self.collection:
            return {}
        return {
            "total_documents": self.collection.count(),
            "collection_name": self.collection.name,
            "metadata": self.collection.metadata,
        }

    def persist(self) -> None:
        """No-op — PersistentClient auto-persists."""
        logger.info("VectorStore auto-persisted.")
