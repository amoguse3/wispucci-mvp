# Wispucci — AI Tutor for Moldova 9th Grade Exams

> An AI-powered study companion that **teaches** (not just tests) students for Moldova's national exams (Clasa 9). Adaptive lessons, interleaved review, spaced repetition, exam simulation, and a friendly orb companion.

## Why Wispucci is different

Competitors (Notiqo, TesteBac, eBac) mostly **test** you: solve a test, get a grade. Wispucci **teaches** you through the full learning cycle:

- **Adaptive lessons** — explains differently when you're stuck (select any text → "Explică-mi altfel")
- **Micro-quizzes inside lessons** — retrieval practice beats re-reading 3x
- **Interleaving warm-ups** — a quick question from a prior topic before each new lesson
- **Spaced repetition** — FSRS-lite scheduler brings topics back right before you'd forget
- **Flexible streaks** — freeze tokens so a missed day doesn't punish you (better for ADHD/neurodivergent learners)
- **Exam simulation** — full ANCE-format test generated from your covered topics
- **AI Q&A** — ask anything about the current lesson, get guided (not spoon-fed) answers

## Architecture

```
Frontend (static, no build)          Backend (FastAPI + Claude)
┌─────────────────────────┐          ┌──────────────────────────┐
│ index.html              │          │ main.py    — API routes  │
│ style.css               │  HTTP    │ ai_tutor.py — Claude gen │
│ curriculum.js (seed)    │ ───────► │ scheduler.py — FSRS-lite │
│ app.js  (core logic)    │          │ auth.py    — JWT         │
│ features.js (exam, etc) │          │ models.py  — SQLAlchemy  │
│ api.js  (backend client)│          │ database.py — SQLite     │
│ integrations.js (wiring)│          └──────────────────────────┘
└─────────────────────────┘
```

The frontend works **standalone** (offline mode uses `curriculum.js` seed content). When the backend is running and the user logs in, it unlocks AI lesson generation, contextual Q&A, adaptive re-explain, exam generation, and cross-device progress sync.

## Run the frontend

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Works immediately in offline mode (seed curriculum, local progress).

## Run the backend (unlocks AI features)

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8801
```

With both running (frontend :8000, backend :8801), create an account in the app and the AI features light up automatically.

## File structure

```
.
├── index.html          # Markup + all views (welcome, subjects, topics, lesson, exam, review, stats)
├── style.css           # Full design system
├── curriculum.js       # Seed exam topics (Math, History, Romanian) from ANCE
├── app.js              # Core: navigation, orb, lessons, quizzes, warm-up, backend sync
├── features.js         # Interleaving, adaptive re-explain, exam simulation
├── api.js              # Backend API client (graceful offline fallback)
├── integrations.js     # Auth modal + exam button wiring
└── backend/
    ├── main.py         # FastAPI app + routes
    ├── ai_tutor.py     # Claude-powered lesson/Q&A/exam generation
    ├── scheduler.py    # FSRS-lite spaced repetition
    ├── auth.py         # Password hashing + JWT
    ├── models.py       # User, TopicProgress, QuizAttempt
    ├── database.py     # Async SQLAlchemy + SQLite
    ├── config.py       # Env settings
    ├── requirements.txt
    └── .env.example
```

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET  | `/api/auth/me` | Current user |
| POST | `/api/tutor/lesson` | Generate a lesson for a topic |
| POST | `/api/tutor/reexplain` | Re-explain a section differently |
| POST | `/api/tutor/ask` | Contextual Q&A |
| POST | `/api/tutor/exam` | Generate exam simulation |
| POST | `/api/tutor/mnemonic` | Memory aid for a fact |
| POST | `/api/progress/complete` | Mark topic done + schedule review |
| GET  | `/api/progress/due` | Topics due for review |
| GET  | `/api/progress/stats` | Progress stats |

Source: official ANCE exam program — https://ance.gov.md/clasa-sesiunea-examen/clasa-9

## Roadmap

- [ ] Complete all curriculum chapters
- [ ] Full FSRS-6 scheduler
- [ ] Mini-games for memorization
- [ ] Clasa 12 (BAC) support
- [ ] Leaderboard + social
- [ ] Voice tutor

## License

MIT
