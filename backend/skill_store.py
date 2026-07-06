"""Persistence for the per-student skill mastery model.

The existing models.py has User / TopicProgress / QuizAttempt (topic-level,
'done / not done'). This adds the skill-level layer the tutor actually reasons
over. Kept in a separate table so it can ship without touching current schema.

Stored as one JSON blob per (user, subject, grade): the serialized
StudentModel state. Small, read/written once per session, easy to migrate
later to a normalized per-skill table if analytics need it.
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

try:
    from database import Base  # existing declarative base
except Exception:  # pragma: no cover - allows standalone import in tests
    from sqlalchemy.orm import DeclarativeBase

    class Base(DeclarativeBase):
        pass

from knowledge_graph import KnowledgeGraph
from student_model import StudentModel


class SkillMastery(Base):
    __tablename__ = "skill_mastery"
    __table_args__ = (UniqueConstraint("user_id", "subject", "grade", name
="uq_user_subject_grade"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(32), nullable=False)
    grade: Mapped[int] = mapped_column(Integer, nullable=False, default=9)
    state: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


async def load_model(session, user_id: int, subject: str = "math", grade: int = 9) -> StudentModel:
    """Load (or create) a StudentModel for a user from the DB."""
    from sqlalchemy import select

    graph = KnowledgeGraph.load(subject, grade)
    row = (
        await session.execute(
            select(SkillMastery).where(
                SkillMastery.user_id == user_id,
                SkillMastery.subject == subject,
                SkillMastery.grade == grade,
            )
        )
    ).scalar_one_or_none()
    if row is None:
        return StudentModel(graph)
    return StudentModel.deserialize(graph, row.state)


async def save_model(session, user_id: int, model: StudentModel, subject: str = "math", grade: int = 9) -> None:
    from sqlalchemy import select

    row = (
        await session.execute(
            select(SkillMastery).where(
                SkillMastery.user_id == user_id,
                SkillMastery.subject == subject,
                SkillMastery.grade == grade,
            )
        )
    ).scalar_one_or_none()
    blob = model.serialize()
    if row is None:
        session.add(SkillMastery(user_id=user_id, subject=subject, grade=grade, state=blob))
    else:
        row.state = blob
    await session.commit()
