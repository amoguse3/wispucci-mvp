"""
Wispucci Backend — FastAPI + AI tutor engine.

Endpoints:
  POST /api/tutor/ask                -- answer a student's question (Socratic, no direct answers)
  POST /api/tutor/explain            -- re-explain a selected passage more simply
  POST /api/tutor/lesson/generate    -- generate a full lesson for a topic
  POST /api/tutor/warmup             -- interleaved warm-up questions from prior topics
  POST /api/exam/simulate            -- generate an exam simulation in ANCE format
  POST /api/exam/grade               -- grade open-ended exam answers with rubric feedback
  GET  /api/health                   -- health check

AI provider: Anthropic Claude (default) or OpenAI, selected via LLM_PROVIDER env var.
Both are optional at runtime: if no key is set, endpoints return a graceful
'offline' payload so the frontend still works in demo mode.
"""

import os
import json
from typing import Optional, List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ----------------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------------
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()  # 'anthropic' | 'openai'
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

app = FastAPI(title="Wispucci Tutor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------------
# LLM call abstraction
# ----------------------------------------------------------------------------
def _has_llm() -> bool:
    if LLM_PROVIDER == "anthropic":
        return bool(ANTHROPIC_API_KEY)
    return bool(OPENAI_API_KEY)


def call_llm(system: str, user: str, max_tokens: int = 1200, json_mode: bool = False) -> str:
    """Single entry point for LLM calls. Returns raw text.
    Raises RuntimeError if no provider configured (callers handle fallback)."""
    if not _has_llm():
        raise RuntimeError("no_llm_configured")

    if LLM_PROVIDER == "anthropic":
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        msg = client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text

    # OpenAI
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)
    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        **kwargs,
    )
    return resp.choices[0].message.content


def _extract_json(text: str):
    """Best-effort JSON extraction from an LLM response."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    start = text.find("{")
    start_arr = text.find("[")
    if start_arr != -1 and (start == -1 or start_arr < start):
        start = start_arr
    if start != -1:
        text = text[start:]
    return json.loads(text)


# ----------------------------------------------------------------------------
# System prompt — the Wispucci tutor persona
# ----------------------------------------------------------------------------
TUTOR_PERSONA = (
    "You are Wispucci, a warm, patient AI tutor for Moldovan 9th grade students "
    "preparing for the national graduation exams (examene de absolvire a gimnaziului). "
    "You teach in Romanian. You follow the official ANCE curriculum. "
    "Your teaching principles: \n"
    "1. NEVER just give the final answer to a homework/quiz question. Guide with questions (Socratic).\n"
    "2. Break concepts into small steps. Check understanding before moving on.\n"
    "3. Use concrete, relatable examples. Prefer Moldovan/everyday context.\n"
    "4. Be encouraging but honest. Short sentences. No fluff.\n"
    "5. Adapt difficulty: if the student is confused, simplify and use an analogy.\n"
    "Always respond in Romanian unless the student writes in another language."
)


# ----------------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------------
class AskRequest(BaseModel):
    question: str
    topic_title: str = ""
    lesson_context: str = ""  # the lesson text the student is reading
    subject: str = ""


class ExplainRequest(BaseModel):
    passage: str  # the selected text
    topic_title: str = ""
    style: Literal["simpler", "example", "analogy"] = "simpler"


class GenerateLessonRequest(BaseModel):
    topic_title: str
    subject: str
    level: Literal["zero", "beginner", "medium", "advanced"] = "beginner"


class WarmupRequest(BaseModel):
    prior_topics: List[str] = Field(default_factory=list)
    subject: str = ""


class SimulateExamRequest(BaseModel):
    subject: str
    topics: List[str] = Field(default_factory=list)
    num_items: int = 8


class GradeRequest(BaseModel):
    subject: str
    question: str
    rubric: str = ""
    student_answer: str


# ----------------------------------------------------------------------------
# Endpoints
# ----------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "llm": _has_llm(), "provider": LLM_PROVIDER}


@app.post("/api/tutor/ask")
def tutor_ask(req: AskRequest):
    user = (
        f"Materia: {req.subject}\nTema: {req.topic_title}\n\n"
        f"Contextul lecției pe care o citește elevul:\n{req.lesson_context[:2000]}\n\n"
        f"Întrebarea elevului: {req.question}\n\n"
        "Răspunde ghidând elevul, fără a-i da direct soluția dacă e o problemă de rezolvat. "
        "Maxim 4-5 propoziții."
    )
    try:
        answer = call_llm(TUTOR_PERSONA, user, max_tokens=500)
        return {"answer": answer, "offline": False}
    except RuntimeError:
        return {
            "answer": (
                "Bună întrebare! (Mod demo: cheia AI nu e configurată.) "
                "Recitește secțiunea de mai sus și încearcă să identifici pasul care nu e clar, "
                "apoi întreabă-mă despre acel pas anume."
            ),
            "offline": True,
        }


@app.post("/api/tutor/explain")
def tutor_explain(req: ExplainRequest):
    style_map = {
        "simpler": "Explică mult mai simplu, ca pentru un începător total.",
        "example": "Explică folosind un exemplu concret, numeric sau din viața reală.",
        "analogy": "Explică folosind o analogie ușor de vizualizat.",
    }
    user = (
        f"Tema: {req.topic_title}\n\n"
        f"Pasajul selectat de elev (nu l-a înțeles):\n\"{req.passage[:1500]}\"\n\n"
        f"{style_map[req.style]} Maxim 4 propoziții."
    )
    try:
        answer = call_llm(TUTOR_PERSONA, user, max_tokens=400)
        return {"explanation": answer, "offline": False}
    except RuntimeError:
        return {
            "explanation": "(Mod demo) Aici Wispucci ar reformula acest pasaj mai simplu, cu un exemplu.",
            "offline": True,
        }


@app.post("/api/tutor/lesson/generate")
def generate_lesson(req: GenerateLessonRequest):
    level_map = {
        "zero": "de la zero, presupune că elevul nu știe nimic",
        "beginner": "nivel începător",
        "medium": "nivel mediu",
        "advanced": "nivel avansat",
    }
    user = (
        f"Generează o lecție pentru examenul de clasa 9.\n"
        f"Materia: {req.subject}\nTema: {req.topic_title}\nNivel: {level_map[req.level]}\n\n"
        "Returnează STRICT un JSON cu structura:\n"
        "{\n"
        '  "content_html": "<h2>...</h2><p>...</p> lecție scurtă (300-450 cuvinte) cu titluri h3, '
        'note în <div class=\'note\'>, formule în <span class=\'formula\'>",\n'
        '  "quiz": [ {"q": "...", "opts": ["a","b","c","d"], "correct": 0, "explanation": "..."}, ... 2-3 items ]\n'
        "}\n"
        "Textul lecției și quiz-ul în limba română. Fără text în afara JSON-ului."
    )
    try:
        raw = call_llm(TUTOR_PERSONA, user, max_tokens=1600, json_mode=True)
        data = _extract_json(raw)
        return {"lesson": data, "offline": False}
    except RuntimeError:
        return {"lesson": None, "offline": True, "message": "AI key not configured"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Lesson generation failed: {e}")


@app.post("/api/tutor/warmup")
def warmup(req: WarmupRequest):
    """Interleaved retrieval practice: 2-3 quick questions from prior topics."""
    if not req.prior_topics:
        return {"questions": [], "offline": not _has_llm()}
    user = (
        f"Materia: {req.subject}\n"
        f"Teme învățate anterior: {', '.join(req.prior_topics)}\n\n"
        "Creează 2 întrebări scurte de recapitulare (retrieval practice) din aceste teme, "
        "pentru a reactiva memoria înainte de o temă nouă. "
        "Returnează STRICT JSON: {\"questions\": [{\"q\":\"...\",\"opts\":[..4..],\"correct\":0,\"explanation\":\"...\"}]}"
    )
    try:
        raw = call_llm(TUTOR_PERSONA, user, max_tokens=800, json_mode=True)
        data = _extract_json(raw)
        return {"questions": data.get("questions", []), "offline": False}
    except RuntimeError:
        return {"questions": [], "offline": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Warmup failed: {e}")


@app.post("/api/exam/simulate")
def simulate_exam(req: SimulateExamRequest):
    """Generate an exam-format simulation matching ANCE structure."""
    user = (
        f"Materia: {req.subject}\n"
        f"Teme de acoperit: {', '.join(req.topics) if req.topics else 'toată programa'}\n"
        f"Număr de itemi: {req.num_items}\n\n"
        "Generează o simulare de examen în formatul examenului național de absolvire a gimnaziului (ANCE, Moldova). "
        "Amestecă itemi cu variantă multiplă și itemi cu răspuns scurt. "
        "Returnează STRICT JSON: {\"items\": [{\"type\":\"multiple|open\", \"q\":\"...\", "
        "\"opts\":[..], \"correct\":0, \"points\":1, \"rubric\":\"pentru open\"}]}"
    )
    try:
        raw = call_llm(TUTOR_PERSONA, user, max_tokens=2000, json_mode=True)
        data = _extract_json(raw)
        return {"exam": data, "offline": False}
    except RuntimeError:
        return {"exam": None, "offline": True, "message": "AI key not configured"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Exam simulation failed: {e}")


@app.post("/api/exam/grade")
def grade_answer(req: GradeRequest):
    """Grade an open-ended answer against a rubric, returning score + feedback."""
    user = (
        f"Materia: {req.subject}\n"
        f"Întrebare: {req.question}\n"
        f"Barem/criterii: {req.rubric or 'evaluează corectitudinea și completitudinea'}\n"
        f"Răspunsul elevului: {req.student_answer}\n\n"
        "Evaluează răspunsul. Returnează STRICT JSON: "
        "{\"score\": 0-10, \"feedback\": \"ce e bine, ce lipsește, cum să îmbunătățească\"}"
    )
    try:
        raw = call_llm(TUTOR_PERSONA, user, max_tokens=600, json_mode=True)
        data = _extract_json(raw)
        return {"result": data, "offline": False}
    except RuntimeError:
        return {"result": {"score": None, "feedback": "(Mod demo) Aici AI-ul ar evalua răspunsul tău."}, "offline": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Grading failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8801, reload=True)
