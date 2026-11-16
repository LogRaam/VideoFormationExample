"""Acceptance check 8: the deployed software is pixel-identical before the flag is
activated, after activation (new dashboard shown) and after the roll-back.

Renders three lossless full-size frames with Remotion, crops the software box
(production slot, see BOX in video/src/scenes/Stage.tsx) and compares pixels.
Usage: python qa_invariance.py
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
AA_TOLERANCE = 2
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
    moments = {
        "before activation (flag off, old dashboard)": round(word_time(tl, "f2", "responsable") - 0.2, 2),
        "after activation (flag on, new dashboard shown)": round(word_time(tl, "f5", "configuration"), 2),
        "after roll-back (flag off, old dashboard again)": round(seg_end["r2"] - 0.5, 2),
    }
    out = ROOT / "build" / "qa" / "invariance"
    env = {**os.environ, "FORMAT": "png", "SCALE": "1"}
    subprocess.run(["node", "stills.mjs", str(out), *map(str, moments.values())], cwd=ROOT / "video", env=env, check=True)
    crops = {}
    for label, t in moments.items():
        img = Image.open(out / f"t{str(t).rjust(6, '0')}.png").convert("RGB")
        crop = img.crop(BOX)
        crop.save(out / f"box_{t}.png")
        crops[label] = np.asarray(crop).astype(int)
    # the box has rounded corners (radius 26): the animated background shows through
    # them and is not part of the software, so compare inside the rounded shape only
    h, w = BOX[3] - BOX[1], BOX[2] - BOX[0]
    yy, xx = np.mgrid[0:h, 0:w]
    r = 28
    cx = np.clip(xx, r, w - 1 - r)
    cy = np.clip(yy, r, h - 1 - r)
    inside = (xx - cx) ** 2 + (yy - cy) ** 2 <= (r - 2) ** 2
    ref_label, ref = next(iter(crops.items()))
    ok = True
    print(f"software box crop {BOX}, reference = {ref_label}")
    for label, c in crops.items():
        d = np.abs(c - ref) * inside[:, :, None]
        changed = int((d.max(axis=2) > 0).sum())
        print(f"  {label:50s} max diff {d.max():3d}, pixels changed {changed}")
        # tolerance: anti-aliasing of edges may differ by 1-2 levels out of 255 between
        # browser compositing passes (invisible); anything above that is a real change
        ok &= int(d.max()) <= AA_TOLERANCE
    print(f"IDENTICAL (within {AA_TOLERANCE}/255 anti-aliasing)" if ok else "DIFFERENT")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
