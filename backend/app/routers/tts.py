"""
/tts  — Neural Text-to-Speech via Microsoft Edge TTS (edge-tts).

Free, no API key. Uses Microsoft Neural voices.
Streams audio chunks immediately so playback starts without waiting for the full file.
"""

import re
import logging
import traceback
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tts", tags=["tts"])


# ── Voice map ─────────────────────────────────────────────────────────────────
VOICES: dict[str, dict[str, str]] = {
    "English": {
        "Saira":   "en-US-JennyNeural",
        "Bilal":   "en-US-GuyNeural",
        "Aria":    "en-GB-SoniaNeural",
        "default": "en-US-JennyNeural",
    },
    "Urdu": {
        "Saira":   "ur-PK-UzmaNeural",
        "Bilal":   "ur-PK-AsadNeural",
        "Aria":    "ur-PK-UzmaNeural",
        "default": "ur-PK-UzmaNeural",
    },
    "Roman Urdu": {
        # Latin script — Hindi neural voices share Urdu vocabulary
        "Saira":   "hi-IN-SwaraNeural",
        "Bilal":   "hi-IN-MadhurNeural",
        "Aria":    "hi-IN-SwaraNeural",
        "default": "hi-IN-SwaraNeural",
    },
}


class TTSRequest(BaseModel):
    text: str
    language: str = "English"
    persona:  str = "Saira"
    speed:    float = 1.0


def _strip_markdown(text: str) -> str:
    text = re.sub(r"#{1,6}\s+", "", text)
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"\*\*(.+?)\*\*",     r"\1", text, flags=re.DOTALL)
    text = re.sub(r"\*(.+?)\*",         r"\1", text, flags=re.DOTALL)
    text = re.sub(r"`{1,3}[\s\S]*?`{1,3}", "", text)
    text = re.sub(r"\[(.+?)\]\(.+?\)",  r"\1", text)
    text = re.sub(r"^[-*+]\s+",  "", text, flags=re.MULTILINE)
    text = re.sub(r"^\d+\.\s+",  "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s+",      "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _speed_to_rate(speed: float) -> str:
    pct = round((speed - 1.0) * 100)
    return f"+{pct}%" if pct >= 0 else f"{pct}%"


# ── Streaming generator ───────────────────────────────────────────────────────

async def _stream_tts(text: str, voice: str, rate: str):
    """Yield MP3 audio chunks as edge-tts produces them."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]


# ── Quick browser test ────────────────────────────────────────────────────────

@router.get("/test")
async def tts_test(voice: str = "en-US-JennyNeural", text: str = "Hello, MediLingo TTS is working."):
    """Open /tts/test in your browser to verify edge-tts is working."""
    try:
        import edge_tts
        import io
        communicate = edge_tts.Communicate(text, voice, rate="+0%")
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        buf.seek(0)
        audio = buf.read()
        if not audio:
            raise ValueError("edge-tts returned empty audio")
        return Response(content=audio, media_type="audio/mpeg")
    except Exception as exc:
        return Response(
            content=f"TTS TEST FAILED\nvoice={voice}\n{type(exc).__name__}: {exc}\n\n{traceback.format_exc()}",
            media_type="text/plain",
            status_code=500,
        )


# ── Main TTS endpoint (streaming) ─────────────────────────────────────────────

@router.post("")
async def text_to_speech(body: TTSRequest):
    """
    Returns a streamed MP3 audio response.
    Streaming means audio playback starts as soon as the first bytes arrive
    instead of waiting for the full file — significantly reduces perceived latency.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    try:
        import edge_tts  # noqa: F401
    except ImportError:
        raise HTTPException(status_code=500, detail="edge-tts not installed in this environment.")

    clean = _strip_markdown(body.text)
    if not clean:
        raise HTTPException(status_code=400, detail="text is empty after stripping markdown")

    # Limit length — first ~1200 chars covers a full medical response without lag
    if len(clean) > 1200:
        clean = clean[:1200].rsplit(" ", 1)[0] + "."

    lang_voices = VOICES.get(body.language, VOICES["English"])
    voice = lang_voices.get(body.persona, lang_voices["default"])
    rate  = _speed_to_rate(max(0.5, min(2.0, body.speed)))

    logger.info("TTS  lang=%-12s persona=%-6s voice=%s  rate=%s  len=%d",
                body.language, body.persona, voice, rate, len(clean))

    return StreamingResponse(
        _stream_tts(clean, voice, rate),
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-cache", "X-Voice": voice},
    )
