#!/usr/bin/env bash
set -e

echo "→ Applying database migrations…"
alembic upgrade head

echo "→ Seeding database…"
python -m app.seed

echo "→ Starting API on :8000…"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
