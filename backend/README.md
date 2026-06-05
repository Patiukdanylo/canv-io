# Canv.io API (backend)

FastAPI service that turns a student's **own Canvas course materials** into
practice question banks for the Canv.io exam app.

> **Status:** skeleton / scaffolding. Routes and services are stubbed with the
> real shapes and data flow; business logic is `TODO`.

## Why Python/FastAPI
The core work is Canvas API calls + document parsing (PDF/PPTX) + LLM
generation — Python has the strongest ecosystem for all three. (Node/TS or Go
are viable alternatives; this is swappable.)

## The pipeline
```
Canvas (OAuth2)  ──►  fetch courses / files / pages   (services/canvas_client.py)
                      │
                      ▼
                 extract text + chunk                 (services/ingestion.py)
                      │
                      ▼
                 LLM → question bank (reviewed)        (services/generator.py)
                      │
                      ▼
                 schemas.CourseBank  ──►  exam app (public/app) consumes it
```

## Canvas access — important
- Canvas (Instructure) has an **official REST API** — we use it, never scraping.
- A **multi-user product must use OAuth2** (Canvas API policy); personal access
  tokens are for local dev only.
- OAuth2 needs a **Developer Key approved by Thomas More's Canvas admin**. A
  student can connect their *own* account and we process *their* materials for
  *their* use — we do **not** redistribute institutional content. See the legal
  section in `../docs/BUSINESS_PLAN.md`.

## Layout
```
app/
├── main.py                 # FastAPI app, CORS, routers, /health
├── config.py               # env settings (.env)
├── api/  auth · courses · exams
├── services/  canvas_client · ingestion · generator
└── models/schemas.py       # Question / ExamRecipe / Course / CourseBank
```

## Run (dev)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in Canvas + LLM keys
uvicorn app.main:app --reload
```
