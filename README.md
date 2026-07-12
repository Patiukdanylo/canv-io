<div align="center">

# Canv.io

**Realistic, repeatable mock exams in a familiar LMS interface — so students walk into the real exam already knowing the format and the material.**

*Practise the exam, not just the notes.*

</div>

---

## Status

| | |
|---|---|
| **Stage** | Full-stack build in progress, on top of a working offline prototype |
| **Backend** | FastAPI · PostgreSQL · SQLAlchemy + Alembic · JWT auth · Docker |
| **Frontend** | React 18 · TypeScript · Vite (`web/`), plus the original zero-dependency prototype (`app/`) |
| **Integrations** | Canvas LMS OAuth (encrypted token storage) · AI-assisted question generation |

## What it is

Canv.io is a focused study platform that does **one thing extremely well**: it lets students take **mock exams** that look and behave like the quizzes inside their university's learning-management system (LMS). Instead of revising passively from slides and PDFs, students **rehearse the real exam** — the same question mix, the same navigator, the same timer, the same "submit" — and get instant, explained feedback.

Every attempt draws **fresh questions from a bank**, so a single mock exam becomes an endless supply of "past papers." Multiple-choice, fill-in-the-blank and matching are graded automatically; essay questions show a model answer for honest self-grading. Results, scores and an attempt history are saved so students can track progress over time.

## Why it works

- **Familiarity removes exam-day surprise.** Most marks lost in theory exams come from format shock, not lack of knowledge.
- **Active recall + instant feedback** is one of the most evidence-backed ways to study.
- **Infinite, regenerating practice** beats a handful of fixed past papers.

## Document map

| File | What's inside |
|---|---|
| [`README.md`](README.md) | This overview — the official front page. |
| [`docs/BUSINESS_PLAN.md`](docs/BUSINESS_PLAN.md) | Full business plan: market, model, pricing, GTM, financials, risks, legal. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | The application & business logic: data model, grading rules, API, future build-out. |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phased plan from prototype → multi-university platform. |
| [`app/`](app/) | Working prototype (MVP-0) — the live, offline example of the product. |
| [`LICENSE.md`](LICENSE.md) | Licensing / IP position. |

## How it's built

```
backend/          FastAPI service
  app/api/        auth · courses · exams · Canvas OAuth endpoints
  app/core/       JWT issuing, password hashing, encrypted token storage
  app/models/     SQLAlchemy tables + Pydantic schemas
  app/services/   material ingestion, AI question generation, Canvas client
  alembic/        database migrations
  docker-compose.yml   API + PostgreSQL, one command to boot
web/              React 18 + TypeScript + Vite client
app/              original zero-dependency prototype (opens straight in a browser)
```

**Run the backend**
```bash
cd backend
cp .env.example .env      # fill in your own secrets
docker compose up --build # API + PostgreSQL, migrations and seeds applied
```

**Run the web client**
```bash
cd web && npm install && npm run dev
```

Grading, attempt history and question-bank regeneration live server-side; the
question bank is generated from uploaded course material and re-sampled on every
attempt, so each mock exam is a fresh paper rather than a fixed one.

## Vision in one line

> Turn *"I hope I'm ready"* into *"I've already taken this exam ten times"* — for any course, any study year, eventually any university.

---

<sub>Canv.io is an independent study tool. It is "LMS-*like*" by design but is not affiliated with, endorsed by, or a copy of any specific LMS vendor or university — see [`LICENSE.md`](LICENSE.md) and the legal section of the business plan.</sub>
