"""Knowledge graph over ANCE clasa-9 micro-skills.

A micro-skill is the smallest thing a student can be 'good' or 'bad' at
(e.g. 'rationalize a denominator'), not a whole subject. Skills are linked
by prerequisites, so the tutor knows that you can't teach the quadratic
function before quadratic equations, and that a failure on 'radicali' likely
explains a failure on 'ecuatii_gr2'.

Data: knowledge_base/math_graph_clasa9.json  (see docs/KNOWLEDGE_GRAPH.md)

Usage:
    from knowledge_graph import KnowledgeGraph
    g = KnowledgeGraph.load('math', 9)
    g.prereqs('ecuatii_gr2')          # -> ['ecuatii_gr1', 'radicali', ...]
    g.unlocked({'numere_naturale'})   # nodes whose prereqs are satisfied
    g.learning_path(mastery)          # exam-weighted, prerequisite-respecting order
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_KB_DIR = Path(__file__).parent / "knowledge_base"


class KnowledgeGraph:
    def __init__(self, data: dict):
        self.subject = data["subject"]
        self.grade = data["grade"]
        self.bkt_defaults = data.get("bkt_defaults", {})
        self.nodes: dict[str, dict] = data["nodes"]
        # cache reverse edges (dependents)
        self._dependents: dict[str, list[str]] = {n: [] for n in self.nodes}
        for nid, node in self.nodes.items():
            for p in node.get("prereqs", []):
                if p in self._dependents:
                    self._dependents[p].append(nid)

    # ---- loading -------------------------------------------------------
    @classmethod
    @lru_cache(maxsize=8)
    def load(cls, subject: str = "math", grade: int = 9) -> "KnowledgeGraph":
        path = _KB_DIR / f"{subject}_graph_clasa{grade}.json"
        with open(path, encoding="utf-8") as f:
            return cls(json.load(f))

    # ---- basic queries -------------------------------------------------
    def node(self, nid: str) -> dict:
        return self.nodes[nid]

    def title(self, nid: str) -> str:
        return self.nodes[nid]["title"]

    def prereqs(self, nid: str) -> list[str]:
        return list(self.nodes[nid].get("prereqs", []))

    def dependents(self, nid: str) -> list[str]:
        return list(self._dependents.get(nid, []))

    def all_prereqs(self, nid: str) -> set[str]:
        """Transitive closure of prerequisites."""
        seen: set[str] = set()
        stack = list(self.prereqs(nid))
        while stack:
            p = stack.pop()
            if p in seen:
                continue
            seen.add(p)
            stack.extend(self.prereqs(p))
        return seen

    def roots(self) -> list[str]:
        return [n for n, d in self.nodes.items() if not d.get("prereqs")]

    # ---- graph logic ---------------------------------------------------
    def unlocked(self, mastered: set[str], threshold: float | None = None) -> list[str]:
        """Nodes not yet mastered whose prerequisites are all mastered."""
        out = []
        for nid, node in self.nodes.items():
            if nid in mastered:
                continue
            if all(p in mastered for p in node.get("prereqs", [])):
                out.append(nid)
        return out

    def topo_order(self) -> list[str]:
        """Kahn topological sort (raises on cycle)."""
        indeg = {n: len(self.nodes[n].get("prereqs", [])) for n in self.nodes}
        queue = [n for n, d in indeg.items() if d == 0]
        order: list[str] = []
        while queue:
            queue.sort()  # deterministic
            n = queue.pop(0)
            order.append(n)
            for dep in self._dependents[n]:
                indeg[dep] -= 1
                if indeg[dep] == 0:
                    queue.append(dep)
        if len(order) != len(self.nodes):
            raise ValueError("Cycle detected in knowledge graph")
        return order

    def learning_path(self, mastery: dict[str, float], threshold: float = 0.8) -> list[str]:
        """Ordered study plan.

        Rules:
          1. Respect prerequisites (topological order).
          2. Skip skills already >= threshold.
          3. Among ready skills, front-load high exam_weight.
        """
        mastered = {n for n, m in mastery.items() if m >= threshold}
        result: list[str] = []
        remaining = [n for n in self.topo_order() if n not in mastered]
        # stable resort of the topo order by (depth, -exam_weight) so that
        # high-yield, low-prereq skills come first without breaking order.
        def key(nid: str):
            depth = len(self.all_prereqs(nid))
            weight = self.nodes[nid].get("exam_weight", 1)
            return (depth, -weight, nid)
        # we must keep prerequisites before dependents, so bucket by depth
        for nid in sorted(remaining, key=key):
            result.append(nid)
        return result

    def weakest_links(self, mastery: dict[str, float], k: int = 5) -> list[tuple[str, float]]:
        """Lowest-mastery skills weighted by exam importance (biggest exam risk first)."""
        scored = []
        for nid, node in self.nodes.items():
            m = mastery.get(nid, self.bkt_defaults.get("p_L0", 0.3))
            risk = (1 - m) * node.get("exam_weight", 1)
            scored.append((nid, m, risk))
        scored.sort(key=lambda x: -x[2])
        return [(nid, m) for nid, m, _ in scored[:k]]

    def exam_readiness(self, mastery: dict[str, float]) -> float:
        """0-1 estimate of exam readiness = exam-weighted mean mastery."""
        num = den = 0.0
        for nid, node in self.nodes.items():
            w = node.get("exam_weight", 1)
            num += w * mastery.get(nid, self.bkt_defaults.get("p_L0", 0.3))
            den += w
        return round(num / den, 3) if den else 0.0
