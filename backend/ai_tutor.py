"""AI tutor engine powered by Claude (Anthropic).

Handles: lesson generation, adaptive re-explanation, contextual Q&A,
and exam question generation in the ANCE format.
"""
import json
from anthropic import AsyncAnthropic
from config import settings

client = AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
MODEL = "claude-3-5-sonnet-20241022"

TUTOR_SYSTEM = (
    "Ești Wispucci, un tutore AI prietenos pentru elevii de clasa a 9-a din Moldova "
    "care se pregătesc pentru examenele naționale de absolvire a gimnaziului (ANCE). "
    "Predai în limba română, clar și pas cu pas. Nu dai răspunsul de-a gata: ghidezi elevul "
    "să înțeleagă. Folosești exemple concrete, analogii simple și un ton cald, încurajator. "
    "Eviți jargonul inutil. Când elevul greșește, explici ALTFEL, nu repeți la fel."
)


async def generate_lesson(subject: str, topic_title: str, level: int) -> dict:
    """Generate a full lesson with explanation + quiz for a topic."""
    if client is None:
        return _fallback_lesson(topic_title)
    level_names = ["de la zero", "începător", "mediu", "avansat"]
    level_name = level_names[level] if 0 <= level < len(level_names) else "mediu"
    prompt = (
        f"Generează o lecție pentru tema '{topic_title}' de la {subject}, "
        f"nivel {level_name}, conform programei ANCE clasa 9.\n\n"
        "Răspunde DOAR cu JSON valid în această structură:\n"
        "{\n"
        '  "content_html": "<h2>...</h2><p>...</p> (folosește h2, h3, p, span.formula, div.note)",\n'
        '  "quiz": [\n'
        '    {"q": "întrebare", "opts": ["a","b","c","d"], "correct": 0, "explanation": "de ce"}\n'
        "  ]\n"
        "}\n"
        "Lecția: scurtă (2-4 paragrafe), 1-2 formule/note cheie, 2 întrebări quiz. "
        "Formulele în span class='formula'. Notele importante în div class='note' cu <strong>."
    )
    msg = await client.messages.create(
        model=MODEL, max_tokens=2000, system=TUTOR_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    text = msg.content[0].text.strip()
    return _parse_json(text, fallback=_fallback_lesson(topic_title))


async def reexplain(topic_title: str, section: str, prior_attempt: str = "") -> str:
    """Re-explain a section differently when the student is stuck."""
    if client is None:
        return "Backend AI neconfigurat. Adaugă ANTHROPIC_API_KEY în .env."
    prompt = (
        f"Elevul nu a înțeles această parte din tema '{topic_title}':\n\"{section}\"\n"
    )
    if prior_attempt:
        prompt += f"Ce a încercat elevul: {prior_attempt}\n"
    prompt += "Explică ALTFEL, mai simplu, cu un exemplu concret. Max 3 propoziții."
    msg = await client.messages.create(
        model=MODEL, max_tokens=400, system=TUTOR_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()


async def answer_question(topic_title: str, lesson_context: str, question: str) -> str:
    """Answer a student's contextual question about the current lesson."""
    if client is None:
        return "Backend AI neconfigurat. Adaugă ANTHROPIC_API_KEY în .env."
    prompt = (
        f"Contextul lecției (tema '{topic_title}'):\n{lesson_context[:1500]}\n\n"
        f"Întrebarea elevului: {question}\n\n"
        "Răspunde clar și concis (max 4 propoziții). Ghidează, nu doar da răspunsul."
    )
    msg = await client.messages.create(
        model=MODEL, max_tokens=500, system=TUTOR_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()


async def generate_exam(subject: str, topics: list[str], num_questions: int = 10) -> dict:
    """Generate a full exam simulation in ANCE format from covered topics."""
    if client is None:
        return {"questions": _fallback_exam()}
    prompt = (
        f"Generează o simulare de examen ANCE clasa 9 la {subject}, {num_questions} întrebări, "
        f"acoperind temele: {', '.join(topics)}.\n"
        "Răspunde DOAR cu JSON:\n"
        '{"questions": [{"q":"...","opts":["a","b","c","d"],"correct":0,"points":1,"topic":"..."}]}\n'
        "Dificultate progresivă. Include punctaj (1-3 puncte per item)."
    )
    msg = await client.messages.create(
        model=MODEL, max_tokens=3000, system=TUTOR_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_json(msg.content[0].text.strip(), fallback={"questions": _fallback_exam()})


async def generate_mnemonic(fact: str) -> str:
    """Generate a memory aid for a hard-to-remember fact."""
    if client is None:
        return ""
    msg = await client.messages.create(
        model=MODEL, max_tokens=200, system=TUTOR_SYSTEM,
        messages=[{"role": "user", "content": f"Creează un procedeu mnemonic scurt și memorabil pentru: {fact}"}],
    )
    return msg.content[0].text.strip()


def _parse_json(text: str, fallback: dict) -> dict:
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return fallback


def _fallback_lesson(topic_title: str) -> dict:
    return {
        "content_html": f"<h2>{topic_title}</h2><p>Conținut indisponibil (backend AI neconfigurat). Adaugă cheia API.</p>",
        "quiz": [],
    }


def _fallback_exam() -> list:
    return [{"q": "Backend AI neconfigurat.", "opts": ["—"], "correct": 0, "points": 0, "topic": ""}]
