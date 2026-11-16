"""Build broadcast-style subtitles from the word-level timeline.

Cues break at sentence/clause boundaries, hold at most 2 lines x 42 chars,
and use the real word start/end times from forced alignment.
"""
from __future__ import annotations

import json
import re
import textwrap

from openrouter import ROOT

TIMELINE = ROOT / "video" / "src" / "data" / "timeline.json"
OUT = ROOT / "output" / "FF02-FeatureFlags-LaunchDarkly.en.srt"
MAX_CHARS = 84
LINE = 42
MIN_DUR = 1.0


def ts(x: float) -> str:
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def cues_for(words: list[dict]) -> list[tuple[float, float, str]]:
    cues, cur = [], []

    def flush():
        if cur:
            cues.append((cur[0]["start"], cur[-1]["end"], " ".join(w["w"] for w in cur)))
            cur.clear()

    for i, w in enumerate(words):
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        nxt = words[i + 1]["w"] if i + 1 < len(words) else ""
        sentence_end = w["w"].endswith((".", "?", "!", ":"))
        clause_end = w["w"].endswith((",", ";"))
        if sentence_end and len(text) > 25:
            flush()
        elif len(text) + len(nxt) + 1 > MAX_CHARS:
            # back off to the last clause boundary if there is one in the second half
            cut = max((k for k, x in enumerate(cur[:-1]) if x["w"].endswith((",", ";", ":"))), default=-1)
            if cut >= len(cur) // 2:
                rest = cur[cut + 1:]
                del cur[cut + 1:]
                flush()
                cur.extend(rest)
            else:
                flush()
        elif clause_end and len(text) > 60:
            flush()
    flush()
    return cues


def main(lang: str = "en") -> None:
    sfx = "" if lang == "en" else f".{lang}"
    tl = json.loads((TIMELINE.parent / f"timeline{sfx}.json").read_text(encoding="utf-8"))
    out_path = OUT.parent / f"FF02-FeatureFlags-LaunchDarkly.{lang}.srt"
    all_cues = []
    for sc in tl["scenes"]:
        for s in sc["segments"]:
            all_cues += cues_for(s["words"])
    # fold orphan cues (one or two words) into the previous cue of the same sentence flow
    merged: list[tuple[float, float, str]] = []
    for a, b, text in all_cues:
        if merged and len(text.split()) <= 2 and a - merged[-1][1] < 0.6 and len(merged[-1][2]) + len(text) <= MAX_CHARS + 12:
            pa, _, pt = merged[-1]
            merged[-1] = (pa, b, f"{pt} {text}")
        else:
            merged.append((a, b, text))
    all_cues = merged
    out, n = [], 1
    for i, (a, b, text) in enumerate(all_cues):
        nxt = all_cues[i + 1][0] if i + 1 < len(all_cues) else b + 2
        b = min(max(b + 0.25, a + MIN_DUR), nxt - 0.04)
        text = re.sub(r'"(?=\w)', "“", text).replace('"', "”")
        lines = textwrap.wrap(text, LINE) if len(text) > LINE else [text]
        if len(lines) > 2:
            lines = textwrap.wrap(text, (len(text) + 1) // 2 + 4)
        out.append(f"{n}\n{ts(a)} --> {ts(b)}\n" + "\n".join(lines) + "\n")
        n += 1
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(out), encoding="utf-8")
    print(f"{n - 1} cues -> {out_path}")


if __name__ == "__main__":
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else "en")
