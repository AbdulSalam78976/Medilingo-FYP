"""Text preprocessing — moved from backend/text_preprocessor.py"""

import re
import logging
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_CHUNK_SIZE = 1_000_000  # 1 MB per processing chunk


class TextCleaner:
    MEDICAL_PATTERNS = {
        "multiple_spaces": r"\s+",
        "newlines": r"\n+",
        "special_chars": r'[^\w\s\.\,\-\:\;\'\"\(\)\[\]\{\}\@\#\&]',
        "page_markers": r"\x0c",
    }

    def clean_text(self, text: str, preserve_medical_terms: bool = True) -> str:
        if not text or not isinstance(text, str):
            return ""
        if len(text) > _CHUNK_SIZE:
            parts = [
                self._clean_chunk(text[i : i + _CHUNK_SIZE], preserve_medical_terms)
                for i in range(0, len(text), _CHUNK_SIZE)
            ]
            return " ".join(parts)
        return self._clean_chunk(text, preserve_medical_terms)

    def _clean_chunk(self, text: str, preserve_medical_terms: bool = True) -> str:
        text = re.sub(self.MEDICAL_PATTERNS["page_markers"], " ", text)
        text = re.sub(self.MEDICAL_PATTERNS["newlines"], " ", text)
        text = re.sub(self.MEDICAL_PATTERNS["multiple_spaces"], " ", text)
        if not preserve_medical_terms:
            text = re.sub(self.MEDICAL_PATTERNS["special_chars"], "", text)
        text = re.sub(r"http\S+|www\S+", "", text)
        text = re.sub(r"\S+@\S+", "", text)
        text = re.sub(r"[\.]{2,}", ".", text)
        text = re.sub(r"[\-]{2,}", "-", text)
        text = re.sub(r"\s+([.,!?;:])", r"\1", text)
        text = re.sub(r"([.,!?;:])\s+", r"\1 ", text)
        return text.strip()

    def normalize_text(self, text: str) -> str:
        """
        Light normalization — deliberately does NOT lowercase.
        Lowercasing destroys critical medical abbreviations (MI, DVT, HIV, ACE,
        pH, mmHg) and makes citations unreadable. Semantic embeddings are
        case-insensitive by design, so case preservation has no retrieval cost.
        """
        if len(text) > _CHUNK_SIZE:
            parts = []
            for i in range(0, len(text), _CHUNK_SIZE):
                parts.append(self._normalize_chunk(text[i : i + _CHUNK_SIZE]))
            return " ".join(parts)
        return self._normalize_chunk(text)

    def _normalize_chunk(self, text: str) -> str:
        # Only expand unambiguous abbreviations; keep everything else as-is
        abbreviations = {
            r"\bDr\.?\b": "Doctor",
            r"\bPt\.?\b": "Patient",
            r"\bFx\.?\b": "Fracture",
        }
        for pattern, replacement in abbreviations.items():
            text = re.sub(pattern, replacement, text)
        return text


class TextValidator:
    @staticmethod
    def is_valid_text(text: str, min_length: int = 50) -> bool:
        if not text or len(text.strip()) < min_length:
            return False
        return len(text.split()) >= 5


class PreprocessingPipeline:
    def __init__(self):
        self.cleaner = TextCleaner()
        self.validator = TextValidator()

    def process(self, text: str, normalize: bool = True) -> str:
        cleaned = self.cleaner.clean_text(text)
        if not self.validator.is_valid_text(cleaned):
            return ""
        if normalize:
            cleaned = self.cleaner.normalize_text(cleaned)
        return cleaned
