"""
RAG query engine — retrieve + generate.

Supports two LLM providers (controlled by settings.LLM_PROVIDER):
  - "groq"   : LLaMA 3.3-70b via Groq (fast, free)
  - "gemini" : Gemini 2.0 Flash via Google AI (multimodal, better Urdu)
"""

import logging
import re
from typing import Dict, List, Optional

from app.rag.embeddings import EmbeddingGenerator
from app.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)

_LANG_PREFIXES = re.compile(
    r"^(Respond in English|Respond in Urdu|Respond in Roman Urdu[^:]*)\s*:\s*",
    re.IGNORECASE,
)


def _strip_lang_prefix(query: str) -> tuple[str, str]:
    m = _LANG_PREFIXES.match(query)
    if m:
        return m.group(1).strip(), query[m.end():].strip()
    return "Respond in English", query.strip()


def _build_history_messages(history: Optional[List[Dict]]) -> List[Dict]:
    if not history:
        return []
    trimmed = list(history[-8:])
    while trimmed and trimmed[-1].get("role") == "user":
        trimmed.pop()
    result = []
    for msg in trimmed:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            result.append({"role": role, "content": content})
    return result


def _build_system_prompt(lang_instruction: str) -> str:
    is_urdu = "urdu" in lang_instruction.lower() and "roman" not in lang_instruction.lower()
    is_roman_urdu = "roman" in lang_instruction.lower()

    if is_urdu:
        lang_block = (
            "LANGUAGE: Respond ENTIRELY in Urdu — Nastaliq script, right-to-left.\n"
            "CRITICAL: This is URDU, not Hindi. They share the same script but are different languages.\n"
            "  - Use Arabic/Persian vocabulary that Urdu speakers in Pakistan use:\n"
            "    دوا (dawa), بیماری (bimari), صحت (sehat), علاج (ilaj), مریض (mareez),\n"
            "    درد (dard), بخار (bukhar), خون (khoon), دماغ (dimagh), دل (dil)\n"
            "  - Do NOT use Sanskrit-derived Hindi words like: روگ، سواستھیہ، اوپچار، اوشدھ\n"
            "  - Every sentence must be natural Pakistani Urdu as spoken and written in Pakistan."
        )
    elif is_roman_urdu:
        lang_block = (
            "LANGUAGE: Respond ENTIRELY in Roman Urdu — Urdu words written in Latin/English script.\n"
            "CRITICAL: This is Roman URDU (Pakistani), not Hindi transliteration.\n"
            "  - Use Urdu vocabulary in Latin script:\n"
            "    'dawa', 'bimari', 'sehat', 'ilaj', 'mareez', 'dard', 'bukhar', 'khoon', 'dimagh'\n"
            "  - Do NOT use Hindi words: 'dawai', 'rog', 'swasthya', 'upchar', 'aushadh', 'vaid'\n"
            "  - Write exactly as Pakistani Urdu speakers naturally type in SMS or chat.\n"
            "  - Common Roman Urdu patterns: 'ap ko', 'hai', 'hoga', 'karna chahiye', 'zaroor'"
        )
    else:
        lang_block = "LANGUAGE: Respond entirely in English."

    return f"""You are Medilingo — a knowledgeable, articulate medical AI assistant for users in Pakistan and South Asia.

{lang_block}

RESPONSE STYLE:
- Answer DIRECTLY. Do NOT open with any preamble or intro sentence such as:
  "Pehle yeh samajhna zaroori hai...", "Pehly ye jana zarori hai...", "Is sawal ka jawab dene se pehle...",
  "Yeh ek ahem sawal hai...", "First, it is important to understand...", or any similar warm-up.
  Your very first sentence must be the answer itself.
- Write like a brilliant, trusted doctor friend — warm, clear, and confident.
- Match length to the question: a simple question gets 1–3 crisp sentences; a complex topic gets thorough but tight coverage.
- Never pad, hedge unnecessarily, or repeat yourself.
- Use **bold** sparingly for critical terms or warnings only.
- Use bullet points or numbered lists only when listing 3+ distinct items. Prose is preferred for most answers.
- Never mention documents, sources, knowledge bases, or reference material. Do not cite. Just answer directly as if from your own expertise.
- Do not add a "Sources" section, footnotes, or any attribution at the end.
- Do not start responses with "Certainly!", "Of course!", "Great question!", "Bilkul!", "Zaroor!", "Shukriya!", or similar filler phrases.

ACCURACY:
- Answer from authoritative medical knowledge. Be specific with mechanisms, causes, and treatments.
- Never fabricate drug names, dosages, lab values, or statistics.
- If the exact answer is genuinely uncertain, say so briefly and explain why.

SAFETY:
- For emergencies (chest pain, stroke, difficulty breathing, severe bleeding, loss of consciousness): tell the user to call emergency services or go to the nearest hospital immediately — then give useful information.
- End answers about personal symptoms with one brief, non-alarming line recommending a doctor visit.
- Never diagnose a specific patient or prescribe a specific medication dose."""


# ── Base engine (retrieval + prompt building) ─────────────────────────────────

class BaseRAGEngine:
    """Shared retrieval and prompt logic. Subclasses provide LLM generation."""

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_generator: EmbeddingGenerator,
        top_k: int = 5,
        similarity_threshold: float = 0.35,
    ):
        self.vector_store = vector_store
        self.embedding_generator = embedding_generator
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold
        self.model = "unknown"

    def retrieve(self, query: str, top_k: int = None) -> List[Dict]:
        k = top_k or self.top_k
        _, clean_query = _strip_lang_prefix(query)
        query_embedding = self.embedding_generator.generate_embedding(clean_query)
        results = self.vector_store.query(query_embedding, top_k=k)

        docs = []
        if results and results.get("documents"):
            for i, (doc, meta) in enumerate(
                zip(results["documents"][0], results["metadatas"][0])
            ):
                distance = results["distances"][0][i] if results.get("distances") else 0
                similarity = max(0.0, 1.0 - distance)
                docs.append({
                    "content": doc,
                    "source": meta.get("source", "unknown"),
                    "chunk_index": meta.get("chunk_index", "0"),
                    "similarity_score": round(similarity, 4),
                    "rank": i + 1,
                })
        logger.info("Retrieved %d documents for query.", len(docs))
        return docs

    def _build_context(self, docs: List[Dict]) -> str:
        relevant = [d for d in docs if d["similarity_score"] >= self.similarity_threshold]
        if not relevant:
            return ""
        parts = []
        for i, doc in enumerate(relevant, 1):
            source = doc["source"].split("\\")[-1].split("/")[-1]
            source_name = source.rsplit(".", 1)[0].replace("_", " ").strip()
            parts.append(f"[{i}] {source_name}")
            parts.append(doc["content"].strip())
            parts.append("")
        return "\n".join(parts)

    def _create_prompt(self, clean_query: str, context: str, lang_instruction: str) -> str:
        # Build a language reminder that is explicit for Urdu/Roman Urdu
        low = lang_instruction.lower()
        if "roman" in low:
            lang_reminder = "Respond in Roman Urdu (Pakistani Urdu in Latin script, NOT Hindi). Start answering immediately — no preamble."
        elif "urdu" in low:
            lang_reminder = "Respond in Urdu (Nastaliq script, Pakistani Urdu vocabulary, NOT Hindi). Start answering immediately — no preamble."
        else:
            lang_reminder = "Respond in English. Start answering immediately — no preamble."

        if context:
            return (
                f"Background knowledge:\n{context}\n\n"
                f"User question: {clean_query}\n\n"
                f"Answer using your medical expertise. {lang_reminder} "
                f"Do not mention or cite sources — integrate the knowledge naturally."
            )
        return (
            f"User question: {clean_query}\n\n"
            f"Answer from your medical expertise. {lang_reminder}"
        )

    def set_top_k(self, top_k: int) -> None:
        self.top_k = top_k

    def set_model(self, model_name: str) -> None:
        self.model = model_name

    # Subclasses must implement these:
    def generate_response(self, query, retrieved_docs, temperature=0.4, max_tokens=1024,
                          conversation_history=None) -> str:
        raise NotImplementedError

    def stream_generate_response(self, query, retrieved_docs, temperature=0.4,
                                 max_tokens=1024, conversation_history=None):
        raise NotImplementedError

    def query(self, query, top_k=None, temperature=0.4, max_tokens=1024,
              conversation_history=None) -> Dict:
        docs = self.retrieve(query, top_k=top_k)
        response = self.generate_response(query, docs, temperature, max_tokens, conversation_history)
        return {
            "query": query,
            "retrieved_docs": docs,
            "response": response,
            "num_retrieved": len(docs),
            "model": self.model,
        }


# ── Groq engine ───────────────────────────────────────────────────────────────

class RAGQueryEngine(BaseRAGEngine):
    """Groq LLaMA 3.3-70b backend."""

    def __init__(self, groq_api_key: str, vector_store: VectorStore,
                 embedding_generator: EmbeddingGenerator, top_k: int = 5,
                 similarity_threshold: float = 0.35):
        super().__init__(vector_store, embedding_generator, top_k, similarity_threshold)
        from groq import Groq
        self.client = Groq(api_key=groq_api_key)
        self.model = "llama-3.3-70b-versatile"
        logger.info("RAGQueryEngine (Groq) initialised (threshold=%.2f).", similarity_threshold)

    def generate_response(self, query, retrieved_docs, temperature=0.4, max_tokens=1024,
                          conversation_history=None) -> str:
        lang_instruction, clean_query = _strip_lang_prefix(query)
        context = self._build_context(retrieved_docs)
        prompt = self._create_prompt(clean_query, context, lang_instruction)
        system = _build_system_prompt(lang_instruction)

        messages = [{"role": "system", "content": system}]
        messages.extend(_build_history_messages(conversation_history))
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=self.model, messages=messages,
            temperature=temperature, max_tokens=max_tokens, top_p=0.9, stream=False,
        )
        return response.choices[0].message.content

    def stream_generate_response(self, query, retrieved_docs, temperature=0.4,
                                 max_tokens=1024, conversation_history=None):
        lang_instruction, clean_query = _strip_lang_prefix(query)
        context = self._build_context(retrieved_docs)
        prompt = self._create_prompt(clean_query, context, lang_instruction)
        system = _build_system_prompt(lang_instruction)

        messages = [{"role": "system", "content": system}]
        messages.extend(_build_history_messages(conversation_history))
        messages.append({"role": "user", "content": prompt})

        stream = self.client.chat.completions.create(
            model=self.model, messages=messages,
            temperature=temperature, max_tokens=max_tokens, top_p=0.9, stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta


# ── Gemini engine ─────────────────────────────────────────────────────────────

class GeminiRAGEngine(BaseRAGEngine):
    """Google Gemini 2.0 Flash backend — supports text + image input."""

    def __init__(self, gemini_api_key: str, vector_store: VectorStore,
                 embedding_generator: EmbeddingGenerator, top_k: int = 5,
                 similarity_threshold: float = 0.35):
        super().__init__(vector_store, embedding_generator, top_k, similarity_threshold)
        from google import genai
        from google.genai import types as genai_types
        self._client = genai.Client(api_key=gemini_api_key)
        self._types = genai_types
        self.model = "gemini-2.0-flash"
        logger.info("GeminiRAGEngine initialised (threshold=%.2f).", similarity_threshold)

    def _build_contents(self, system: str, history_messages: List[Dict],
                        prompt: str, image_bytes: bytes = None,
                        mime_type: str = None) -> tuple:
        """Returns (system_instruction, contents) for the new google-genai SDK."""
        contents = []
        for msg in history_messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(self._types.Content(
                role=role,
                parts=[self._types.Part.from_text(text=msg["content"])],
            ))
        parts = []
        if image_bytes and mime_type:
            parts.append(self._types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
        parts.append(self._types.Part.from_text(text=prompt))
        contents.append(self._types.Content(role="user", parts=parts))
        return system, contents

    def generate_response(self, query, retrieved_docs, temperature=0.4, max_tokens=1024,
                          conversation_history=None, image_bytes=None, mime_type=None) -> str:
        lang_instruction, clean_query = _strip_lang_prefix(query)
        context = self._build_context(retrieved_docs)
        prompt = self._create_prompt(clean_query, context, lang_instruction)
        system = _build_system_prompt(lang_instruction)
        history = _build_history_messages(conversation_history)
        _, contents = self._build_contents(system, history, prompt, image_bytes, mime_type)

        config = self._types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        response = self._client.models.generate_content(
            model=self.model, contents=contents, config=config,
        )
        return response.text

    def stream_generate_response(self, query, retrieved_docs, temperature=0.4,
                                 max_tokens=1024, conversation_history=None,
                                 image_bytes=None, mime_type=None):
        lang_instruction, clean_query = _strip_lang_prefix(query)
        context = self._build_context(retrieved_docs)
        prompt = self._create_prompt(clean_query, context, lang_instruction)
        system = _build_system_prompt(lang_instruction)
        history = _build_history_messages(conversation_history)
        _, contents = self._build_contents(system, history, prompt, image_bytes, mime_type)

        config = self._types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        for chunk in self._client.models.generate_content_stream(
            model=self.model, contents=contents, config=config,
        ):
            if chunk.text:
                yield chunk.text

    def analyze_image(self, image_bytes: bytes, mime_type: str, question: str,
                      language: str = "Respond in English") -> str:
        """Analyze a medical image (prescription, lab report, etc.) and answer a question."""
        lang_instruction, clean_question = _strip_lang_prefix(
            f"{language}: {question}" if not question.startswith("Respond") else question
        )
        system = _build_system_prompt(lang_instruction)
        prompt = (
            f"The user has uploaded a medical image (e.g. prescription, lab report, or clinical photo). "
            f"Please analyze it carefully and answer: {clean_question}\n\n{lang_instruction}."
        )
        config = self._types.GenerateContentConfig(system_instruction=system)
        contents = [
            self._types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            self._types.Part.from_text(text=prompt),
        ]
        response = self._client.models.generate_content(
            model=self.model, contents=contents, config=config,
        )
        return response.text


# ── Reranker mixin ────────────────────────────────────────────────────────────

class RerankerMixin:
    """Cross-encoder reranking + query expansion. Mixed into advanced engines."""

    def _get_cross_encoder(self):
        if not hasattr(self, "_cross_encoder") or self._cross_encoder is None:
            from sentence_transformers import CrossEncoder
            logger.info("Loading cross-encoder reranker…")
            self._cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            logger.info("Cross-encoder loaded.")
        return self._cross_encoder

    def _rerank(self, clean_query: str, docs: List[Dict]) -> List[Dict]:
        if not docs:
            return docs
        try:
            ce = self._get_cross_encoder()
            pairs = [(clean_query, doc["content"]) for doc in docs]
            scores = ce.predict(pairs)
            for doc, score in zip(docs, scores):
                doc["rerank_score"] = float(score)
            return sorted(docs, key=lambda d: d["rerank_score"], reverse=True)
        except Exception as exc:
            logger.warning("Reranking failed (%s); falling back to similarity sort.", exc)
            return sorted(docs, key=lambda d: d["similarity_score"], reverse=True)

    def _deduplicate(self, docs: List[Dict]) -> List[Dict]:
        seen, unique = set(), []
        for doc in docs:
            h = hash(doc["content"][:100])
            if h not in seen:
                seen.add(h)
                unique.append(doc)
        return unique

    def _expand_query_groq(self, client, model: str, clean_query: str,
                           num_expansions: int) -> List[str]:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": (
                    f"Generate {num_expansions} alternative English phrasings of this "
                    f"medical question for document retrieval. "
                    f"Return only the questions, one per line, no numbering:\n\n{clean_query}"
                )}],
                temperature=0.5, max_tokens=200,
            )
            lines = resp.choices[0].message.content.strip().split("\n")
            return [ln.strip() for ln in lines if ln.strip()][:num_expansions]
        except Exception as exc:
            logger.warning("Query expansion failed: %s", exc)
            return []

    def _expand_query_gemini(self, client, model: str, clean_query: str,
                             num_expansions: int) -> List[str]:
        try:
            from google.genai import types as t
            resp = client.models.generate_content(
                model=model,
                contents=clean_query,
                config=t.GenerateContentConfig(
                    system_instruction=(
                        f"Generate {num_expansions} alternative English phrasings of the "
                        f"medical question for document retrieval. "
                        f"Return only the questions, one per line, no numbering."
                    ),
                    max_output_tokens=200,
                ),
            )
            lines = resp.text.strip().split("\n")
            return [ln.strip() for ln in lines if ln.strip()][:num_expansions]
        except Exception as exc:
            logger.warning("Query expansion failed: %s", exc)
            return []

    def query_with_expansion(self, query: str, num_expansions: int = 2, top_k: int = None,
                             temperature: float = 0.4, max_tokens: int = 1024,
                             conversation_history: Optional[List[Dict]] = None) -> Dict:
        _, clean_query = _strip_lang_prefix(query)
        k = top_k or self.top_k

        if hasattr(self, "client"):
            expanded = self._expand_query_groq(self.client, self.model, clean_query, num_expansions)
        elif hasattr(self, "_client"):
            expanded = self._expand_query_gemini(self._client, self.model, clean_query, num_expansions)
        else:
            expanded = []

        all_docs: List[Dict] = []
        for q in [clean_query] + expanded:
            all_docs.extend(self.retrieve(q, top_k=k))

        unique = self._deduplicate(all_docs)
        reranked = self._rerank(clean_query, unique)
        top_docs = reranked[:k]

        response = self.generate_response(query, top_docs, temperature, max_tokens, conversation_history)
        return {
            "query": query,
            "expanded_queries": expanded,
            "retrieved_docs": top_docs,
            "response": response,
            "num_retrieved": len(reranked),
            "model": self.model,
        }


# ── Advanced engines (reranking + query expansion) ────────────────────────────

class AdvancedRAGEngine(RerankerMixin, RAGQueryEngine):
    """Groq + cross-encoder reranking + query expansion."""

    def __init__(self, *args, **kwargs):
        RAGQueryEngine.__init__(self, *args, **kwargs)  # explicit — avoids MRO cooperative-init issues with mixin
        self._cross_encoder = None


class GeminiAdvancedRAGEngine(RerankerMixin, GeminiRAGEngine):
    """Gemini 2.0 Flash + cross-encoder reranking + query expansion + image analysis."""

    def __init__(self, *args, **kwargs):
        GeminiRAGEngine.__init__(self, *args, **kwargs)  # explicit — same reason
        self._cross_encoder = None
