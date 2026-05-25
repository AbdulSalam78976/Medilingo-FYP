"""
RAG ingestion pipeline — memory-efficient, one document at a time.
Moved from backend/ingestion_pipeline.py and updated imports.
"""

import gc
import json
import logging
import os
from datetime import datetime
from typing import Dict

from app.config import settings
from app.rag.chunker import AdaptiveChunker
from app.rag.embeddings import EmbeddingGenerator
from app.rag.loader import DocumentLoader
from app.rag.preprocessor import PreprocessingPipeline
from app.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)

_LARGE_PDF_MB = 15  # stream PDFs larger than this


class RAGIngestionPipeline:
    """Orchestrates: load → preprocess → chunk → embed → index."""

    def __init__(self):
        self.loader = DocumentLoader(settings.DATASETS_PATH)
        self.preprocessor = PreprocessingPipeline()
        self.chunker = AdaptiveChunker(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )
        self.embedder = EmbeddingGenerator(model_name=settings.EMBEDDING_MODEL)
        self.vector_store = VectorStore(persist_path=settings.VECTORSTORE_PATH)
        logger.info("RAGIngestionPipeline initialised.")

    # ── Internal batch processor ──────────────────────────────────────────────

    def _process_batch(self, text: str, pdf_path: str,
                       filename: str, id_offset: int = 0) -> int:
        cleaned = self.preprocessor.process(text)
        del text
        gc.collect()
        if not cleaned:
            return 0

        chunks = self.chunker.chunk_documents(
            [{"content": cleaned, "source": pdf_path, "filename": filename}],
            id_offset=id_offset,
        )
        del cleaned
        gc.collect()
        if not chunks:
            return 0

        embedded = self.embedder.generate_embeddings_for_chunks(chunks)
        del chunks
        gc.collect()

        self.vector_store.add_documents(embedded)
        n = len(embedded)
        del embedded
        gc.collect()
        return n

    # ── Full pipeline ─────────────────────────────────────────────────────────

    def run_full_pipeline(self) -> Dict:
        logger.info("Starting full ingestion pipeline …")
        results: Dict = {"timestamp": datetime.now().isoformat(), "stages": {}}

        pdf_files = self.loader._get_pdf_files()
        if not pdf_files:
            results["stages"]["loading"] = {"status": "failed", "num_documents": 0}
            return results

        self.vector_store.create_collection(
            collection_name="medical_documents",
            metadata={
                "ingestion_date": datetime.now().isoformat(),
                "source_documents": len(pdf_files),
            },
        )

        total_chunks, loaded, failed = 0, [], []

        for i, pdf_path in enumerate(pdf_files, 1):
            filename = os.path.basename(pdf_path)
            size_mb = os.path.getsize(pdf_path) / 1024 ** 2
            logger.info(f"[{i}/{len(pdf_files)}] {filename} ({size_mb:.1f} MB)")

            try:
                doc_chunks = 0
                if size_mb > _LARGE_PDF_MB:
                    for batch in self.loader.stream_pages(pdf_path, batch_size=30):
                        n = self._process_batch(batch, pdf_path, filename,
                                                id_offset=total_chunks + doc_chunks)
                        doc_chunks += n
                else:
                    text = self.loader._extract_text_from_pdf(pdf_path)
                    if not text or not text.strip():
                        failed.append(filename)
                        continue
                    doc_chunks = self._process_batch(text, pdf_path, filename,
                                                     id_offset=total_chunks)

                if doc_chunks > 0:
                    total_chunks += doc_chunks
                    loaded.append(filename)
                    logger.info(f"  ✅ {doc_chunks} chunks (total: {total_chunks})")
                else:
                    failed.append(filename)
                    logger.warning("  ⚠️  No chunks produced.")

            except MemoryError:
                logger.error(f"  ❌ MemoryError — skipping {filename}")
                failed.append(filename)
                gc.collect()
            except Exception as exc:
                logger.error(f"  ❌ Error on {filename}: {exc}")
                failed.append(filename)
                gc.collect()

        self.vector_store.persist()
        stats = self.vector_store.get_collection_stats()

        results["stages"] = {
            "loading": {"status": "completed", "num_documents": len(loaded), "documents": loaded},
            "failed": {"num_documents": len(failed), "documents": failed},
            "indexing": {
                "status": "completed",
                "total_chunks": total_chunks,
                "total_documents": stats.get("total_documents", 0),
            },
        }
        self._save_results(results)
        logger.info(f"✅ Pipeline done — {len(loaded)}/{len(pdf_files)} docs, {total_chunks} chunks.")
        return results

    # ── Incremental update ────────────────────────────────────────────────────

    def run_incremental_update(self, path: str = None) -> Dict:
        self.vector_store.get_collection("medical_documents")
        loader = DocumentLoader(path or settings.DATASETS_PATH)
        total = 0
        for pdf_path in loader._get_pdf_files():
            filename = os.path.basename(pdf_path)
            size_mb = os.path.getsize(pdf_path) / 1024 ** 2
            try:
                if size_mb > _LARGE_PDF_MB:
                    for batch in loader.stream_pages(pdf_path):
                        total += self._process_batch(batch, pdf_path, filename, id_offset=total)
                else:
                    text = loader._extract_text_from_pdf(pdf_path)
                    total += self._process_batch(text, pdf_path, filename, id_offset=total)
                logger.info(f"✅ Updated: {filename}")
            except Exception as exc:
                logger.error(f"Error updating {filename}: {exc}")
        self.vector_store.persist()
        return {"status": "completed", "new_chunks": total}

    # ── Status ────────────────────────────────────────────────────────────────

    def get_pipeline_status(self) -> Dict:
        stats = self.vector_store.get_collection_stats()
        return {
            "vector_store_initialized": bool(self.vector_store.collection),
            "total_documents_indexed": stats.get("total_documents", 0),
            "embedding_model": settings.EMBEDDING_MODEL,
            "chunk_size": settings.CHUNK_SIZE,
            "chunk_overlap": settings.CHUNK_OVERLAP,
            "vectorstore_path": settings.VECTORSTORE_PATH,
        }

    def _save_results(self, results: Dict) -> None:
        os.makedirs(settings.PROCESSED_DATA_PATH, exist_ok=True)
        path = os.path.join(settings.PROCESSED_DATA_PATH, "pipeline_results.json")
        with open(path, "w") as f:
            json.dump(results, f, indent=2)
        logger.info(f"Results saved to {path}")
