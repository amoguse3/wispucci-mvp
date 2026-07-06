"""KB ingest agent — fills the knowledge base from textbooks / ANCE programs.

This is the 'optimization' answer to: do we hand-write every unit forever?
No. The agent reads a source (a textbook chapter, the ANCE program PDF text,
or a solved past test) and DRAFTS a KB unit in the exact schema of
math_clasa9.json. A human then verifies before it goes live.

Hard rule: the agent NEVER writes straight to the production KB. It writes to
knowledge_base/_pending/ with a 'verified: false' flag. A reviewer promotes
it. This keeps hallucinations out of what students actually see.

Pipeline:
    raw source text
        -> extract(): Claude structures it into the unit schema
        -> validate(): schema + sanity checks (formulas present, no empty facts)
        -> stage(): write to _pending/ as verified:false
        -> [human] promote(): move into the live subject KB

Usage:
    python -m agent.kb_ingest_agent --subject math --node formule_calcul_prescurtat \
        --source path/to/chapter.txt
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

_KB_DIR = Path(__file__).resolve().parent.parent / "backend" / "knowledge_base"
_PENDING = _KB_DIR / "_pending"

# The schema every unit must follow (mirrors math_clasa9.json units).
UNIT_SCHEMA_HINT = {
    "title": "str",
    "summary": "str",
    "formulas": ["str"],
    "key_facts": ["str"],
    "terminology": ["str"],
    "worked_pattern": "str",
    "common_mistakes": ["str"],
    "exam_notes": "str",
}

EXTRACT_SYSTEM = (
    "Ești un asistent care structurează materialul de matematică (clasa 9, ANCE Moldova) "
    "în format JSON strict pentru o bază de cunoștințe. Folosești DOAR informația din "
    "sursa dată. Nu inventezi formule sau date. Dacă ceva lipsește, lași câmpul gol. "
    "Terminologia și formulele trebuie să fie exact cele din programa oficială."
)


def _client():
    try:
        from anthropic import Anthropic
    except ImportError:
        raise SystemExit("pip install anthropic")
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise SystemExit("Set ANTHROPIC_API_KEY")
    return Anthropic(api_key=key)


def extract(source_text: str, node_title: str) -> dict:
    """Ask the model to structure raw source into a KB unit draft."""
    client = _client()
    prompt = (
        f"Sursă (extras din manual/programă) pentru tema '{node_title}':\n"
        f"\"\"\"{source_text[:6000]}\"\"\"\n\n"
        "Extrage și returnează DOAR JSON valid cu structura:\n"
        f"{json.dumps(UNIT_SCHEMA_HINT, ensure_ascii=False, indent=2)}\n"
        "Reguli: formule în notație text simplă; key_facts scurte și verificabile; "
        "common_mistakes = greșeli tipice reale; worked_pattern = un exemplu rezolvat scurt."
    )
    msg = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        system=EXTRACT_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    text = msg.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1].lstrip("json").strip()
    return json.loads(text)


def validate(unit: dict) -> list[str]:
    """Return a list of problems; empty list = passes sanity checks."""
    problems = []
    if not unit.get("title"):
        problems.append("missing title")
    if not unit.get("summary"):
        problems.append("missing summary")
    if not unit.get("key_facts"):
        problems.append("no key_facts — a unit with no facts is useless")
    if not unit.get("terminology"):
        problems.append("no terminology — retrieval matching will be weak")
    for f in unit.get("formulas", []):
        if len(f) > 200:
            problems.append(f"suspiciously long formula: {f[:40]}...")
    return problems


def stage(subject: str, node_id: str, unit: dict) -> Path:
    """Write the draft to _pending with verified:false. Never touches live KB."""
    _PENDING.mkdir(parents=True, exist_ok=True)
    unit = {**unit, "_verified": False, "_node_id": node_id, "_subject": subject}
    out = _PENDING / f"{subject}_{node_id}.json"
    out.write_text(json.dumps(unit, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def promote(subject: str, node_id: str, grade: int = 9) -> None:
    """Human-approved: merge a verified pending unit into the live subject KB."""
    pending = _PENDING / f"{subject}_{node_id}.json"
    unit = json.loads(pending.read_text(encoding="utf-8"))
    if not unit.get("_verified"):
        raise SystemExit("Refusing to promote: set \"_verified\": true after human review.")
    live = _KB_DIR / f"{subject}_clasa{grade}.json"
    data = json.loads(live.read_text(encoding="utf-8"))
    for meta in ("_verified", "_node_id", "_subject"):
        unit.pop(meta, None)
    data.setdefault("units", {})[node_id] = unit
    live.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    pending.unlink()
    print(f"Promoted {node_id} into {live.name}")


def run(subject: str, node_id: str, source_path: str) -> None:
    source = Path(source_path).read_text(encoding="utf-8")
    node_title = node_id.replace("_", " ")
    unit = extract(source, node_title)
    problems = validate(unit)
    path = stage(subject, node_id, unit)
    print(f"Draft staged -> {path}")
    if problems:
        print("NEEDS ATTENTION before verifying:")
        for p in problems:
            print(f"  - {p}")
    else:
        print("Passed sanity checks. Review, set _verified:true, then promote().")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--subject", default="math")
    ap.add_argument("--node", required=True, help="graph node id, e.g. formule_calcul_prescurtat")
    ap.add_argument("--source", required=True, help="path to source text (textbook/program extract)")
    args = ap.parse_args()
    run(args.subject, args.node, args.source)
