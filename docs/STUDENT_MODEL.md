# Student Model

## The gap it closes

Before: `TopicProgress` = 'done / not done'. That is not a model of skill.
The tutor had nothing to adapt to, so 'deep, personalized help' was theatre.

After: for every micro-skill in the graph the model tracks **how likely the
student has mastered it**, **what kind of mistakes they make**, and **whether
they actually understood or just guessed**.

## Core: Bayesian Knowledge Tracing (BKT-lite)

Each skill holds `p_mastery` (0-1). After each answer we do a Bayesian update
with four parameters (defaults in the graph JSON):

- `p_L0 = 0.30` — prior mastery before any evidence.
- `p_transit = 0.15` — chance of learning the skill on each exposure.
- `p_slip = 0.10` — chance of getting it wrong *despite* knowing it.
- `p_guess = 0.20` — chance of getting it right *without* knowing it.

**Correct answer:**
```
P(mastered | correct) = p·(1-slip) / [ p·(1-slip) + (1-p)·guess ]
```
**Wrong answer:**
```
P(mastered | wrong)   = p·slip     / [ p·slip     + (1-p)·(1-guess) ]
```
Then a learning step: `p' = posterior + (1 - posterior)·p_transit`.

`slip`/`guess` are scaled by item **difficulty**: a correct answer on a hard
item raises mastery more; a guess on a hard item counts for less.

Mastered when `p_mastery >= 0.95`.

## Beyond a single number

**Error profile.** Every wrong answer is typed (`ErrorType`): sign, procedural,
conceptual, careless, prerequisite. The *dominant* error drives the tutor's
tactic (`teaching_hint`): a conceptual gap → change the angle; a procedural
gap → show a worked example; a prerequisite miss → go back down the graph.
This is exactly the 'ladder', not 'the same thing but simpler'.

**Confidence calibration.** We log the student's stated confidence vs whether
they were right. High confidence + wrong = *false mastery*, the dangerous
state where a student feels fine and then fails the exam. `overconfidence`
surfaces it so the tutor can deliberately break the illusion.

**Prerequisite blame.** A confident miss on a skill lowers trust in its
prerequisites, so the diagnostic re-probes the real root cause instead of
drilling the surface symptom.

## API surface (`student_model.py`)

- `observe(skill, correct, confidence?, error_type?, difficulty?)` — the update.
- `mastery_map()` — `{skill: p_mastery}`.
- `next_to_learn(k)` / `weak_topics(k)` / `exam_readiness()`.
- `teaching_hint(skill)` — ready-to-inject instruction for the tutor prompt.
- `serialize / deserialize` — persistence via `skill_store.py`.

## Wiring into the existing tutor

`ai_tutor.reexplain()` currently hardcodes 'explică mai simplu'. Replace that
with `teaching_hint(skill)` so the re-explanation is driven by the *type* of
error, and feed `exam_readiness()` into the parent report (Faza 2 monetization).

## Next

- Auto-classify `ErrorType` from the student's wrong answer via the model
  (right now it's passed in by the caller / quiz metadata).
- Fold the existing FSRS-lite scheduler stability into `p_mastery` decay over
  time so mastery erodes realistically between sessions.
