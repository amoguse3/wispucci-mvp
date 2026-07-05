# Wispucci MVP — AI Tutor for Moldova 9th Grade Exams

> An AI-powered study companion that guides students through Moldova's national exam curriculum (Clasa 9). Adaptive lessons, quizzes, spaced repetition, and a friendly orb companion.

## What This Is

A working MVP prototype for Wispucci: an EdTech app that helps students prepare for the 3 national exams:

- **Matematică** — Numbers, Algebra, Functions, Geometry
- **Istoria românilor și universală** — From antiquity to independence
- **Limba și literatura română** — Grammar, Morphology, Syntax

Based on the official ANCE exam program: https://ance.gov.md/clasa-sesiunea-examen/clasa-9

## Features

- **Orb companion** with 6 emotional states (idle, happy, thinking, confused, sad, celebrating)
- **Real curriculum content** from Moldova's 9th grade exam program
- **Interactive quizzes** with instant feedback
- **Spaced repetition** — topics return for review after 2-3 lessons
- **Progress tracking** — streaks, accuracy, completion (localStorage)
- **AI ask bar** — ready for backend integration
- **Country clock** (Moldova timezone)
- **Ambient background** — subtle embers + aurora

## Run Locally

No install needed. Just serve the directory:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly in any modern browser.

## File Structure

```
.
├── index.html        # All markup and views
├── style.css         # Design system + all styles
├── app.js            # App logic, navigation, orb, quizzes
├── curriculum.js     # Exam topics and lesson content
└── README.md
```

## Architecture (for future backend)

The MVP is static (no server needed), but designed for easy backend integration:

1. **AI Tutor API** — Replace simulated responses in `handleAiQuestion()` with calls to OpenAI/Claude
2. **Lesson Generation** — Currently hardcoded content; backend can generate per-topic lessons dynamically
3. **Auth + Progress Sync** — Currently localStorage; add FastAPI + DB for persistence
4. **Spaced Repetition Engine** — Currently simple (review after N topics); upgrade to SM-2 / FSRS algorithm

### Recommended Backend Stack

- **FastAPI** (Python) for API
- **OpenAI / Claude API** for lesson generation + Q&A
- **PostgreSQL** for user data
- **Redis** for session/streak caching

## Design System

| Token | Value | Role |
|-------|-------|------|
| `--bg-base` | `#1B0928` | Midnight Violet background |
| `--accent` | `#EFDD8D` | Light Gold (CTAs, highlights) |
| `--accent-soft` | `#F4FDAF` | Lime Cream (text, hover) |
| `--success` | `#6FCF97` | Correct answers |
| `--error` | `#EB5757` | Wrong answers |

**Typography:** Inter (body) + Instrument Serif italic (display accents)

## Differentiation

Unlike competitors (Notiqo, TesteBac) that only **test** you, Wispucci **teaches** you:

- Adaptive lessons that explain differently when you're stuck
- Micro-quizzes inside lessons (retrieval practice)
- Interleaving: warm-up on prior topics before new ones
- Flexible streaks (no punishment for missed days — better for ADHD/neurodivergent learners)
- "Explain differently" mode
- Full exam simulation after completing a block

## Next Steps

- [ ] Backend API (FastAPI + AI generation)
- [ ] User accounts + progress sync
- [ ] More topics (complete all chapters)
- [ ] SM-2 / FSRS spaced repetition algorithm
- [ ] Mini-games for memorization
- [ ] Full exam simulation mode
- [ ] Support for Clasa 12 (BAC) exams

## License

MIT
