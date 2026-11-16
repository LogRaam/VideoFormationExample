"""Generate music with Lyria via streamed chat completions (audio output)."""
from __future__ import annotations
import base64, json, sys
from pathlib import Path
import requests
from openrouter import BASE_URL, HEADERS, ROOT

def lyria(prompt: str, out: Path, model="google/lyria-3-pro-preview", fmt="wav") -> Path:
    body = {"model": model, "messages": [{"role": "user", "content": prompt}],
            "modalities": ["text", "audio"], "audio": {"format": fmt}, "stream": True}
    r = requests.post(f"{BASE_URL}/chat/completions", headers=HEADERS, json=body, stream=True, timeout=900)
    if r.status_code != 200:
        raise RuntimeError(f"{r.status_code} {r.text[:500]}")
    chunks, text = [], []
    for line in r.iter_lines():
        if not line or not line.startswith(b"data: "):
            continue
        data = line[6:]
        if data == b"[DONE]":
            break
        ev = json.loads(data)
        if "error" in ev:
            raise RuntimeError(ev["error"])
        for ch in ev.get("choices", []):
            d = ch.get("delta", {})
            if d.get("content"):
                text.append(d["content"])
            a = d.get("audio")
            if a and a.get("data"):
                chunks.append(a["data"])
    raw = b"".join(base64.b64decode(c) for c in chunks)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(raw)
    print(f"{out.name}: {len(raw)} bytes, {len(chunks)} chunks, text={''.join(text)[:200]!r}")
    return out

if __name__ == "__main__":
    lyria(sys.argv[2], ROOT / "build" / "music" / sys.argv[1], model=sys.argv[3] if len(sys.argv) > 3 else "google/lyria-3-pro-preview")
