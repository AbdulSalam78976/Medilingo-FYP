"""Text chunking with medical section awareness."""

import hashlib
import logging
import re
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


class TextChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, source: str = "unknown", id_offset: int = 0) -> List[Dict]:
        if not text or not text.strip():
            return []
        sentences = self._split_into_sentences(text)
        if len(sentences) <= 1:
            return self._chunk_by_characters(text, source, id_offset)

        chunks, chunk_id, current_chunk, current_length = [], id_offset, "", 0
        for sentence in sentences:
            slen = len(sentence)
            if current_length + slen > self.chunk_size and current_chunk:
                content = current_chunk.strip()
                uid = hashlib.md5(f"{source}_{chunk_id}_{content[:30]}".encode()).hexdigest()[:12]
                chunks.append({"id": f"{uid}_{chunk_id}", "content": content, "source": source,
                                "chunk_index": chunk_id, "length": len(current_chunk)})
                chunk_id += 1
                current_chunk = self._create_overlap(current_chunk)
                current_length = len(current_chunk)
            current_chunk += " " + sentence
            current_length += slen + 1

        if current_chunk.strip():
            content = current_chunk.strip()
            uid = hashlib.md5(f"{source}_{chunk_id}_{content[:30]}".encode()).hexdigest()[:12]
            chunks.append({"id": f"{uid}_{chunk_id}", "content": content, "source": source,
                            "chunk_index": chunk_id, "length": len(current_chunk)})
        return chunks

    def _split_into_sentences(self, text: str) -> List[str]:
        text = re.sub(r"(\d+\.\d+)", r"\1<SEP>", text)
        text = re.sub(r"([.!?])\s+", r"\1<SENT>", text)
        sentences = text.split("<SENT>")
        return [s.replace("<SEP>", ".").strip() for s in sentences if len(s) > 10]

    def _create_overlap(self, text: str) -> str:
        if len(text) <= self.chunk_overlap:
            return text
        overlap = text[-self.chunk_overlap:]
        last_period = overlap.rfind(".")
        if last_period > len(overlap) // 2:
            overlap = overlap[last_period + 1:].strip()
        return overlap

    def _chunk_by_characters(self, text: str, source: str, id_offset: int = 0) -> List[Dict]:
        chunks, chunk_id = [], id_offset
        for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
            chunk = text[i: i + self.chunk_size]
            if chunk.strip():
                uid = hashlib.md5(f"{source}_{chunk_id}_{chunk[:20]}".encode()).hexdigest()[:12]
                chunks.append({"id": f"{uid}_{chunk_id}", "content": chunk.strip(),
                                "source": source, "chunk_index": chunk_id, "length": len(chunk)})
                chunk_id += 1
        return chunks

    def chunk_documents(self, documents: List[Dict], id_offset: int = 0) -> List[Dict]:
        all_chunks, offset = [], id_offset
        for doc in documents:
            source = doc.get("filename", doc.get("source", "unknown"))
            chunks = self.chunk_text(doc["content"], source, id_offset=offset)
            all_chunks.extend(chunks)
            offset += len(chunks)
        return all_chunks


class AdaptiveChunker(TextChunker):
    """
    Chunker that detects medical section headers and splits at those boundaries
    before applying normal sentence chunking within each section.

    Each chunk gets the section title prepended so the embedding captures the
    section context (e.g. "SYMPTOMS\n<chunk text>").
    """

    # Matches common medical/academic section header patterns on their own line:
    #   ALL CAPS lines ≥ 4 chars (e.g. "DIAGNOSIS", "CLINICAL FEATURES")
    #   Numbered headings: "1.", "2.1", "Chapter 3"
    #   Named medical sections (case-insensitive)
    _HEADER_RE = re.compile(
        r"^(?:"
        r"(?:chapter|section|part|unit)\s+[\dIVXivx]+\b|"           # Chapter 3 / Section II
        r"\d{1,2}(?:\.\d{1,2}){0,2}\s+[A-Z][A-Za-z\s]{2,}|"        # 1.2 Title
        r"[A-Z][A-Z\s\-]{3,}(?:\s*$)|"                               # ALL CAPS TITLE
        r"(?:symptoms?|signs?|diagnosis|differential|treatment|"
        r"management|pathophysiology|etiology|aetiology|prognosis|"
        r"epidemiology|clinical\s+features?|investigations?|causes?|"
        r"complications?|prevention|definition|introduction|overview|"
        r"summary|classification|pathology|histology)\b"
        r")",
        re.IGNORECASE | re.MULTILINE,
    )

    def chunk_text(self, text: str, source: str = "unknown", id_offset: int = 0) -> List[Dict]:
        sections = self._split_by_sections(text)
        all_chunks: List[Dict] = []
        offset = id_offset

        for header, body in sections:
            if not body.strip():
                continue
            # Prepend section header as context so embeddings capture section meaning
            contextual = f"{header}\n{body}" if header else body
            chunks = super().chunk_text(contextual, source, id_offset=offset)
            all_chunks.extend(chunks)
            offset += len(chunks)

        return all_chunks

    def _split_by_sections(self, text: str) -> List[Tuple[str, str]]:
        """
        Walk through lines; whenever a header pattern is detected on a short
        line (< 120 chars), start a new section.  Returns list of (header, body).
        """
        lines = text.splitlines()
        sections: List[Tuple[str, str]] = []
        current_header = ""
        current_body: List[str] = []

        for line in lines:
            stripped = line.strip()
            # A header must be short (not a sentence) and match the pattern
            if stripped and len(stripped) < 120 and self._HEADER_RE.match(stripped):
                if current_body:
                    sections.append((current_header, "\n".join(current_body)))
                current_header = stripped
                current_body = []
            else:
                current_body.append(line)

        if current_body:
            sections.append((current_header, "\n".join(current_body)))

        # Fall back to treating the whole text as one section if nothing split
        return sections if sections else [("", text)]
