"""Maps are current: each committed map equals what its generator produces now.

A failure is never a bug in the code under test: the code moved and the map did
not. Read the diff, then run `python tools/maps/update_maps.py` and commit the
map WITH the change.
"""
from __future__ import annotations

import difflib
import os
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "maps"))
import inventory  # noqa: E402

MAPS = ROOT / "docs" / "maps"


def norm(s: str) -> str:
    return s.replace("\r\n", "\n")


def assert_current(tc: unittest.TestCase, name: str, generated: str) -> None:
    path = MAPS / name
    if os.environ.get("UPDATE_MAPS") == "1":
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(generated.encode("utf-8"))
        return
    committed = norm(path.read_text(encoding="utf-8")) if path.exists() else ""
    if committed != norm(generated):
        diff = list(difflib.unified_diff(committed.splitlines(), generated.splitlines(), "committed", "generated", lineterm="", n=1))
        tc.fail(f"{name} drifted. Read the diff, then run tools/maps/update_maps.py and commit the map WITH the change.\n" + "\n".join(diff[:60]))


class MapsAreCurrent(unittest.TestCase):
    def test_inventory(self) -> None:
        if not inventory.tree_complete():
            self.skipTest("partial tree (no video/node_modules/typescript): nothing to compare with")
        assert_current(self, "inventory.md", inventory.generate())


if __name__ == "__main__":
    unittest.main()
