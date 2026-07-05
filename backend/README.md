# Wispucci Backend

FastAPI server providing the AI tutor engine for Wispucci.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env          # then fill in your API key
```

Edit `.env` and add either an Anthropic or OpenAI key.

## Run

```bash
uvicorn main:app --reload --port 8801
```

API runs at `http://localhost:8801`. Health check: `GET /api/health`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/tutor/ask` | Answer a student question (Socratic) |
| POST | `/api/tutor/explain` | Re-explain a selected passage (simpler/example/analogy) |
| POST | `/api/tutor/lesson/generate` | Generate a full lesson + quiz for a topic |
| POST | `/api/tutor/warmup` | Interleaved retrieval questions from prior topics |
| POST | `/api/exam/simulate` | Generate an exam simulation (ANCE format) |
| POST | `/api/exam/grade` | Grade an open answer against a rubric |
| GET | `/api/health` | Health + LLM status |

## Offline / demo mode

If no API key is set, every endpoint returns a graceful `offline: true` payload
so the frontend keeps working for demos without a key.

## Frontend connection

The frontend `api.js` auto-detects the backend:
- Local dev: `http://localhost:8801`
- Production: set `window.WISPUCCI_API_BASE` before loading `app.js`

## Deploy

Works on Fly.io, Railway, Render, or any host that runs Python. Example (Fly):

```bash
fly launch --now
fly secrets set ANTHROPIC_API_KEY=sk-...
```
