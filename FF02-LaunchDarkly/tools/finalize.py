"""Master the rendered video: two-pass EBU R128 loudness normalisation of the
audio, video re-encoded to standard yuv420p BT.709, plus a version with
burned-in captions.

Usage: python finalize.py <render.mp4> [en|fr]
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from openrouter import ROOT

OUT = ROOT / "output"
TARGET = {"I": -16.0, "TP": -1.5, "LRA": 11.0}


def run(cmd: list[str]) -> str:
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-2000:])
    return r.stderr


def main() -> None:
    src = Path(sys.argv[1]).resolve()
    OUT.mkdir(parents=True, exist_ok=True)
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"
    tag = "" if lang == "en" else f".{lang}"
    final = OUT / f"FF02-FeatureFlags-LaunchDarkly{tag}.mp4"
    captioned = OUT / f"FF02-FeatureFlags-LaunchDarkly{tag}.captioned.mp4"

    # pass 1: measure
    ln = f"loudnorm=I={TARGET['I']}:TP={TARGET['TP']}:LRA={TARGET['LRA']}:print_format=json"
    log = run(["ffmpeg", "-hide_banner", "-i", str(src), "-vn", "-af", ln, "-f", "null", "-"])
    m = json.loads(re.findall(r"\{[^{}]*\}", log)[-1])
    print("measured:", {k: m[k] for k in ("input_i", "input_tp", "input_lra")})

    # pass 2: apply (linear where possible), copy video
    ln2 = (f"loudnorm=I={TARGET['I']}:TP={TARGET['TP']}:LRA={TARGET['LRA']}"
           f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
           f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    # video: Remotion's JPEG frames give full-range yuvj420p; deliver standard
    # limited-range yuv420p BT.709 H.264 for maximum player compatibility
    run(["ffmpeg", "-y", "-hide_banner", "-i", str(src), "-map", "0:v", "-map", "0:a",
         "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
         "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-tune", "animation",
         "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
         "-af", ln2 + ",aresample=48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(final)])
    log = run(["ffmpeg", "-hide_banner", "-i", str(final), "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"])
    summ = log[log.rfind("Summary"):]
    print("final:", " ".join(summ.split())[:220])

    # captioned version (subtitles filter needs a simple relative path)
    srt = OUT / f"FF02-FeatureFlags-LaunchDarkly.{lang}.srt"
    tmp = OUT / "_subs.srt"
    shutil.copy(srt, tmp)
    style = ("FontName=Segoe UI Semibold,FontSize=17,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,"
             "BackColour=&H99000000,BorderStyle=4,Outline=0,Shadow=0,MarginV=22,Alignment=2")
    try:
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", final.name,
                        "-vf", f"subtitles=_subs.srt:force_style='{style}'",
                        "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p",
                        "-c:a", "copy", "-movflags", "+faststart", captioned.name], cwd=OUT, check=True)
    finally:
        tmp.unlink(missing_ok=True)
    for f in (final, captioned):
        print(f"{f.name}: {f.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
