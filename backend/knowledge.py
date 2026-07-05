"""Moldova ANCE grade-9 knowledge base loader + retrieval.

Grounds the AI tutor in the official Moldovan exam program so generated
lessons use the exact facts, formulas, terminology and exam format from
ANCE, instead of the model's general (and possibly wrong) knowledge.

Usage (in ai_tutor.py):
    from knowledge import kb_context
    ctx = kb_context(subject, topic_title)   # -> grounding string for the prompt
"""
import json
import re
from functools import lru_cache
from pathlib import Path

_KB_PATH = Path(__file__).parent / "knowledge_base" / "ance_clasa9.json"


@lru_cache(maxsize=1)
def _load() -> dict:
    with open(_KB_PATH, encoding="utf-8") as f:
        return json.load(f)


def _normalize(s: str) -> str:
    s = s.lower()
    # strip Romanian diacritics for fuzzy matching
    for a, b in (("ă", "a"), ("â", "a"), ("î", "i"), ("ș", "s"), ("ț", "t")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9 ]", " ", s)


def _subject_key(subject: str) -> str | None:
    n = _normalize(subject)
    if any(w in n for w in ("mate", "math")):
        return "math"
    if any(w in n for w in ("istor", "hist")):
        return "history"
    if any(w in n for w in ("roman", "limba", "literatura")):
        return "romana"
    return None


def _best_unit(subject_data: dict, topic_title: str) -> dict | None:
    """Find the unit whose title/terminology best overlaps the topic title."""
    target = set(_normalize(topic_title).split())
    best, best_score = None, 0
    for unit in subject_data.get("units", {}).values():
        words = set(_normalize(unit["title"]).split())
        for term in unit.get("terminology", []):
            words |= set(_normalize(term).split())
        score = len(target & words)
        if score > best_score:
            best, best_score = unit, score
    return best


def kb_context(subject: str, topic_title: str) -> str:
    """Return a compact grounding block to inject into the AI prompt.

    Empty string if nothing matches (AI falls back to general knowledge).
    """
    kb = _load()
    skey = _subject_key(subject)
    if not skey:
        return ""
    sdata = kb["subjects"][skey]
    unit = _best_unit(sdata, topic_title)
    lines = [
        "CONTEXT OFICIAL (ANCE Moldova, clasa 9) — folosește STRICT aceste date:",
        f"Materie: {sdata['name']}",
        f"Format examen: {sdata['exam_format']}",
    ]
    if unit:
        lines.append(f"Unitate: {unit['title']}")
        lines.append(f"Rezumat: {unit['summary']}")
        if unit.get("formulas"):
            lines.append("Formule oficiale: " + " ; ".join(unit["formulas"]))
        if unit.get("dates"):
            lines.append("Date cheie: " + " ; ".join(f"{k} = {v}" for k, v in unit["dates"].items()))
        if unit.get("key_facts"):
            lines.append("Fapte cheie: " + " | ".join(unit["key_facts"]))
        if unit.get("terminology"):
            lines.append("Terminologie corectă: " + ", ".join(unit["terminology"]))
        if unit.get("common_mistakes"):
            lines.append("Greșeli frecvente de evitat/semnalat: " + " | ".join(unit["common_mistakes"]))
        if unit.get("exam_notes"):
            lines.append(f"Note de examen: {unit['exam_notes']}")
    return "\n".join(lines)


def list_units(subject: str) -> list[str]:
    kb = _load()
    skey = _subject_key(subject)
    if not skey:
        return []
    return [u["title"] for u in kb["subjects"][skey].get("units", {}).values()]
