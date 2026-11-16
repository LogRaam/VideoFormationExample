"""Small OpenRouter helpers used by the asset-generation tools.

Reads OPENROUTER_API_KEY / OPENROUTER_BASE_URL from the environment or a .env
file at the project root.
"""
from __future__ import annotations

import base64
import json
import os
import time
import wave
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent


def _load_env() -> None:
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_env()
API_KEY = os.environ["OPENROUTER_API_KEY"]
BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "HTTP-Referer": "https://localhost/feature-flags-video",
    "X-Title": "Feature flags explainer",
}


class ClientError(RuntimeError):
    """A 4xx response: retrying will not help."""


def _retry(fn, attempts: int = 4, delay: float = 3.0):
    last = None
    for i in range(attempts):
        try:
            return fn()
        except ClientError:
            raise
        except Exception as e:  # noqa: BLE001 - network calls, retry everything else
            last = e
            print(f"  ! attempt {i + 1} failed: {e}")
            time.sleep(delay * (i + 1))
    raise last


def speech(text: str, model: str, voice: str | None, out: Path, fmt: str = "mp3",
           speed: float | None = None, provider: dict | None = None) -> Path:
    """Text-to-speech through /audio/speech. Returns the written file path."""
    body: dict = {"model": model, "input": text, "response_format": fmt}
    if voice:
        body["voice"] = voice
    if speed:
        body["speed"] = speed
    if provider:
        body["provider"] = provider

    if fmt == "wav":  # request raw PCM and wrap it ourselves
        body["response_format"] = "pcm"

    def call():
        r = requests.post(f"{BASE_URL}/audio/speech", headers=HEADERS, json=body, timeout=300)
        ctype = r.headers.get("content-type", "")
        if 400 <= r.status_code < 500 and r.status_code != 429:
            raise ClientError(f"{r.status_code}: {r.text[:400]}")
        if r.status_code != 200 or ctype.startswith("application/json"):
            raise RuntimeError(f"{r.status_code}: {r.text[:400]}")
        out.parent.mkdir(parents=True, exist_ok=True)
        if fmt == "wav":
            rate = 24000
            for part in ctype.split(";"):
                if part.strip().startswith("rate="):
                    rate = int(part.split("=")[1])
            with wave.open(str(out), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(rate)
                w.writeframes(r.content)
        else:
            out.write_bytes(r.content)
        return out

    return _retry(call)


def chat(model: str, messages: list, **extra) -> dict:
    """Plain chat completion, returns the parsed JSON response."""
    body = {"model": model, "messages": messages, **extra}

    def call():
        r = requests.post(f"{BASE_URL}/chat/completions", headers=HEADERS, json=body, timeout=600)
        if r.status_code != 200:
            raise RuntimeError(f"{r.status_code}: {r.text[:600]}")
        data = r.json()
        if "error" in data:
            raise RuntimeError(json.dumps(data["error"])[:600])
        return data

    return _retry(call)


def audio_part(path: Path) -> dict:
    fmt = path.suffix.lstrip(".").lower()
    return {"type": "input_audio",
            "input_audio": {"data": base64.b64encode(path.read_bytes()).decode(), "format": fmt}}


def image_part(path: Path) -> dict:
    mime = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"
    b64 = base64.b64encode(path.read_bytes()).decode()
    return {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}}
