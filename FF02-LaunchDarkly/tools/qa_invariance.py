"""Acceptance check 8: the deployed software stays pixel-identical while the flag
is activated and rolled back.

Renders lossless full-size frames with Remotion every SWEEP seconds from one
second before the switch is turned on to the end of the roll-back sequence
(camera locked), crops the software box (video/src/data/layout.json) and
compares each frame with the first one. Prints the time ranges that differ.
Usage: python qa_invariance.py [--sweep 0.25]
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
AA_TOLERANCE = 4  # measured: 1-2 isolated pixels at 3-4/255 (browser rasterizer noise), invisible
_b = json.loads((ROOT / "video/src/data/layout.json").read_text(encoding="utf-8"))["box"]
BOX = (_b["x"], _b["y"], _b["x"] + _b["w"], _b["y"] + _b["h"])  # same layout file as the stage


def word_time(tl: dict, seg_id: str, word: str) -> float:
    for sc in tl["scenes"]:
        for s in sc["segments"]:
            if s["id"] == seg_id:
                for w in s["words"]:
                    if w["w"].lower().strip(".,:;!?…") == word:
                        return w["start"]
    raise KeyError((seg_id, word))


def main() -> int:
    tl = json.loads((ROOT / "video/src/data/timeline.fr.json").read_text(encoding="utf-8"))
    seg_end = {s["id"]: s["end"] for sc in tl["scenes"] for s in sc["segments"]}
    step = float(sys.argv[sys.argv.index("--sweep") + 1]) if "--sweep" in sys.argv else 0.25
    t0 = word_time(tl, "f2", "l'active") - 1.0
    t1 = seg_end["r2"]
    moments = {f"{t:6.2f} s": round(t, 2) for t in np.arange(t0, t1 + 1e-6, step)}
    out = ROOT / "build" / "qa" / "invariance"
    env = {**os.environ, "FORMAT": "png", "SCALE": "1"}
    if "--no-render" not in sys.argv:  # --no-render: re-analyse frames already in build/qa/invariance
        subprocess.run(["node", "stills.mjs", str(out), *map(str, moments.values())], cwd=ROOT / "video", env=env, check=True)
    crops = {}
    for label, t in moments.items():
        img = Image.open(out / f"t{str(t).rjust(6, '0')}.png").convert("RGB")
        crop = img.crop(BOX)
        crops[label] = np.asarray(crop).astype(int)
    # the box has rounded corners (radius 26) and an anti-aliased outer edge: what lies
    # behind it (animated background, a lane, a dot) shows through those pixels and is
    # not part of the software, so compare inside the rounded shape, 2 px in from the edge
    h, w = BOX[3] - BOX[1], BOX[2] - BOX[0]
    yy, xx = np.mgrid[0:h, 0:w]
    r, edge = 28, 2
    cx = np.clip(xx, r, w - 1 - r)
    cy = np.clip(yy, r, h - 1 - r)
    inside = ((xx - cx) ** 2 + (yy - cy) ** 2 <= (r - 2) ** 2) & (xx >= edge) & (xx < w - edge) & (yy >= edge) & (yy < h - edge)
    ref_label, ref = next(iter(crops.items()))
    ok = True
    print(f"software box crop {BOX}, {len(crops)} frames every {step} s, reference = {ref_label}")
    bad = []
    for label, c in crops.items():
        d = np.abs(c - ref) * inside[:, :, None]
        changed = int((d.max(axis=2) > 0).sum())
        if d.max() > AA_TOLERANCE:
            bad.append(f"{label} (max {d.max()}, {changed} px)")
        # tolerance: isolated pixels may differ by a few levels out of 255 between
        # browser compositing passes (invisible); anything above that is a real change
        ok &= int(d.max()) <= AA_TOLERANCE
    for b in bad:
        print("  differs at", b)
    print(f"IDENTICAL over the whole sweep (within {AA_TOLERANCE}/255 anti-aliasing)" if ok else "DIFFERENT")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
