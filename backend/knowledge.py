"""Moldova ANCE grade-9 knowledge base loader + retrieval.

Grounds the AI tutor in the official Moldovan exam program so generated
lessons use the exact facts, formulas, terminology and exam format from
ANCE, instead of the model's general (and possibly wrong) knowledge.

Data layout (knowledge_base/):
  math_clasa9.json      -> deep Mathematics KB
  history_clasa9.json   -> deep History KB
  romana_clasa9.json    -> deep Romanian KB
  ance_clasa9.json      -> original combined seed (fallback)

Usage (in ai_tutor.py):
    from knowledge import kb_context
    ctx = kb_context(subject, topic_title)   # -> grounding string for the prompt
"""
import json
import re
from functools import lru_cache
from pathlib import Path

_KB_DIR = Path(__file__).parent / "knowledge_base"
_SEED = _KB_DIR / "ance_clasa9.json"
_DEEP = {
    "math": _KB_DIR / "math_clasa9.json",
    "history": _KB_DIR / "history_clasa9.json",
    "romana": _KB_DIR / "romana_clasa9.json",
}


@lru_cache(maxsize=1)
def _seed() -> dict:
    with open(_SEED, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=8)
def _deep(skey: str) -> dict | None:
    path = _DEEP.get(skey)
    if path and path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return None


def _subject_data(skey: str) -> dict:
    """Prefer the deep per-subject file; fall back to the combined seed."""
    deep = _deep(skey)
    if deep:
        return deep
    return _seed()["subjects"][skey]


def _normalize(s: str) -> str:
    s = s.lower()
    for a, b in (("\u0103", "a"), ("\u00e2", "a"), ("\u00ee", "i"), ("\u0219", "s"), ("\u021b", "t")):
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
    skey = _subject_key(subject)
    if not skey:
        return ""
    sdata = _subject_data(skey)
    unit = _best_unit(sdata, topic_title)
    lines = [
        "CONTEXT OFICIAL (ANCE Moldova, clasa 9) \u2014 folose\u0219te STRICT aceste date:",
        f"Materie: {sdata.get('name', subject)}",
        f"Format examen: {sdata.get('exam_format', '')}",
    ]
    if sdata.get("grading_notes"):
        lines.append(f"Punctare: {sdata['grading_notes']}")
    if unit:
        lines.append(f"Unitate: {unit['title']}")
        lines.append(f"Rezumat: {unit.get('summary', '')}")
        if unit.get("formulas"):
            lines.append("Formule oficiale: " + " ; ".join(unit["formulas"]))
        if unit.get("dates"):
            lines.append("Date cheie: " + " ; ".join(f"{k} = {v}" for k, v in unit["dates"].items()))
        if unit.get("key_facts"):
            lines.append("Fapte cheie: " + " | ".join(unit["key_facts"]))
        if unit.get("worked_pattern"):
            lines.append(f"Model de rezolvare: {unit['worked_pattern']}")
        if unit.get("terminology"):
            lines.append("Terminologie corect\u0103: " + ", ".join(unit["terminology"]))
        if unit.get("common_mistakes"):
            lines.append("Gre\u0219eli frecvente de evitat/semnalat: " + " | ".join(unit["common_mistakes"]))
        if unit.get("sources_hint"):
            lines.append(f"Surse tipice: {unit['sources_hint']}")
        if unit.get("exam_notes"):
            lines.append(f"Note de examen: {unit['exam_notes']}")
    return "\n".join(lines)


def list_units(subject: str) -> list[str]:
    skey = _subject_key(subject)
    if not skey:
        return []
    return [u["title"] for u in _subject_data(skey).get("units", {}).values()]
