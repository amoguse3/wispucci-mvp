# Knowledge Graph

## Why it exists

The MVP treated a subject as a flat list of topics. Real understanding is a
**dependency graph**: you can't get the quadratic *function* if you can't
solve quadratic *equations*, which needs *radicals*, which needs *powers*.
Without this, the bot can't reason about *why* a student is stuck, it can
only see that they are.

The graph is the spine everything else hangs on: the student model tracks
mastery per node, the diagnostic walks the graph to find gaps efficiently,
and the tutor uses prerequisites to explain the *real* blocker instead of
re-explaining the surface topic.

## Structure

Each node is a **micro-skill** (see `backend/knowledge_base/math_graph_clasa9.json`):

| field | meaning |
|---|---|
| `title` | human label (ro) |
| `domain` | ANCE content domain grouping |
| `kb_unit` | key into `math_clasa9.json` for facts/formulas (`null` = to be authored) |
| `prereqs` | node ids that must be reasonably mastered first |
| `exam_weight` | 1-5, how heavily it appears on real ANCE tests (2022-2025) |
| `difficulty` | 1-5 baseline item difficulty |
| `bac_link` | the clasa-12 BAC topic it feeds into (forward-looking) |

The graph is a DAG. `KnowledgeGraph.topo_order()` enforces no cycles.

## What the engine gives you (`knowledge_graph.py`)

- `prereqs / dependents / all_prereqs` — navigate dependencies.
- `unlocked(mastered)` — what's ready to learn next.
- `learning_path(mastery)` — ordered plan: respects prerequisites, skips
  mastered skills, front-loads high `exam_weight`.
- `weakest_links(mastery)` — biggest exam risk = `(1 - mastery) * exam_weight`.
- `exam_readiness(mastery)` — one 0-1 number: exam-weighted mean mastery.

## Current coverage (math, clasa 9)

20 nodes across: mulțimi numerice, calcul algebric, ecuații/inecuații,
funcții, geometrie plană, geometrie spațială, organizare de date.
Nodes with `kb_unit: null` (numere_reale, formule_calcul_prescurtat,
expresii_algebrice, procente_proportii, corpuri_geometrice, organizare_date)
are the immediate targets for the ingest agent.

## Next

- Author the 6 missing `kb_unit`s via the ingest agent.
- Clone the pattern for `math_graph_clasa12.json` (BAC) once retention proves out.
- Move `exam_weight` from hand-estimated to **measured** by tagging every
  ingested past-test item to a node and counting frequency.
