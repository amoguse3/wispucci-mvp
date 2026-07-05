# Wispucci — Research & Strategy

> Competitor landscape, differentiation, and Gen Z retention mechanics. This is the thinking behind the product.

---

## 1. Competitor Landscape

### Direct competitor (Moldova)

**Notiqo.io** — launched May 2026, 4000+ users, 5000+ tests, 12 schools onboarded.
- Model: student takes a full exam-format test → AI (Claude) grades in 10-30s → score + feedback
- Covers BAC, grade 9, grade 4. Subjects: Romanian, History, Math, English, Geography
- Pricing: free (5 tests/mo), 990 MDL/year Pro, 49 MDL single exam
- **Weakness:** it's an *assessment* tool, not a *learning* tool. You take a test, get a grade. If you don't know the topic, it tells you to "review" — but doesn't teach.

### Regional (Romania)

| App | Model | Weakness |
|-----|-------|----------|
| eBac.ro | Lectures + quizzes + visual structures | Static content, no adaptivity |
| TesteBac.ro | Grid tests, free | Tests only, zero explanation |
| SelfBac | Write essays → AI grades | Only BAC Romanian, narrow scope |
| BacPath | Program + exercises + tracker | No AI, just a problem bank |
| EduBac | Video lectures + tests | YouTube-style passive consumption |
| Saro (Digital Nation, Google.org, EUR 1M) | Photo notebook → AI explains step by step, Socratic | Homework helper, not structured exam prep, no exam program |

### Global

| App | Model | Weakness |
|-----|-------|----------|
| Quizlet | Flashcards + Learn + AI (ChatGPT integration Mar 2026) | Surface-level memorization |
| Anki | FSRS-6 spaced repetition | Terrible UX, hardcore only |
| ChatGPT Study Mode | Conversational tutoring | No structure, no exam program, easy to drift |
| Duolingo | Gamification + adaptivity | Languages only, criticized for "illusion of learning" |
| PrepAiro | AI tutor + voice + canvas | Hard exams (IB, GRE, GMAT), not school-level |
| Exetasy / StudyScore AI | Upload → AI generates tests | University / English-test focused |

### The core pattern

Everyone does **one of three things:**
1. **Test you** (Notiqo, TesteBac) — "solve a test, get a grade"
2. **Cram** (Quizlet, Anki) — flashcards, spaced repetition of facts
3. **Answer questions** (Saro, ChatGPT) — "ask what you don't get"

**Nobody does the full learning cycle:** teach a topic from zero → check → adapt → bring it back later → confirm mastery. **That's the gap.**

---

## 2. Differentiation — "A tutor, not a test"

> Notiqo grades. Wispucci teaches. Use Wispucci to prepare, then take the exam simulation.

| Feature | Why it works (evidence) | Who else does it |
|---------|------------------------|------------------|
| Adaptive lessons that re-explain when you're stuck | Elaborative interrogation boosts retention | Nobody in region |
| Micro-quizzes *inside* lessons (not after) | Retrieval practice beats re-reading ~3x | Duolingo (no exams) |
| Interleaving — random review of old topics before new ones | Nature 2025: spacing + interleaving > blocking | Anki (no context) |
| Flexible streaks (no punishment for missed days) | UBC 2026: rigid systems harm neurodivergent users | Nobody |
| "Explain differently" mode | Socratic method | Saro (no structure) |
| Full exam simulation after a block | What Notiqo does, but you're *ready* for it | Notiqo (doesn't teach first) |
| AI mnemonics + visualization for dates/formulas | Dual coding theory | Nobody with AI |

### Learning science that actually works (research 2024-2026)

1. **Spaced repetition** — reviewing at increasing intervals; spacing beats cramming ~2x
2. **Retrieval practice** — pulling from memory (testing) works ~3x better than re-reading
3. **Interleaving** — mixing topic types (not in blocks) improves transfer
4. **"Counting days" incentive** (Nature 2025) — rewarding days studied (not questions answered) → more even studying, better scores, *especially for weaker students*
5. **Elaborative interrogation** — asking "why is this so?" builds connections
6. **Neurodivergent (ADHD/ASD):** rigid timers & Forest-style blocking *hurt*. Need flexibility, short sessions, variability, right to pause without penalty.

---

## 3. Gen Z Retention Mechanics (research 2026)

### Hard facts

- 32% of Gen Z report "app fatigue" — deleting more than they install
- They install ~20% fewer apps, but open the survivors ~20% more. **An install is the start of a 72-hour audition.**
- They abandon at ~3.7 seconds of friction
- Freemium avg conversion 2-5%; top quartile hits 10-25% via free-tier *architecture*, not generosity

### What works

1. **Try-before-signup ("aha" in under 5 min).** Notion, Figma, Linear activate users *before* signup. Deliver value first, register later.
2. **Strategic friction** (not zero friction). A little effort builds habit and lifts LTV. ("Learning through sweat and motivation" is scientifically sound.)
3. **In-app engagement > push/email.** AI filters push & email — they're dying. Everything lives *inside* the app: streak, progress, next-step.
4. **Bite-sized, one action per screen.** TikTok-trained attention can't take long scroll. One idea per screen.
5. **Game-design principles** (not fake gamification). BITKRAFT: EdTech + AI + game mechanics = top vertical 2026. Adaptive, rewarding, relevant.
6. **Social/leaderboards carefully.** Great for competitive users, harmful for ADHD/anxious ones. Make leaderboards *optional* + add cooperative mechanics (study with a friend), not just ranking.

---

## 4. Positioning

> **Notiqo tests. Wispucci teaches. Learn with Wispucci, then pass the exam simulation.**

Or better: do both (teaching + exam simulation) so users don't need a second app.

---

## 5. Retention features shipped in v2 prototype

- **Try-before-signup** — learn 2-3 min, finish a topic, then a soft signup wall (skippable)
- **Single-screen lessons** — one card per step (concept → rule → example → quiz), no scroll
- **Random interleaved review** — an old topic's quiz reappears before a new lesson every random 2-4 lessons
- **Persistent orb companion** — always on screen, flies between views, speaks tips and highlights relevant text in warm gold
- **User highlighting** — select text → orb "remembers it as important" → shows in analytics
- **Flexible streak** — 7-day view, no harsh punishment framing
- **Analytics** — per-subject progress bars, accuracy, streak, your highlights
- **Glass landing site** — hero + frosted exam cards, smooth animations
