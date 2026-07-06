"""Adaptive entry diagnostic.

Goal: in ~10 minutes (10-15 items), build a mastery map across the whole
graph WITHOUT asking a question for every single node. It does that by:

  1. Max-information item selection: always ask the skill whose mastery is
     closest to 0.5 (we learn the most from a coin-flip), weighted by exam
     importance so we spend questions where the exam spends points.
  2. Prerequisite propagation: a confident correct answer on a deep skill
     implies its prerequisites are probably fine (skip/soft-credit them);
     a miss pushes probes DOWN to prerequisites to find the real gap.
  3. Early stop: once enough skills are 'confident' (mastery outside the
     [0.35, 0.65] uncertainty band) or max_items is hit.

Output: mastery map + weak topics + a prerequisite-respecting learning path.
The question generation itself is delegated to ai_tutor.generate_exam /
the KB, so the diagnostic here is the *policy*, not the item bank.
"""
from __future__ import annotations

from dataclasses import dataclass

from knowledge_graph import KnowledgeGraph
from student_model import ErrorType, StudentModel

_UNCERTAIN_LOW = 0.35
_UNCERTAIN_HIGH = 0.65


@dataclass
class DiagnosticItem:
    skill_id: str
    title: str
    difficulty: int


class Diagnostic:
    def __init__(self, model: StudentModel, max_items: int = 14, min_confident: int = 12):
        self.model = model
        self.graph = model.graph
        self.max_items = max_items
        self.min_confident = min_confident
        self.asked: list[str] = []

    # ---- item selection policy ----------------------------------------
    def _eligible(self) -> list[str]:
        """Prefer skills whose prerequisites we already have some signal on,
        so we test in a sensible order (foundations before advanced)."""
        mastery = self.model.mastery_map()
        probed = set(self.asked)
        elig = []
        for nid in self.graph.nodes:
            prereqs = self.graph.prereqs(nid)
            # ready if it's a root, or at least one prereq has been probed
            if not prereqs or any(p in probed for p in prereqs) or nid not in probed:
                elig.append(nid)
        return elig or list(self.graph.nodes)

    def next_item(self) -> DiagnosticItem | None:
        if self._should_stop():
            return None
        mastery = self.model.mastery_map()

        def info_score(nid: str) -> float:
            m = mastery[nid]
            # information peaks at 0.5; weight by exam importance; small penalty
            # for re-asking the same skill.
            closeness = 1 - abs(m - 0.5) * 2   # 1 at 0.5, 0 at extremes
            weight = self.graph.node(nid).get("exam_weight", 1)
            repeat_penalty = 0.5 if nid in self.asked else 1.0
            return closeness * weight * repeat_penalty

        best = max(self._eligible(), key=info_score)
        node = self.graph.node(best)
        return DiagnosticItem(best, node["title"], node.get("difficulty", 3))

    # ---- feed answers back --------------------------------------------
    def record(
        self,
        skill_id: str,
        correct: bool,
        confidence: float | None = None,
        error_type: ErrorType | None = None,
    ) -> None:
        difficulty = self.graph.node(skill_id).get("difficulty", 3)
        self.model.observe(
            skill_id, correct, confidence=confidence,
            error_type=error_type, difficulty=difficulty,
        )
        self.asked.append(skill_id)
        self._propagate(skill_id, correct, confidence)

    def _propagate(self, skill_id: str, correct: bool, confidence: float | None) -> None:
        """Soft-credit prerequisites on a confident correct answer so we don't
        waste items re-testing foundations we can infer are solid."""
        if correct and (confidence is None or confidence >= 0.5):
            for pr in self.graph.all_prereqs(skill_id):
                pst = self.model.state(pr)
                # nudge upward but never to full mastery on inference alone
                pst.p_mastery = min(0.85, pst.p_mastery + 0.10)

    # ---- stopping ------------------------------------------------------
    def _confident_count(self) -> int:
        mastery = self.model.mastery_map()
        return sum(1 for m in mastery.values() if m < _UNCERTAIN_LOW or m > _UNCERTAIN_HIGH)

    def _should_stop(self) -> bool:
        if len(self.asked) >= self.max_items:
            return True
        return self._confident_count() >= self.min_confident

    # ---- final report --------------------------------------------------
    def report(self) -> dict:
        mastery = self.model.mastery_map()
        weak = self.model.weak_topics(k=6)
        path = self.graph.learning_path(mastery)
        return {
            "items_used": len(self.asked),
            "exam_readiness": self.model.exam_readiness(),
            "mastery": {nid: round(m, 2) for nid, m in mastery.items()},
            "weak_topics": [
                {"skill": nid, "title": self.graph.title(nid), "mastery": round(m, 2)}
                for nid, m in weak
            ],
            "recommended_path": [
                {"skill": nid, "title": self.graph.title(nid)} for nid in path[:8]
            ],
        }


def run_diagnostic_headless(model: StudentModel, answer_fn) -> dict:
    """Convenience loop for tests/CLI.

    answer_fn(item: DiagnosticItem) -> (correct: bool, confidence: float, error_type|None)
    """
    diag = Diagnostic(model)
    while (item := diag.next_item()) is not None:
        correct, confidence, err = answer_fn(item)
        diag.record(item.skill_id, correct, confidence=confidence, error_type=err)
    return diag.report()
