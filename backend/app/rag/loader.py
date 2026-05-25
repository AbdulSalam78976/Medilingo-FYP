"""
Document loader — memory-efficient PDF streaming.
Moved from backend/document_loader.py.
"""

import gc
import logging
import os
from pathlib import Path
from typing import Dict, Generator, List

import pdfplumber
from pypdf import PdfReader

logger = logging.getLogger(__name__)

PAGE_BATCH_SIZE = 50


class DocumentLoader:
    """Load PDF documents with page-by-page streaming to limit RAM usage."""

    def __init__(self, datasets_path: str):
        self.datasets_path = datasets_path

    def _get_pdf_files(self) -> List[str]:
        return sorted(
            str(f) for f in Path(self.datasets_path).iterdir()
            if f.suffix.lower() == ".pdf"
        )

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract full text, trying pdfplumber then pypdf as fallback."""
        parts: List[str] = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                batch: List[str] = []
                for i, page in enumerate(pdf.pages):
                    try:
                        t = page.extract_text()
                        if t:
                            batch.append(t)
                    except Exception as page_exc:
                        logger.debug("Skipped page %d in %s: %s", i, pdf_path, page_exc)
                    if len(batch) >= PAGE_BATCH_SIZE:
                        parts.append("\n".join(batch))
                        batch = []
                        gc.collect()
                    if (i + 1) % 100 == 0:
                        logger.info(f"  ... {i+1}/{len(pdf.pages)} pages")
                if batch:
                    parts.append("\n".join(batch))
            result = "\n".join(parts)
            parts = []
            gc.collect()
            return result
        except Exception as exc:
            logger.warning(f"pdfplumber failed ({exc}), trying pypdf …")
            parts = []
            gc.collect()
            try:
                reader = PdfReader(pdf_path)
                batch = []
                for i2, page in enumerate(reader.pages):
                    try:
                        t = page.extract_text()
                        if t:
                            batch.append(t)
                    except Exception as page_exc:
                        logger.debug("Skipped page %d (pypdf) in %s: %s", i2, pdf_path, page_exc)
                    if len(batch) >= PAGE_BATCH_SIZE:
                        parts.append("\n".join(batch))
                        batch = []
                        gc.collect()
                if batch:
                    parts.append("\n".join(batch))
                result = "\n".join(parts)
                parts = []
                gc.collect()
                return result
            except Exception as exc2:
                logger.error(f"Both PDF methods failed for {pdf_path}: {exc2}")
                return ""

    def stream_pages(self, pdf_path: str,
                     batch_size: int = PAGE_BATCH_SIZE) -> Generator[str, None, None]:
        """Yield text in page batches — avoids holding the full PDF in RAM."""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                batch: List[str] = []
                for page in pdf.pages:
                    try:
                        t = page.extract_text()
                        if t:
                            batch.append(t)
                    except Exception:
                        pass
                    if len(batch) >= batch_size:
                        yield "\n".join(batch)
                        batch = []
                        gc.collect()
                if batch:
                    yield "\n".join(batch)
        except Exception as exc:
            logger.warning(f"pdfplumber stream failed ({exc}), falling back to pypdf …")
            try:
                reader = PdfReader(pdf_path)
                batch = []
                for page in reader.pages:
                    try:
                        t = page.extract_text()
                        if t:
                            batch.append(t)
                    except Exception:
                        pass
                    if len(batch) >= batch_size:
                        yield "\n".join(batch)
                        batch = []
                        gc.collect()
                if batch:
                    yield "\n".join(batch)
            except Exception as exc2:
                logger.error(f"Both stream methods failed: {exc2}")
