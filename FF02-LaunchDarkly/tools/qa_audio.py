"""Audio QA of a render: peak, and how far the music + effects bed sits under the
voice, measured on voice-active 200 ms windows (bed = mix minus gain-matched
narration). Lists the windows where the bed comes closest to the voice.

Usage: python qa_audio.py <video.mp4>
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000


def read(p: Path) -> np.ndarray:
    with wave.open(str(p)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768


def db(a: np.ndarray) -> float:
    return float(20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-9))


def main(video: Path) -> None:
    with tempfile.TemporaryDirectory() as td:
        mix_p = Path(td) / "mix.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vn", "-ac", "1", "-ar", str(SR), str(mix_p)], check=True)
        x = read(mix_p)
    y = read(ROOT / "video/public/audio/narration.fr.wav")
    m = min(len(x), len(y))
    x, y = x[:m], y[:m]
    g = float(np.dot(x, y) / np.dot(y, y))
    y = g * y
    r = x - y
    win = int(0.2 * SR)
    rows = []
    for i in range(0, m - win, win):
        v = db(y[i:i + win])
        if v > -32:
            rows.append((db(r[i:i + win]) - v, i / SR))
    margins = sorted(rows, reverse=True)
    print(f"peak {20 * np.log10(np.abs(x).max()):.1f} dBFS; voice-active windows {len(rows)}")
    print(f"bed under voice: median {-np.median([a for a, _ in rows]):.1f} dB below; closest windows (bed - voice, dB @ s):")
    print("  " + ", ".join(f"{a:+.1f}@{t:.1f}" for a, t in margins[:8]))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
