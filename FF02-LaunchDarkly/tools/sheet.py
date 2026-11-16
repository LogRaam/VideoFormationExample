"""Labelled contact sheets (3 columns, 12 stills per sheet) for visual QA.

Usage: python sheet.py <dir-with-t*.jpg>   -> writes <dir>/sheet_N.jpg
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main(d: Path) -> None:
    fs = sorted(d.glob("t*.jpg"))
    for i in range(0, len(fs), 12):
        grp = fs[i:i + 12]
        n = len(grp)
        inputs: list[str] = []
        for f in grp:
            inputs += ["-i", str(f)]
        filt = "".join(f"[{k}:v]scale=640:-1,drawtext=text={grp[k].stem}:x=10:y=10:fontsize=26:fontcolor=yellow:box=1:boxcolor=black[v{k}];" for k in range(n))
        layout = "|".join(f"{(k % 3) * 640}_{(k // 3) * 360}" for k in range(n))
        filt += "".join(f"[v{k}]" for k in range(n)) + (f"xstack=inputs={n}:layout={layout}:fill=black" if n > 1 else "null")
        subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", filt, str(d / f"sheet_{i // 12}.jpg")], check=True)
        print(d / f"sheet_{i // 12}.jpg")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
