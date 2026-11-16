"""Ask a video-capable model for a critical creative review of a rendered clip.

Usage: python review_video.py <clip.mp4> [start_s] [dur_s] [extra prompt]
The clip is cut/downscaled with ffmpeg (720p, 24 fps) before upload.
"""
from __future__ import annotations

import base64
import subprocess
import sys
import tempfile
from pathlib import Path

from openrouter import chat

MODEL = "google/gemini-3.1-pro-preview"
PROMPT = (
    "You are a demanding creative director and mix engineer reviewing a professional e-learning explainer "
    "video (motion graphics, AI narration, music, sound effects) in Quebec French, an introduction to feature flags with LaunchDarkly for non-developers (business analysts, QA, project managers) in a financial organisation. Key message: the deployed software stays unchanged; changing the flag configuration in LaunchDarkly changes the behaviour without redeploying. Also check French spelling, grammar and gender agreement of every on-screen word. "
    "Watch AND listen carefully. Give a concise, specific critique with timestamps (mm:ss relative to this clip):\n"
    "1. Visual glitches: overlapping or clipped text, elements colliding, illegible text, jarring cuts, empty/awkward frames.\n"
    "2. Sync: do visuals appear when the narrator mentions them? Anything noticeably early/late?\n"
    "3. Audio mix: narration clarity, music level vs voice, sound-effect levels (too loud/quiet/annoying/missing), clicks or artifacts.\n"
    "4. Pacing/clarity of the explanation.\n"
    "5. Top 5 concrete, actionable fixes ranked by impact.\n"
    "Do not praise generically; focus on problems. If something is genuinely excellent, one line is enough."
)


def main() -> None:
    src = Path(sys.argv[1])
    start = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
    dur = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
    extra = sys.argv[4] if len(sys.argv) > 4 else ""
    with tempfile.TemporaryDirectory() as td:
        clip = Path(td) / "clip.mp4"
        cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-i", str(src)]
        if dur:
            cmd += ["-t", str(dur)]
        cmd += ["-vf", "scale=1280:-2,fps=24", "-c:v", "libx264", "-crf", "30", "-preset", "veryfast",
                "-c:a", "aac", "-b:a", "96k", str(clip)]
        subprocess.run(cmd, check=True)
        b64 = base64.b64encode(clip.read_bytes()).decode()
    content = [{"type": "text", "text": PROMPT + ("\n" + extra if extra else "")},
               {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64}"}}]
    r = chat(MODEL, [{"role": "user", "content": content}])
    print(r["choices"][0]["message"]["content"])


if __name__ == "__main__":
    main()
