"""Per-student, per-micro-skill mastery model.

This is the thing the MVP was missing: the bot knew 'topic done / not done'
but had NO model of *how good* a student is at each micro-skill, *what kind*
of mistakes they make, or whether they *understood* vs *guessed*.

Core = Bayesian Knowledge Tracing (BKT-lite): each skill has a probability
of being mastered, updated after every answer. On top we track:
  - error profile   (WHAT kind of mistake, not just that one happened)
  - confidence      (calibration: did they say 'sure' and get it wrong?)
  - prereq blame    (a miss propagates suspicion down to prerequisites)

See docs/STUDENT_MODEL.md for the math and rationale.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from time import time

from knowledge_graph import KnowledgeGraph


class ErrorType(str, Enum):
    SIGN = "sign_error"            # dropped/flipped a minus, (-2)^4 vs -2^4
    PROCEDURAL = "procedural"      # right idea, wrong steps/algorithm
    CONCEPTUAL = "conceptual"      # misunderstands the concept itself
    CARELESS = "careless"          # arithmetic slip, knew it
    PREREQUISITE = "prerequisite"  # failed because an earlier skill is missing
    UNKNOWN = "unknown"


@dataclass
class SkillState:
    skill_id: str
    p_mastery: float = 0.30
    attempts: int = 0
    correct: int = 0
    last_seen: float = 0.0
    # error histogram
    errors: dict[str, int] = field(default_factory=dict)
    # confidence calibration: list of (confidence 0-1, correct bool)
    calib_sum_conf_wrong: float = 0.0   # summed confidence on WRONG answers
    calib_wrong: int = 0
    calib_sum_conf_right: float = 0.0
    calib_right: int = 0

    def to_dict(self) -> dict:
        return self.__dict__.copy()

    @classmethod
    def from_dict(cls, d: dict) -> "SkillState":
        return cls(**d)

    @property
    def accuracy(self) -> float:
        return self.correct / self.attempts if self.attempts else 0.0

    @property
    def dominant_error(self) -> str | None:
        return max(self.errors, key=self.errors.get) if self.errors else None

    @property
    def overconfidence(self) -> float:
        """>0 means the student is confident when wrong (dangerous: false mastery)."""
        avg_conf_wrong = self.calib_sum_conf_wrong / self.calib_wrong if self.calib_wrong else 0.0
        return round(avg_conf_wrong, 3)


class StudentModel:
    """Holds one student's SkillState map and applies BKT updates."""

    def __init__(self, graph: KnowledgeGraph, states: dict[str, SkillState] | None = None):
        self.graph = graph
        d = graph.bkt_defaults
        self.p_transit = d.get("p_transit", 0.15)
        self.p_slip = d.get("p_slip", 0.10)
        self.p_guess = d.get("p_guess", 0.20)
        self.p_L0 = d.get("p_L0", 0.30)
        self.mastery_threshold = d.get("mastery_threshold", 0.95)
        self.states: dict[str, SkillState] = states or {}

    # ---- state access --------------------------------------------------
    def state(self, skill_id: str) -> SkillState:
        if skill_id not in self.states:
            self.states[skill_id] = SkillState(skill_id=skill_id, p_mastery=self.p_L0)
        return self.states[skill_id]

    def mastery_map(self) -> dict[str, float]:
        return {n: self.state(n).p_mastery for n in self.graph.nodes}

    # ---- the core update ----------------------------------------------
    def observe(
        self,
        skill_id: str,
        correct: bool,
        confidence: float | None = None,
        error_type: ErrorType | None = None,
        difficulty: int | None = None,
    ) -> None:
        """Update a skill after one answer (Bayesian Knowledge Tracing).

        p(mastery | evidence) then a chance-to-learn transition.
        slip = knew it but got it wrong; guess = didn't know but got it right.
        We scale slip/guess by difficulty so a hard-item guess counts less.
        """
        st = self.state(skill_id)
        st.attempts += 1
        st.last_seen = time()
        p = st.p_mastery
        slip, guess = self.p_slip, self.p_guess
        if difficulty:
            # harder item -> more likely a correct answer is real, a wrong one is a slip
            guess = max(0.05, guess - 0.03 * (difficulty - 3))
            slip = min(0.4, slip + 0.03 * (difficulty - 3))

        if correct:
            st.correct += 1
            posterior = (p * (1 - slip)) / (p * (1 - slip) + (1 - p) * guess)
        else:
            posterior = (p * slip) / (p * slip + (1 - p) * (1 - guess))
            if error_type:
                st.errors[error_type.value] = st.errors.get(error_type.value, 0) + 1

        # chance to learn on this exposure
        st.p_mastery = posterior + (1 - posterior) * self.p_transit
        st.p_mastery = min(0.999, max(0.001, st.p_mastery))

        # confidence calibration
        if confidence is not None:
            if correct:
                st.calib_sum_conf_right += confidence
                st.calib_right += 1
            else:
                st.calib_sum_conf_wrong += confidence
                st.calib_wrong += 1

        # prerequisite blame: a confident miss on a skill you 'should' know
        # lowers trust in its prerequisites so the diagnostic re-probes them.
        if not correct and (error_type == ErrorType.PREREQUISITE or (confidence or 0) > 0.6):
            for pr in self.graph.prereqs(skill_id):
                pst = self.state(pr)
                pst.p_mastery = max(0.05, pst.p_mastery * 0.85)

    # ---- recommendations ----------------------------------------------
    def next_to_learn(self, k: int = 3) -> list[str]:
        return self.graph.learning_path(self.mastery_map())[:k]

    def weak_topics(self, k: int = 5) -> list[tuple[str, float]]:
        return self.graph.weakest_links(self.mastery_map(), k=k)

    def exam_readiness(self) -> float:
        return self.graph.exam_readiness(self.mastery_map())

    def teaching_hint(self, skill_id: str) -> str:
        """Turn the error profile into an instruction for the tutor prompt."""
        st = self.state(skill_id)
        dom = st.dominant_error
        if dom == ErrorType.SIGN.value:
            return "Elevul greșește frecvent semnele. Insistă pe regula semnelor cu un exemplu numeric."
        if dom == ErrorType.CONCEPTUAL.value:
            return "Lipsă conceptuală. Schimbă unghiul/analogia, nu repeta aceeași explicație."
        if dom == ErrorType.PROCEDURAL.value:
            return "Ideea e corectă, pașii nu. Arată un worked example pas cu pas."
        if dom == ErrorType.PREREQUISITE.value:
            missing = ", ".join(self.graph.prereqs(skill_id)) or "prerechizitele"
            return f"Cauza probabilă e o lacună anterioară ({missing}). Întoarce-te acolo întâi."
        if st.overconfidence > 0.6:
            return "Elevul e sigur pe el dar greșește (mastery falsă). Pune o întrebare care sparge iluzia."
        return "Fără tipar clar de eroare încă. Continuă cu guess-first + podsказки затухающие."

    # ---- persistence helpers ------------------------------------------
    def serialize(self) -> dict:
        return {sid: st.to_dict() for sid, st in self.states.items()}

    @classmethod
    def deserialize(cls, graph: KnowledgeGraph, blob: dict) -> "StudentModel":
        states = {sid: SkillState.from_dict(d) for sid, d in (blob or {}).items()}
        return cls(graph, states)
