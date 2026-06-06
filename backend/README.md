# Canv.io API (backend)

FastAPI + Postgres service. Provides app authentication (JWT) and the data model
for courses, question banks, exams and attempts — and (later task) turns a
student's own Canvas materials into practice question banks.

> **Status:** foundation built & verified — containers, Postgres, full schema,
> Alembic migrations, seeders, secure JWT auth, encrypted Canvas-token storage.
> Canvas fetching + AI generation are stubbed.
>
> **📋 What's next & why → [`PLAN.md`](PLAN.md)** — the phased build plan
> (upload-first ingestion, AI generation, frontend integration, Canvas OAuth).

## Run it (Docker)
```bash
cd backend
cp .env.example .env        # then set strong secrets (see below)
docker compose up --build   # starts Postgres + API (+ Adminer)
```
- API:    http://localhost:8000  · interactive docs: http://localhost:8000/docs
- Adminer (DB UI): http://localhost:8080  (server `db`, user/db `canvio`)

On boot the API container runs **migrations** then the **seeder** automatically
(`entrypoint.sh`). Handy targets in the `Makefile`: `make up|down|logs|migrate|seed|psql`.

### Required secrets in `.env` (never commit it — it is gitignored)
- `POSTGRES_PASSWORD` + matching `DATABASE_URL`
- `JWT_SECRET` — long random string
- `CANVAS_TOKEN_ENC_KEY` — Fernet key:
  `python -c "from cryptography.fernet import Fernet;print(Fernet.generate_key().decode())"`

## Seeded accounts
| email | password | role |
|---|---|---|
| admin@canv.io | admin123 | admin |
| student@canv.io | student123 | student |

Plus a demo **Artificial Intelligence** course with a small question bank and a
"full" exam recipe.

## Auth API
| method | path | notes |
|---|---|---|
| POST | `/auth/register` | name/email/password → JWT |
| POST | `/auth/login` | email/password → JWT |
| GET | `/auth/me` | current user (Bearer token) |
| POST | `/canvas/connect` | store a personal Canvas token (encrypted) |
| GET | `/canvas/login` · `/canvas/callback` | OAuth2 (stub — needs Developer Key) |

## Data model (`app/models/db_models.py`)
`users` · `canvas_connections` (token encrypted at rest) · `courses` ·
`question_banks` · `questions` · `exams` (recipes) · `attempts` ·
`ingest_jobs` · `source_documents`.

## Security
- Passwords hashed with `pbkdf2_sha256` (passlib); swap to bcrypt/argon2 easily.
- App sessions via signed **JWT** (HS256).
- Canvas tokens encrypted with **Fernet** before storage; key only in `.env`.
- `.env` is gitignored; `.env.example` documents every variable.

## Migrations (Alembic)
```bash
docker compose exec api alembic revision --autogenerate -m "describe change"
docker compose exec api alembic upgrade head
```
Initial migration: `alembic/versions/7b21a1749d13_initial_schema.py`.

## Layout
```
backend/
├── docker-compose.yml · Dockerfile · entrypoint.sh · Makefile · .env.example
├── alembic/ (env.py, versions/)        # migrations
└── app/
    ├── main.py · config.py · db.py · seed.py
    ├── core/  security.py · deps.py     # hashing, JWT, encryption, auth deps
    ├── models/  db_models.py · schemas.py
    ├── api/  auth · canvas · courses · exams
    └── services/  canvas_client · ingestion · generator   # stubs (next task)
```
