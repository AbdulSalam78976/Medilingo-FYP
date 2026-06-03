"""
Entry point — run with:
    python run.py
or:
    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""

import os

# Tell HuggingFace to use the local cache — skips 30+ HTTP HEAD requests on
# every startup that slow boot by 10-20 seconds. The embedding model is already
# downloaded; no internet check is needed.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,   # reload=True boots the app twice — disable for speed
        log_level="info",
    )
