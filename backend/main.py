"""Wispucci backend API.

Run locally:
    cd backend
    pip install -r requirements.txt
    cp .env.example .env  # then add your ANTHROPIC_API_KEY
    uvicorn main:app --reload --port 8801
"""
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db, init_db
import models
import auth
import ai_tutor
import scheduler

app = FastAPI(title="Wispucci API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok", "ai_configured": bool(settings.anthropic_api_key)}


# ============ AUTH ============
class SignupBody(BaseModel):
    email: EmailStr
    display_name: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    display_name: str


@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(body: SignupBody, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(models.User).where(models.User.email == body.email))
    if existing:
        raise HTTPException(400, "Există deja un cont cu acest email")
    user = models.User(
        email=body.email,
        display_name=body.display_name,
        hashed_password=auth.hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return AuthResponse(access_token=auth.create_access_token(user.id), display_name=user.display_name)


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(models.User).where(models.User.email == form.username))
    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Email sau parolă incorectă")
    return AuthResponse(access_token=auth.create_access_token(user.id), display_name=user.display_name)


@app.get("/api/auth/me")
async def me(user: models.User = Depends(auth.get_current_user)):
    return {"id": user.id, "email": user.email, "display_name": user.display_name,
            "streak": user.streak_current, "freeze_tokens": user.freeze_tokens}


# ============ TUTOR ============
class LessonBody(BaseModel):
    subject: str
    topic_title: str
    level: int = 1


@app.post("/api/tutor/lesson")
async def lesson(body: LessonBody, user: models.User = Depends(auth.get_current_user)):
    return await ai_tutor.generate_lesson(body.subject, body.topic_title, body.level)


class ReexplainBody(BaseModel):
    topic_title: str
    section: str
    prior_attempt: str = ""


@app.post("/api/tutor/reexplain")
async def reexplain(body: ReexplainBody, user: models.User = Depends(auth.get_current_user)):
    return {"text": await ai_tutor.reexplain(body.topic_title, body.section, body.prior_attempt)}


class AskBody(BaseModel):
    topic_title: str
    lesson_context: str
    question: str


@app.post("/api/tutor/ask")
async def ask(body: AskBody, user: models.User = Depends(auth.get_current_user)):
    return {"text": await ai_tutor.answer_question(body.topic_title, body.lesson_context, body.question)}


class ExamBody(BaseModel):
    subject: str
    topics: list[str]
    num_questions: int = 10


@app.post("/api/tutor/exam")
async def exam(body: ExamBody, user: models.User = Depends(auth.get_current_user)):
    return await ai_tutor.generate_exam(body.subject, body.topics, body.num_questions)


class MnemonicBody(BaseModel):
    fact: str


@app.post("/api/tutor/mnemonic")
async def mnemonic(body: MnemonicBody, user: models.User = Depends(auth.get_current_user)):
    return {"text": await ai_tutor.generate_mnemonic(body.fact)}


# ============ PROGRESS ============
class CompleteBody(BaseModel):
    topic_id: str
    correct: int = 0
    total: int = 0


@app.post("/api/progress/complete")
async def complete_topic(body: CompleteBody, user: models.User = Depends(auth.get_current_user),
                         db: AsyncSession = Depends(get_db)):
    tp = await db.scalar(select(models.TopicProgress).where(
        models.TopicProgress.user_id == user.id,
        models.TopicProgress.topic_id == body.topic_id))
    if tp is None:
        tp = models.TopicProgress(user_id=user.id, topic_id=body.topic_id)
        db.add(tp)
    tp.completed = True
    rating = scheduler.rating_from_quiz(body.correct, body.total)
    scheduler.schedule(tp, rating)

    if body.total > 0:
        db.add(models.QuizAttempt(user_id=user.id, topic_id=body.topic_id,
                                  correct=body.correct, total=body.total))
    _update_streak(user)
    await db.commit()
    return {"ok": True, "next_review": tp.due_at.isoformat(), "streak": user.streak_current}


@app.get("/api/progress/due")
async def due_reviews(user: models.User = Depends(auth.get_current_user),
                      db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    rows = await db.scalars(select(models.TopicProgress).where(
        models.TopicProgress.user_id == user.id,
        models.TopicProgress.completed == True,  # noqa: E712
        models.TopicProgress.due_at <= now))
    return {"due": [r.topic_id for r in rows]}


@app.get("/api/progress/stats")
async def stats(user: models.User = Depends(auth.get_current_user),
                db: AsyncSession = Depends(get_db)):
    completed = await db.scalars(select(models.TopicProgress).where(
        models.TopicProgress.user_id == user.id,
        models.TopicProgress.completed == True))  # noqa: E712
    completed_list = list(completed)
    attempts = await db.scalars(select(models.QuizAttempt).where(
        models.QuizAttempt.user_id == user.id))
    attempts_list = list(attempts)
    total_correct = sum(a.correct for a in attempts_list)
    total_q = sum(a.total for a in attempts_list)
    return {
        "lessons": len(completed_list),
        "quizzes": len(attempts_list),
        "accuracy": round(total_correct / total_q * 100) if total_q else None,
        "streak": user.streak_current,
        "completed_topics": [t.topic_id for t in completed_list],
    }


def _update_streak(user: models.User):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    if user.streak_last_date == today:
        return
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    if user.streak_last_date == yesterday:
        user.streak_current += 1
    elif user.streak_last_date and user.streak_last_date < yesterday:
        # missed day(s) — spend a freeze token if available (flexible streak)
        if user.freeze_tokens > 0:
            user.freeze_tokens -= 1
            user.streak_current += 1
        else:
            user.streak_current = 1
    else:
        user.streak_current = 1
    user.streak_last_date = today
