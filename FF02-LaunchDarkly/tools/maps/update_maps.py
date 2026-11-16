"""Regenerate every map and print what moved (full diff when 40 lines or fewer).

Run the maps test in plain (compare) mode FIRST and read its failures; only then
run this. Usage: python tools/maps/update_maps.py
"""
from __future__ import annotations

import difflib
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAPS = ROOT / "docs" / "maps"


def main() -> int:
    before = {p.name: p.read_text(encoding="utf-8").replace("\r\n", "\n") for p in MAPS.glob("*.md")} if MAPS.exists() else {}
    env = {**os.environ, "UPDATE_MAPS": "1"}
    r = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_maps.py"], cwd=ROOT, env=env)
    for p in sorted(MAPS.glob("*.md")):
        if p.name == "README.md":
            continue
        new = p.read_text(encoding="utf-8").replace("\r\n", "\n")
        old = before.get(p.name, "")
        diff = [l for l in difflib.unified_diff(old.splitlines(), new.splitlines(), lineterm="", n=0) if not l.startswith(("---", "+++", "@@"))]
        added = sum(1 for l in diff if l.startswith("+"))
        removed = sum(1 for l in diff if l.startswith("-"))
        print(f"{p.name}: +{added} -{removed}")
        if 0 < len(diff) <= 40:
            print("\n".join("    " + l for l in diff))
    return r.returncode


if __name__ == "__main__":
    raise SystemExit(main())
