"""Generate docs/maps/inventory.md: every top-level declaration of the project,
by file, with the first line of its doc. Python tools are read with `ast`, the
animation sources with the TypeScript compiler API (ts_inventory.mjs).

Deterministic: sorted paths, no timestamps, no absolute paths, LF endings.
Blind spots: nested functions/classes are not listed; Python module-level
constants are listed only when UPPER_CASE.
"""
from __future__ import annotations

import ast
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LARGE = 300  # lines

HEADER = """# Inventory (generated — do not edit)

Read it BEFORE adding a component, helper, cue or tool: does it already exist?
Regenerate with `python tools/maps/update_maps.py`; `python -m unittest discover -s tests` fails when it drifts.
"""


def first_line(s: str | None) -> str:
    return next((x.strip() for x in (s or "").splitlines() if x.strip()), "")


def cell(s: str) -> str:
    return s.replace("|", "\\|")


def python_section() -> list[str]:
    out = ["## Tools (`tools`)", ""]
    for f in sorted((ROOT / "tools").rglob("*.py")):
        rel = f.relative_to(ROOT).as_posix()
        tree = ast.parse(f.read_text(encoding="utf-8"))
        out += [f"### {rel}", "", f"_{cell(first_line(ast.get_docstring(tree)))}_" if ast.get_docstring(tree) else "_(no module doc)_", ""]
        rows = []
        for n in tree.body:
            if isinstance(n, (ast.FunctionDef, ast.ClassDef)):
                kind = "class" if isinstance(n, ast.ClassDef) else "function"
                rows.append((n.name, kind, first_line(ast.get_docstring(n))))
            elif isinstance(n, (ast.Assign, ast.AnnAssign)):
                targets = n.targets if isinstance(n, ast.Assign) else [n.target]
                for tg in targets:
                    if isinstance(tg, ast.Name) and tg.id.isupper():
                        rows.append((tg.id, "const", ""))
        if rows:
            out += ["| name | kind | doc |", "|---|---|---|"]
            out += [f"| `{a}` | {b} | {cell(c)} |" for a, b, c in rows]
            out.append("")
    return out


def large_files() -> list[str]:
    files = sorted([*(ROOT / "tools").rglob("*.py"), *(ROOT / "video" / "src").rglob("*.ts*")])
    rows = []
    for f in files:
        n = len(f.read_text(encoding="utf-8").splitlines())
        if n > LARGE:
            rows.append(f"- `{f.relative_to(ROOT).as_posix()}`: {n // 50 * 50}+ lines")
    return ["## Large files (> 300 lines, rounded down to 50)", "", *(rows or ["_(none)_"]), ""]


def generate() -> str:
    ts = subprocess.run(["node", str(Path(__file__).with_name("ts_inventory.mjs"))], capture_output=True, text=True, encoding="utf-8", check=True).stdout
    parts = [HEADER, *python_section(), ts.rstrip("\n"), "", *large_files()]
    return "\n".join(parts).rstrip("\n") + "\n"


def tree_complete() -> bool:
    return (ROOT / "video" / "node_modules" / "typescript").exists() and (ROOT / "video" / "src").exists()


if __name__ == "__main__":
    print(generate(), end="")
