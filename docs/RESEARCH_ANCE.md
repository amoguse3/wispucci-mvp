# ANCE Moldova — Research (source of truth for the KB)

> Scope of this pass: **Matematică, gimnaziu (clasa 9)**, national graduation exam (Examen Național de Absolvire a Gimnaziului). This is the class that is already ~built in the repo, so we finish it first before touching BAC (clasa 12). All facts below are pulled from the official agency, `ance.gov.md`, not from model memory.

## The authority

- **ANCE** = Agenția Națională pentru Curriculum și Evaluare (Ministerul Educației și Cercetării). It sets the program, writes the tests, and publishes the grading scheme (barem).
- Everything a tutor claims about "what is on the exam" must trace back to an ANCE document. Romanian sources (variante-mate.ro, subiecte.edu.ro, jitaruionel) are a **different country's** exam and must NOT be used as ground truth for Moldova.

## Exam structure — Matematică, clasa 9 (confirmed from 2025 base-session test)

- **Duration:** 120 minutes.
- **Items:** 12 items, mixed format — short-answer (fill-in boxes / casete) + full worked solutions (rezolvare desfășurată).
- **Grading:** partial credit **per step** (identify data → apply formula/algorithm → correct computation → final answer with unit). A wrong final answer with correct steps still earns points. Each item shows its point ladder, e.g. `L 0 1 2 3 4 5`.
- **Allowed:** blue pen, pencil, ruler, eraser. A **formula annex (Anexă)** is provided: `(a+b)² = a²+2ab+b²`, `(a-b)(a+b) = a²-b²`, area/volume formulas, etc.
- **Language:** ro / ru / en / fr versions exist.

## Specific competences assessed (from the official program, 2022)

1. Operating with real numbers to compute in varied contexts.
2. Expressing a reasoning / situation / solution in mathematical language.
3. Applying mathematical reasoning to identify and solve problems.
4. Investigating data sets with mathematical models.
5. Exploring geometric notions, relations and tools to solve problems.
6. Extrapolating mathematical achievements to explain processes across domains.
7. Justifying a step or a result through argumentation.

## Content domains (units) — the backbone of the knowledge graph

- **Mulțimi numerice:** N, Z, Q, R — divisibility, cmmdc/cmmmc, modul, ordering, powers.
- **Calcul algebric:** powers (natural/integer exponent), radicals (order 2), formule de calcul prescurtat, algebraic expressions.
- **Ecuații / inecuații / sisteme:** gr. I, gr. II (discriminant, Viète), linear systems, inequalities.
- **Funcții:** liniară, pătratică (vârf, zerouri, monotonie).
- **Geometrie plană:** triunghi (Pitagora, arii), patrulatere, cerc (unghi central/înscris, arii).
- **Corpuri geometrice:** paralelipiped, cilindru — volume (confirmed: 2025 item 10 mixes both).
- **Procente / proporții / organizare de date:** appears in applied problems (2025 item 4, item 8).

## Real exam evidence used to weight the graph

Sampled base + supplementary sessions 2022–2025. Recurring high-frequency item types:

- Powers + integer arithmetic in fill-in boxes (item 1 every year).
- Circle: central vs inscribed angle (2025 item 2).
- Function zeros / quadratic (2025 items 3, 12).
- Applied percentage problem (2025 item 4).
- Radical simplification proving an integer (2025 item 5).
- Quadratic equation, smallest real solution (2025 item 6).
- Linear system disguised as a word problem — vitamins, mixtures, ages (2025 item 8).
- Solid geometry volume comparison (2025 item 10).

## Source documents (all ance.gov.md)

- Program (Matematică, gimnaziu): `sites/default/files/09_programa_de_examen_matematica_ro.pdf`
- Program (older variant): `sites/default/files/09_matematica_programa_0.pdf`
- Test 2025 base session: `sites/default/files/09_mat_test_ro_sb25.pdf`
- Test 2025 supplementary: `sites/default/files/09_mat_test_ro_ss25.pdf`
- Test 2023 base: `sites/default/files/09_mat_test_ro_sb23.pdf`
- Test 2023 supplementary: `sites/default/files/09_mat_test_ro_ss23.pdf`
- Test 2022 supplementary: `sites/default/files/09_mat_test_ro_ss22.pdf`
- Session catalog (all subjects, all sessions): `clasa-sesiunea-examen/sesiunea-2025-0?field_categoriia_value=All`
- Practice tests 2026: `content/matematica-teste-pentru-exersare-gimnaziu-2026`

## BAC (clasa 12) — programs located, NOT yet ingested

Exam programs published at `content/programe-de-examene` for: Matematică (ro/ru), Istoria românilor și universală, Geografie, Biologie, Chimie, Fizică, Informatică, Limba și literatura română, plus profile subjects (Arte, Sport). These are the next ingestion target once clasa 9 math is verified and retention is proven.

## Hard limits of this research pass

- ANCE serves tests as PDFs; some older years and rus/other-language variants exist but were not all downloaded here. The ingest agent (see `agent/kb_ingest_agent.py`) is the mechanism to systematically pull + structure the rest.
- "Absolutely all past tests" is bounded by what ANCE keeps public; anything behind portals is out of reach and should be sourced from textbooks instead.
- Every KB unit produced from these sources must pass **human verification** before it is trusted in production. The pipeline never writes unverified content straight to the live KB.
